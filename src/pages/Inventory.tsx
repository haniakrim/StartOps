import { useState, useEffect } from "react";
import { Package, AlertTriangle, ShoppingCart, Plus, Search, Loader2, TrendingDown, CheckCircle2, Download, Filter } from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";

interface Product { id: string; name: string; sku: string; description: string; unit_price: number; cost_price: number; quantity_on_hand: number; reorder_point: number; category: string; is_active: boolean; }

export default function Inventory() {
  const { organizationId } = useOrganization();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "", unit_price: "", cost_price: "", quantity_on_hand: "", reorder_point: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchProducts(); }, [organizationId]);
  useRealtimeTable("products", fetchProducts);

  async function fetchProducts() { if (!organizationId) { setProducts([]); setLoading(false); return; } try { setLoading(true); const { data, error } = await supabase.from("products").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }); if (error) throw error; setProducts(data || []); } catch (error: any) { toast.error("Failed: " + error.message); } finally { setLoading(false); } }
  async function createProduct(e: React.FormEvent) { e.preventDefault(); if (!organizationId) { toast.error("No org selected"); return; } try { await supabase.from("products").insert({ name: newProduct.name, sku: newProduct.sku || null, category: newProduct.category || null, unit_price: parseFloat(newProduct.unit_price) || 0, cost_price: parseFloat(newProduct.cost_price) || 0, quantity_on_hand: parseInt(newProduct.quantity_on_hand) || 0, reorder_point: parseInt(newProduct.reorder_point) || 0, organization_id: organizationId }); toast.success("Added"); setDialogOpen(false); fetchProducts(); } catch (error: any) { toast.error("Failed: " + error.message); } }

  const lowStock = products.filter(p => (p.quantity_on_hand || 0) <= (p.reorder_point || 0));
  const totalValue = products.reduce((s, p) => s + ((p.quantity_on_hand || 0) * (p.cost_price || 0)), 0);
  const filtered = products.filter(p => (p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku?.toLowerCase() || "").includes(search.toLowerCase())) && (statusFilter === "all" || (statusFilter === "active" && p.is_active) || (statusFilter === "inactive" && !p.is_active)));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground tracking-tight">Inventory</h1><p className="text-sm text-muted-foreground mt-1">Product tracking and reordering</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { const d = products.map(p => ({ Name: p.name, SKU: p.sku, Qty: p.quantity_on_hand, Price: p.unit_price, Status: p.is_active ? "Active" : "Inactive" })); exportToCSV(d, "inventory"); }}><Download className="w-4 h-4 mr-2" />Export</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
              <form onSubmit={createProduct} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Name</Label><Input required value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>SKU</Label><Input value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Category</Label><Input value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Unit Price ($)</Label><Input type="number" min={0} step="0.01" value={newProduct.unit_price} onChange={e => setNewProduct(p => ({ ...p, unit_price: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Cost Price ($)</Label><Input type="number" min={0} step="0.01" value={newProduct.cost_price} onChange={e => setNewProduct(p => ({ ...p, cost_price: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quantity On Hand</Label><Input type="number" min={0} step="1" value={newProduct.quantity_on_hand} onChange={e => setNewProduct(p => ({ ...p, quantity_on_hand: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Reorder Point</Label><Input type="number" min={0} step="1" value={newProduct.reorder_point} onChange={e => setNewProduct(p => ({ ...p, reorder_point: e.target.value }))} /></div>
                </div>
                <Button type="submit" className="w-full">Add Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ icon: Package, label: "Total Products", value: products.length, color: "text-primary" }, { icon: AlertTriangle, label: "Low Stock", value: lowStock.length, color: "text-destructive" }, { icon: TrendingDown, label: "Value", value: "$" + totalValue.toLocaleString(), color: "text-hp-green" }].map(s => (
          <Card key={s.label}><CardContent className="p-5"><s.icon className={`w-5 h-5 ${s.color} mb-3`} /><p className="text-2xl font-semibold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      {lowStock.length > 0 && (
        <Card className="bg-hp-red/5 border-hp-red/20"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-hp-red" />Reorder Required</CardTitle></CardHeader><CardContent>{lowStock.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border mb-2">
            <div><p className="text-sm font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku || "No SKU"}</p></div>
            <div className="flex items-center gap-3"><Badge className="bg-hp-red/20 text-hp-red border-0">{p.quantity_on_hand} left</Badge><Button size="sm" className="h-7 text-xs"><ShoppingCart className="w-3 h-3 mr-1" />Reorder</Button></div>
          </div>
        ))}</CardContent></Card>
      )}

      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><Filter className="w-3 h-3 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
      </div>

      <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle>Products</CardTitle><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></div></CardHeader><CardContent className="p-0">
        <table className="w-full"><thead><tr className="border-b border-border">{["Product","SKU","Stock","Price","Status"].map(h => (<th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{h}</th>
        ))}</tr></thead><tbody>
          {filtered.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">No products found</td></tr>}
          {filtered.map(p => { const isLow = p.quantity_on_hand <= p.reorder_point; const stockLevel = p.reorder_point > 0 ? (p.quantity_on_hand / p.reorder_point) * 100 : 100; return (
            <tr key={p.id} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4"><p className="text-sm font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></td>
              <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{p.sku || "-"}</td>
              <td className="py-3 px-4"><div className="w-24"><div className="flex items-center justify-between text-xs mb-1"><span className={isLow ? "text-destructive" : "text-muted-foreground"}>{p.quantity_on_hand}</span><span className="text-muted-foreground">min: {p.reorder_point}</span></div><Progress value={Math.min(stockLevel, 100)} /></div></td>
              <td className="py-3 px-4 text-sm text-foreground">${(p.unit_price || 0).toLocaleString()}</td>
              <td className="py-3 px-4"><Badge variant="secondary" className={`text-xs ${p.is_active ? "bg-hp-green/20 text-hp-green" : "bg-muted text-muted-foreground"}`}>{p.is_active ? "Active" : "Inactive"}</Badge></td>
            </tr>
          ); })}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
