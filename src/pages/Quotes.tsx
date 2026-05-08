import { useState, useEffect } from "react";
import { FileText, Plus, Search, Loader2, Filter, Send, CheckCircle2, XCircle, Eye, Trash2, DollarSign, TrendingUp, Clock, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Quote { id: string; quote_number: string; title: string | null; status: string; subtotal: number; tax_rate: number; tax_amount: number; total: number; valid_until: string | null; notes: string | null; terms: string | null; created_at: string; contacts: { first_name: string; last_name: string; company: string | null; email: string | null } | null; deals: { name: string } | null; }
interface QuoteItem { id: string; description: string; quantity: number; unit_price: number; discount_percent: number; total: number; products: { name: string } | null; }

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/20 text-primary",
  accepted: "bg-hp-green/20 text-hp-green",
  rejected: "bg-hp-red/20 text-hp-red",
};

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchQuotes(); }, []);
  useRealtimeTable("quotes", fetchQuotes);

  async function fetchQuotes() {
    try { setLoading(true); const { data, error } = await supabase.from("quotes").select(`id, quote_number, title, status, subtotal, tax_rate, tax_amount, total, valid_until, notes, terms, created_at, contacts:contact_id (first_name, last_name, company, email), deals:deal_id (name)`).order("created_at", { ascending: false }); if (error) throw error; setQuotes((data || []).map((d: any) => ({ ...d, contacts: d.contacts?.[0] ?? null, deals: d.deals?.[0] ?? null }))); } catch (error: any) { toast.error("Failed: " + error.message); } finally { setLoading(false); }
  }
  async function fetchQuoteItems(quoteId: string) { const { data } = await supabase.from("quote_items").select("*, products:product_id (name)").eq("quote_id", quoteId); return (data || []).map((d: any) => ({ ...d, products: d.products?.[0] ?? null })); }
  async function openPreview(quote: Quote) { const items = await fetchQuoteItems(quote.id); setSelectedItems(items); setSelectedQuote(quote); setPreviewOpen(true); }
  async function deleteQuote(id: string) { try { await supabase.from("quotes").delete().eq("id", id); toast.success("Deleted"); fetchQuotes(); } catch (error: any) { toast.error("Failed: " + error.message); } }
  const filtered = quotes.filter(q => (q.quote_number.toLowerCase().includes(search.toLowerCase()) || (q.title?.toLowerCase() || "").includes(search.toLowerCase())) && (statusFilter === "all" || q.status === statusFilter));
  const draftQuotes = filtered.filter((q) => q.status === "draft");
  const sentQuotes = filtered.filter((q) => q.status === "sent");
  const acceptedQuotes = filtered.filter((q) => q.status === "accepted");
  const totalValue = quotes.reduce((s, q) => s + (q.total || 0), 0);
  const acceptedValue = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.total || 0), 0);
  const conversionRate = quotes.filter(q => q.status === "sent" || q.status === "accepted").length > 0 ? Math.round((quotes.filter(q => q.status === "accepted").length / quotes.filter(q => q.status === "sent" || q.status === "accepted").length) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground tracking-tight">Quotes</h1><p className="text-sm text-muted-foreground mt-1">Create and track quotes</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { import("@/lib/export").then(({ exportToCSV }) => { exportToCSV(quotes.map(q => ({ "Quote": q.quote_number, Status: q.status, Total: q.total })), "quotes"); }); }}><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button size="sm" onClick={() => setBuilderOpen(true)}><Plus className="w-4 h-4 mr-2" />New Quote</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ icon: FileText, label: "Total Quotes", value: quotes.length, color: "text-primary" }, { icon: DollarSign, label: "Accepted Value", value: "$" + acceptedValue.toLocaleString(), color: "text-hp-green" }, { icon: TrendingUp, label: "Win Rate", value: conversionRate + "%", color: "text-hp-orange" }].map(s => (
          <Card key={s.label}><CardContent className="p-5"><s.icon className={`w-5 h-5 ${s.color} mb-3`} /><p className="text-2xl font-semibold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><Filter className="w-3 h-3 mr-2" /><SelectValue /></SelectTrigger><SelectContent>{["all","draft","sent","accepted"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent></Select>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all"><FileText className="w-4 h-4 mr-2" />All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="draft"><Clock className="w-4 h-4 mr-2" />Draft ({draftQuotes.length})</TabsTrigger>
          <TabsTrigger value="sent"><Send className="w-4 h-4 mr-2" />Sent ({sentQuotes.length})</TabsTrigger>
          <TabsTrigger value="accepted"><CheckCircle2 className="w-4 h-4 mr-2" />Accepted ({acceptedQuotes.length})</TabsTrigger>
        </TabsList>

        {(["all", "draft", "sent", "accepted", "rejected"] as const).map(tab => {
          const items = tab === "all" ? filtered : filtered.filter(q => q.status === tab);
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              <Card><CardContent className="p-0">
                <table className="w-full"><thead><tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Quote</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Valid Until</th>
                </tr></thead><tbody>
                  {items.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No {tab} quotes</td></tr>}
                  {items.map(quote => (
                    <tr key={quote.id} className="border-b border-border hover:bg-accent/50 cursor-pointer" onClick={() => openPreview(quote)}>
                      <td className="py-3 px-4"><p className="text-sm font-medium text-foreground">{quote.quote_number}</p><p className="text-xs text-muted-foreground">{quote.title || "No title"}</p></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{quote.contacts ? `${quote.contacts.first_name} ${quote.contacts.last_name}` : "-"}</td>
                      <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${statusColors[quote.status]}`}>{quote.status}</Badge></td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">${(quote.total || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody></table>
              </CardContent></Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <QuoteBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} onSuccess={fetchQuotes} />
      <QuotePreview quote={selectedQuote} items={selectedItems} open={previewOpen} onClose={() => setPreviewOpen(false)} onUpdate={fetchQuotes} />
    </div>
  );
}
