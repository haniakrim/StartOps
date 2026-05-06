import { useState, useEffect } from "react";
import { FileText, Plus, Search, Loader2, Filter, Send, CheckCircle2, XCircle, Eye, Trash2, DollarSign, TrendingUp, Clock, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";

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

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total: number;
  products: { name: string } | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  sent: "bg-[#5683da]/20 text-[#5683da]",
  accepted: "bg-[#8dc572]/20 text-[#8dc572]",
  rejected: "bg-[#be6464]/20 text-[#be6464]",
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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          id, quote_number, title, status, subtotal, tax_rate, tax_amount, total, valid_until, notes, terms, created_at,
          contacts:contact_id (first_name, last_name, company, email),
          deals:deal_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes((data || []).map((d: any) => ({
        ...d,
        contacts: d.contacts?.[0] ?? null,
        deals: d.deals?.[0] ?? null,
      })));
    } catch (error: any) {
      toast.error("Failed to load quotes: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuoteItems(quoteId: string) {
    const { data } = await supabase
      .from("quote_items")
      .select("*, products:product_id (name)")
      .eq("quote_id", quoteId);
    return (data || []).map((d: any) => ({ ...d, products: d.products?.[0] ?? null }));
  }

  async function openPreview(quote: Quote) {
    const items = await fetchQuoteItems(quote.id);
    setSelectedItems(items);
    setSelectedQuote(quote);
    setPreviewOpen(true);
  }

  async function deleteQuote(id: string) {
    try {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Quote deleted");
      fetchQuotes();
    } catch (error: any) {
      toast.error("Failed to delete quote: " + error.message);
    }
  }

  const filtered = quotes.filter((q) =>
    (q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
    (q.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (q.contacts?.first_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (q.deals?.name?.toLowerCase() || "").includes(search.toLowerCase())) &&
    (statusFilter === "all" || q.status === statusFilter)
  );

  const draftQuotes = filtered.filter((q) => q.status === "draft");
  const sentQuotes = filtered.filter((q) => q.status === "sent");
  const acceptedQuotes = filtered.filter((q) => q.status === "accepted");
  const rejectedQuotes = filtered.filter((q) => q.status === "rejected");

  const totalValue = quotes.reduce((s, q) => s + (q.total || 0), 0);
  const acceptedValue = quotes.filter((q) => q.status === "accepted").reduce((s, q) => s + (q.total || 0), 0);
  const conversionRate = quotes.filter((q) => q.status === "sent" || q.status === "accepted" || q.status === "rejected").length > 0
    ? Math.round((quotes.filter((q) => q.status === "accepted").length / quotes.filter((q) => q.status === "sent" || q.status === "accepted" || q.status === "rejected").length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Quotes & Proposals</h1>
          <p className="text-sm text-white/50 mt-1">Create and track professional quotes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
            const exportData = quotes.map(q => ({
              "Quote Number": q.quote_number,
              "Title": q.title || "",
              "Status": q.status,
              "Contact": q.contacts ? `${q.contacts.first_name} ${q.contacts.last_name}` : "",
              "Deal": q.deals?.name || "",
              "Subtotal": q.subtotal,
              "Tax": q.tax_amount,
              "Total": q.total,
              "Valid Until": q.valid_until,
            }));
            import("@/lib/export").then(({ exportToCSV }) => {
              exportToCSV(exportData, "quotes");
            });
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90" onClick={() => setBuilderOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <FileText className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{quotes.length}</p>
            <p className="text-sm text-white/50">Total Quotes</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <DollarSign className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">${acceptedValue.toLocaleString()}</p>
            <p className="text-sm text-white/50">Accepted Value</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-[#ff8964] mb-3" />
            <p className="text-2xl font-semibold text-white">{conversionRate}%</p>
            <p className="text-sm text-white/50">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#6452db]/10 border border-[#6452db]/20">
          <span className="text-sm text-white">{selected.length} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-[#be6464] hover:text-[#be6464] hover:bg-[#be6464]/10 h-8" onClick={async () => {
            try {
              const { error } = await supabase.from("quotes").delete().in("id", selected);
              if (error) throw error;
              toast.success(`${selected.length} quotes deleted`);
              setSelected([]);
              fetchQuotes();
            } catch (error: any) {
              toast.error("Failed to delete: " + error.message);
            }
          }}>
            <Trash2 className="w-4 h-4 mr-1" />Delete
          </Button>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white h-8" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-36 h-9 text-xs">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2126] border-white/10 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <FileText className="w-4 h-4 mr-2" />
            All ({filtered.length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <Clock className="w-4 h-4 mr-2" />
            Draft ({draftQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <Send className="w-4 h-4 mr-2" />
            Sent ({sentQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accepted ({acceptedQuotes.length})
          </TabsTrigger>
        </TabsList>

        {(["all", "draft", "sent", "accepted", "rejected"] as const).map((tab) => {
          const items = tab === "all" ? filtered : filtered.filter((q) => q.status === tab);
          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              <Card className="bg-[#18191b] border-white/10">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase w-10">
                          <input
                            type="checkbox"
                            className="rounded border-white/20 bg-transparent"
                            onChange={(e) => setSelected(e.target.checked ? filtered.map((q) => q.id) : [])}
                            checked={selected.length > 0 && selected.length === filtered.length}
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Quote</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Contact</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Deal</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Total</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Valid Until</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 && (
                        <tr><td colSpan={7} className="py-12 text-center text-sm text-white/40">No {tab} quotes</td></tr>
                      )}
                      {items.map((quote) => (
                        <tr key={quote.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openPreview(quote)}>
                              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  className="rounded border-white/20 bg-transparent"
                                  checked={selected.includes(quote.id)}
                                  onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, quote.id] : prev.filter((id) => id !== quote.id))}
                                />
                              </td>
                              <td className="py-3 px-4">
                            <p className="text-sm font-medium text-white">{quote.quote_number}</p>
                            <p className="text-xs text-white/40">{quote.title || "No title"}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-white/70">
                            {quote.contacts ? `${quote.contacts.first_name} ${quote.contacts.last_name}` : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-white/70">{quote.deals?.name || "-"}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className={`text-xs ${statusColors[quote.status]}`}>{quote.status}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-white">${(quote.total || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-white/50">
                            {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "-"}
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#be6464]" onClick={() => deleteQuote(quote.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <QuoteBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} onSuccess={fetchQuotes} />
      <QuotePreview quote={selectedQuote} items={selectedItems} open={previewOpen} onClose={() => setPreviewOpen(false)} onUpdate={fetchQuotes} />
    </div>
  );
}