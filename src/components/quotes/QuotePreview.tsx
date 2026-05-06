import { FileText, DollarSign, Calendar, User, Building2, CheckCircle2, XCircle, Send, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total: number;
  products: { name: string } | null;
}

interface Quote {
  id: string;
  quote_number: string;
  title: string | null;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  created_at: string;
  contacts: { first_name: string; last_name: string; company: string | null; email: string | null } | null;
  deals: { name: string } | null;
}

interface QuotePreviewProps {
  quote: Quote | null;
  items: QuoteItem[];
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  sent: "bg-[#5683da]/20 text-[#5683da]",
  accepted: "bg-[#8dc572]/20 text-[#8dc572]",
  rejected: "bg-[#be6464]/20 text-[#be6464]",
};

export function QuotePreview({ quote, items, open, onClose, onUpdate }: QuotePreviewProps) {
  if (!quote) return null;

  async function updateStatus(status: string) {
    try {
      const { error } = await supabase.from("quotes").update({ status }).eq("id", quote.id);
      if (error) throw error;
      toast.success(`Quote marked as ${status}`);
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  }

  function printQuote() {
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6452db]" />
              Quote Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={printQuote} className="text-white/60 hover:text-white hover:bg-white/5">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4 print:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">QUOTE</h2>
              <p className="text-sm text-white/50 mt-1">{quote.quote_number}</p>
            </div>
            <Badge variant="secondary" className={`text-sm ${statusColors[quote.status]}`}>
              {quote.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">From</p>
              <p className="text-sm font-medium text-white">StartOps</p>
              <p className="text-sm text-white/50">Your Company Address</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">To</p>
              {quote.contacts ? (
                <>
                  <p className="text-sm font-medium text-white">{quote.contacts.first_name} {quote.contacts.last_name}</p>
                  <p className="text-sm text-white/50">{quote.contacts.company || "No company"}</p>
                  <p className="text-sm text-white/50">{quote.contacts.email || ""}</p>
                </>
              ) : (
                <p className="text-sm text-white/50">No contact selected</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
              <p className="text-xs text-white/40 mb-1">Date</p>
              <p className="text-sm text-white">{new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
              <p className="text-xs text-white/40 mb-1">Valid Until</p>
              <p className="text-sm text-white">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "Not set"}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0b0d10] border border-white/5">
              <p className="text-xs text-white/40 mb-1">Deal</p>
              <p className="text-sm text-white truncate">{quote.deals?.name || "Not linked"}</p>
            </div>
          </div>

          {quote.title && (
            <div>
              <p className="text-lg font-medium text-white">{quote.title}</p>
            </div>
          )}

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#0b0d10]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Item</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">Qty</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">Discount</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <p className="text-sm text-white">{item.products?.name || "Custom item"}</p>
                      <p className="text-xs text-white/40">{item.description}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-white text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">${(item.unit_price || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">{item.discount_percent > 0 ? `${item.discount_percent}%` : "-"}</td>
                    <td className="py-3 px-4 text-sm text-white font-medium text-right">${(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">${(quote.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Tax ({quote.tax_rate}%)</span>
                <span className="text-white">${(quote.tax_amount || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-white">Total</span>
                <span className="text-lg font-semibold text-[#ff8964]">${(quote.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {quote.terms && (
            <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Terms & Conditions</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{quote.terms}</p>
            </div>
          )}

          {quote.status === "draft" && (
            <div className="flex gap-2">
              <Button onClick={() => updateStatus("sent")} className="flex-1 bg-[#5683da] text-white hover:bg-[#5683da]/90">
                <Send className="w-4 h-4 mr-2" />
                Mark as Sent
              </Button>
            </div>
          )}

          {quote.status === "sent" && (
            <div className="flex gap-2">
              <Button onClick={() => updateStatus("accepted")} className="flex-1 bg-[#8dc572] text-black hover:bg-[#8dc572]/90">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Accepted
              </Button>
              <Button onClick={() => updateStatus("rejected")} variant="outline" className="flex-1 border-[#be6464]/30 text-[#be6464] hover:bg-[#be6464]/10">
                <XCircle className="w-4 h-4 mr-2" />
                Mark Rejected
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}