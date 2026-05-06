import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FileText, DollarSign } from "lucide-react";
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
      <DialogContent className="bg-card border-border text-card-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Create Quote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={saveQuote} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quote #</Label>
              <Input value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} className="bg-muted border-border font-mono" required />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted border-border" placeholder="Proposal for Enterprise License" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deal (optional)</Label>
              <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
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
              <Label>Valid Until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="bg-muted border-border" />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="bg-muted border-border" min="0" max="100" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-primary hover:text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                No items yet. Add your first line item above.
              </div>
            )}

            {items.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={item.product_id} onValueChange={(v) => updateItem(index, { product_id: v })}>
                    <SelectTrigger className="bg-card border-border flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — ${(p.unit_price || 0).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} className="bg-card border-border" placeholder="Description" />
                <div className="grid grid-cols-4 gap-2">
                  <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 0 })} className="bg-card border-border" placeholder="Qty" />
                  <Input type="number" value={item.unit_price} onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })} className="bg-card border-border" placeholder="Price" />
                  <Input type="number" value={item.discount_percent} onChange={(e) => updateItem(index, { discount_percent: parseFloat(e.target.value) || 0 })} className="bg-card border-border" placeholder="Discount %" />
                  <div className="flex items-center justify-end text-sm text-foreground font-medium">
                    ${calculateItemTotal(item).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-muted border border-border space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%)</span>
              <span className="text-foreground">${taxAmount.toLocaleString()}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">Total</span>
              <span className="text-lg font-semibold text-primary">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-muted border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 min-h-[60px] resize-y" placeholder="Additional notes for the customer..." />
          </div>

          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full bg-muted border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 min-h-[60px] resize-y" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Create Quote
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}