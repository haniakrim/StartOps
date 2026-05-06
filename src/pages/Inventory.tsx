import { useState, useEffect } from "react";
import {
  Package, AlertTriangle, ShoppingCart, Plus, Search, Loader2,
  TrendingDown, CheckCircle2, Download
} from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  unit_price: number;
  cost_price: number;
  quantity_on_hand: number;
  reorder_point: number;
  category: string;
  is_active: boolean;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "", unit_price: "", cost_price: "", quantity_on_hand: "", reorder_point: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchProducts(); }, []);
  useRealtimeTable("products", fetchProducts);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load inventory: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("products").insert({
        name: newProduct.name,
        sku: newProduct.sku || null,
        category: newProduct.category || null,
        unit_price: parseFloat(newProduct.unit_price) || 0,
        cost_price: parseFloat(newProduct.cost_price) || 0,
        quantity_on_hand: parseInt(newProduct.quantity_on_hand) || 0,
        reorder_point: parseInt(newProduct.reorder_point) || 0,
      });
      if (error) throw error;
      toast.success("Product added");
      setDialogOpen(false);
      setNewProduct({ name: "", sku: "", category: "", unit_price: "", cost_price: "", quantity_on_hand: "", reorder_point: "" });
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to add product: " + error.message);
    }
  }

  const lowStock = products.filter(p => (p.quantity_on_hand || 0) <= (p.reorder_point || 0));
  const totalValue = products.reduce((s, p) => s + ((p.quantity_on_hand || 0) * (p.cost_price || 0)), 0);

  const filtered = products.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.category?.toLowerCase() || "").includes(search.toLowerCase())) &&
    (statusFilter === "all" || (statusFilter === "active" && p.is_active) || (statusFilter === "inactive" && !p.is_active))
  );

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Inventory & Procurement</h1>
          <p className="text-sm text-white/50 mt-1">Product tracking and intelligent reordering</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
            const exportData = products.map(p => ({
              "Name": p.name,
              "SKU": p.sku || "",
              "Category": p.category || "",
              "Unit Price": p.unit_price,
              "Cost Price": p.cost_price,
              "Quantity": p.quantity_on_hand,
              "Reorder Point": p.reorder_point,
              "Status": p.is_active ? "Active" : "Inactive",
            }));
            exportToCSV(exportData, "inventory");
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
              <Plus className="w-4 h-4 mr-2" />Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
            <form onSubmit={createProduct} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Product Name</Label>
                <Input required value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">SKU</Label>
                  <Input value={newProduct.sku} onChange={(e) => setNewProduct(p => ({ ...p, sku: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Category</Label>
                  <Input value={newProduct.category} onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Unit Price ($)</Label>
                  <Input type="number" value={newProduct.unit_price} onChange={(e) => setNewProduct(p => ({ ...p, unit_price: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Cost Price ($)</Label>
                  <Input type="number" value={newProduct.cost_price} onChange={(e) => setNewProduct(p => ({ ...p, cost_price: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Quantity on Hand</Label>
                  <Input type="number" value={newProduct.quantity_on_hand} onChange={(e) => setNewProduct(p => ({ ...p, quantity_on_hand: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Reorder Point</Label>
                  <Input type="number" value={newProduct.reorder_point} onChange={(e) => setNewProduct(p => ({ ...p, reorder_point: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">Add Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Package className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{products.length}</p>
            <p className="text-sm text-white/50">Total Products</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <AlertTriangle className="w-5 h-5 text-[#be6464] mb-3" />
            <p className="text-2xl font-semibold text-white">{lowStock.length}</p>
            <p className="text-sm text-white/50">Low Stock Alerts</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <TrendingDown className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">${totalValue.toLocaleString()}</p>
            <p className="text-sm text-white/50">Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <Card className="bg-[#be6464]/5 border-[#be6464]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#be6464]" />
              Reorder Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-white/40">{product.sku || "No SKU"} · {product.category || "Uncategorized"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#be6464]/20 text-[#be6464] text-xs border-0">{product.quantity_on_hand} left</Badge>
                    <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90 h-7 text-xs">
                      <ShoppingCart className="w-3 h-3 mr-1" />Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-36 h-9 text-xs">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2126] border-white/10 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base">Products</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 bg-[#0b0d10] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">SKU</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Unit Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-white/40">No products found</td></tr>
              )}
              {filtered.map(product => {
                const stockLevel = product.reorder_point > 0 ? (product.quantity_on_hand / product.reorder_point) * 100 : 100;
                const isLow = product.quantity_on_hand <= product.reorder_point;
                return (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <p className="text-sm text-white font-medium">{product.name}</p>
                      <p className="text-xs text-white/40">{product.category || "No category"}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70 font-mono">{product.sku || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={isLow ? "text-[#be6464]" : "text-white/60"}>{product.quantity_on_hand}</span>
                          <span className="text-white/30">min: {product.reorder_point}</span>
                        </div>
                        <Progress value={Math.min(stockLevel, 100)} className={`h-1 ${isLow ? "bg-[#be6464]/20" : "bg-white/10"}`} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white">${(product.unit_price || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={`text-xs ${product.is_active ? "bg-[#8dc572]/20 text-[#8dc572]" : "bg-white/10 text-white/50"}`}>
                        {product.is_active ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}