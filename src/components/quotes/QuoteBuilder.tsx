import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FileText, DollarSign, Percent, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

interface Product {
  id: string;
  name: string;
  unit_price: number;
  description: string | null;
}

interface QuoteItemInput {
  id?: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
}

interface QuoteBuilderProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dealId?: string | null;
  contactId?: string | null;
}

export function QuoteBuilder({ open, onClose, onSuccess, dealId, contactId }: QuoteBuilderProps) {
  const { organizationId } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);

  const [quoteNumber, setQuoteNumber] = useState("");
  const [title, setTitle] = useState("");
  const [selectedContact, setSelectedContact] = useState(contactId || "");
  const [selectedDeal, setSelectedDeal] = useState(dealId || "");
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Net 30. Payment due within 30 days of invoice.");
  const [items, setItems] = useState<QuoteItemInput[]>([]);

  useEffect(() => {
    if (open) {
      fetchData();
      generateQuoteNumber();
      if (contactId) setSelectedContact(contactId);
      if (dealId) setSelectedDeal(dealId);
    }
  }, [open, contactId, dealId]);

  async function fetchData() {
    const [{ data: p }, { data: c }, { data: d }] = await Promise.all([
      supabase.from("products").select("id, name, unit_price, description").eq("is_active", true).order("name"),
      supabase.from("contacts").select("id, first_name, last_name").order("first_name"),
      supabase.from("deals").select("id, name").eq("status", "open").order("name"),
    ]);
    setProducts(p || []);
    setContacts(c || []);
    setDeals(d || []);
  }

  function generateQuoteNumber() {
    const prefix = "Q";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    setQuoteNumber(`${prefix}-${timestamp}-${random}`);
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { product_id: "", description: "", quantity: 1, unit_price: 0, discount_percent: 0 },
    ]);
  }

  function updateItem(index: number, updates: Partial<QuoteItemInput>) {
    setItems((prev) => {
      const updated = prev.map((item, i) => (i === index ? { ...item, ...updates } : item));
      if (updates.product_id) {
        const product = products.find((p) => p.id === updates.product_id);
        if (product) {
          updated[index] = {
            ...updated[index],
            description: product.description || product.name,
            unit_price: product.unit_price || 0,
          };
        }
      }
      return updated;
    });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function calculateItemTotal(item: QuoteItemInput) {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * (item.discount_percent / 100);
    return Math.round((subtotal - discount) * 100) / 100;
  }

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const taxAmount = Math.round(subtotal * (parseFloat(taxRate) / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  async function saveQuote(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    try {
      setLoading(true);

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          quote_number: quoteNumber,
          title: title || null,
          deal_id: selectedDeal || null,
          contact_id: selectedContact || null,
          status: "draft",
          subtotal,
          tax_rate: parseFloat(taxRate) || 0,
          tax_amount: taxAmount,
          total,
          valid_until: validUntil || null,
          notes: notes || null,
          terms: terms || null,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      const quoteItems = items.map((item) => ({
        quote_id: quoteData.id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        total: calculateItemTotal(item),
        organization_id: organizationId,
      }));

      const { error: itemsError } = await supabase.from("quote_items").insert(quoteItems);
      if (itemsError) throw itemsError;

      toast.success("Quote created successfully");
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error("Failed to create quote: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setQuoteNumber("");
    setTitle("");
    setSelectedContact("");
    setSelectedDeal("");
    setValidUntil("");
    setTaxRate("0");
    setNotes("");
    setTerms("Net 30. Payment due within 30 days of invoice.");
    setItems([]);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#6452db]" />
            Create Quote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={saveQuote} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Quote #</Label>
              <Input value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} className="bg-[#0b0d10] border-white/10 text-white font-mono" required />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Proposal for Enterprise License" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Deal (optional)</Label>
              <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                  {deals.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Valid Until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="bg-[#0b0d10] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Tax Rate (%)</Label>
              <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="bg-[#0b0d10] border-white/10 text-white" min="0" max="100" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/70">Line Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-[#6452db] hover:text-[#6452db] hover:bg-[#6452db]/10">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-6 text-sm text-white/40 border border-dashed border-white/10 rounded-md">
                No items yet. Add your first line item above.
              </div>
            )}

            {items.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-[#0b0d10] border border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={item.product_id} onValueChange={(v) => updateItem(index, { product_id: v })}>
                    <SelectTrigger className="bg-[#18191b] border-white/10 text-white flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — ${(p.unit_price || 0).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-white/30 hover:text-[#be6464] h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} className="bg-[#18191b] border-white/10 text-white" placeholder="Description" />
                <div className="grid grid-cols-4 gap-2">
                  <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 0 })} className="bg-[#18191b] border-white/10 text-white" placeholder="Qty" />
                  <Input type="number" value={item.unit_price} onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })} className="bg-[#18191b] border-white/10 text-white" placeholder="Price" />
                  <Input type="number" value={item.discount_percent} onChange={(e) => updateItem(index, { discount_percent: parseFloat(e.target.value) || 0 })} className="bg-[#18191b] border-white/10 text-white" placeholder="Discount %" />
                  <div className="flex items-center justify-end text-sm text-white font-medium">
                    ${calculateItemTotal(item).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="text-white">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Tax ({taxRate}%)</span>
              <span className="text-white">${taxAmount.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-white">Total</span>
              <span className="text-lg font-semibold text-[#ff8964]">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Notes</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#0b0d10] border border-white/10 rounded-md p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50 min-h-[60px] resize-y" placeholder="Additional notes for the customer..." />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Terms & Conditions</Label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full bg-[#0b0d10] border border-white/10 rounded-md p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50 min-h-[60px] resize-y" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-[#6452db] text-white hover:bg-[#6452db]/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Create Quote
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/70 hover:text-white">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}