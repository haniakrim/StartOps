import { useState, useEffect } from "react";
import {
  FileText, Upload, Folder, Search, Plus, Loader2, Trash2, Download,
  File, Image, FileSpreadsheet, FileCode, Filter, Clock
} from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  entity_type: string | null;
  entity_id: string | null;
  tags: string[];
  created_at: string;
  created_by: string | null;
}

const fileIcons: Record<string, React.ElementType> = {
  pdf: FileText, doc: FileText, docx: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
  jpg: Image, jpeg: Image, png: Image, gif: Image, svg: Image,
  txt: File, json: FileCode, js: FileCode, ts: FileCode, tsx: FileCode,
};

const fileColors: Record<string, string> = {
  pdf: "#be6464", doc: "#5683da", docx: "#5683da",
  xls: "#8dc572", xlsx: "#8dc572", csv: "#8dc572",
  jpg: "#ff8964", jpeg: "#ff8964", png: "#ff8964", gif: "#ff8964", svg: "#ff8964",
  txt: "#6452db", json: "#f0ad4e", js: "#f0ad4e", ts: "#f0ad4e", tsx: "#f0ad4e",
};

export default function Documents() {
  const { organizationId } = useOrganization();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [newDoc, setNewDoc] = useState({ name: "", category: "general", entity_type: "", entity_id: "", tags: "" });

  useEffect(() => { fetchDocuments(); }, [organizationId]);
  useRealtimeTable("documents", fetchDocuments);

  async function fetchDocuments() {
    if (!organizationId) { setDocuments([]); setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase.from("documents").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) { toast.error("Failed to load documents: " + error.message); } finally { setLoading(false); }
  }

  async function uploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) { toast.error("No organization selected"); return; }
    try {
      setUploading(true);
      const { error } = await supabase.from("documents").insert({
        name: newDoc.name, category: newDoc.category, entity_type: newDoc.entity_type || null,
        entity_id: newDoc.entity_id || null, tags: newDoc.tags ? newDoc.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        type: "pdf", size: 0, organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Document added"); setDialogOpen(false); setNewDoc({ name: "", category: "general", entity_type: "", entity_id: "", tags: "" }); fetchDocuments();
    } catch (error: any) { toast.error("Failed to add document: " + error.message); } finally { setUploading(false); }
  }

  async function deleteDocument(id: string) {
    if (!organizationId) return;
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id).eq("organization_id", organizationId);
      if (error) throw error; toast.success("Document deleted"); fetchDocuments();
    } catch (error: any) { toast.error("Failed to delete document: " + error.message); }
  }

  const filtered = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || (d.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))).filter(d => categoryFilter === "all" || d.category === categoryFilter);
  const categories = [...new Set(documents.map(d => d.category))];
  const totalSize = documents.reduce((s, d) => s + (d.size || 0), 0);

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage files, contracts, and attachments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            exportToCSV(documents.map(d => ({ Name: d.name, Category: d.category, Type: d.type, "Size (KB)": d.size, Tags: (d.tags || []).join(", "), Created: d.created_at })), "documents");
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />Add Document</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
              <form onSubmit={uploadDocument} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Document Name</Label><Input required value={newDoc.name} onChange={(e) => setNewDoc(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={newDoc.category} onValueChange={(v) => setNewDoc(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["general","contracts","proposals","invoices","reports","legal"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={uploading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Add Document</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "Total Documents", value: documents.length },
          { icon: Folder, label: "Categories", value: categories.length },
          { icon: Upload, label: "Storage Used", value: `${(totalSize / 1024 / 1024).toFixed(1)} MB` },
          { icon: Clock, label: "Added This Week", value: documents.filter(d => { const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000); return days <= 7; }).length },
        ].map((stat) => (
          <Card key={stat.label}><CardContent className="p-5">
            <stat.icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-foreground">{selected.length} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-hp-red hover:text-hp-red" onClick={async () => { if (!organizationId) return; try { const { error } = await supabase.from("documents").delete().in("id", selected).eq("organization_id", organizationId); if (error) throw error; toast.success(`${selected.length} documents deleted`); setSelected([]); fetchDocuments(); } catch (error: any) { toast.error("Failed to delete: " + error.message); } }}><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(doc => {
              const ext = doc.name.split('.').pop()?.toLowerCase() || 'file';
              const Icon = fileIcons[ext] || File;
              const color = fileColors[ext] || "#6452db";
              return (
                <Card key={doc.id} className="border-border hover:border-border/80 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <input type="checkbox" checked={selected.includes(doc.id)} onChange={(e) => setSelected(prev => e.target.checked ? [...prev, doc.id] : prev.filter(id => id !== doc.id))} />
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}><Icon className="w-5 h-5" style={{ color }} /></div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDocument(doc.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <h3 className="text-sm font-medium text-foreground truncate mb-1">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{doc.category}</p>
                    <div className="flex flex-wrap gap-1">{(doc.tags || []).map(tag => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}</div>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span><span>{(doc.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (<div className="col-span-full text-center py-12 text-sm text-muted-foreground">{search ? "No documents match your search" : "No documents yet. Add your first document!"}</div>)}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card><CardContent className="p-0">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {["Name","Category","Tags","Size","Date",""].map(h => (<th key={h} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(doc => {
                  const ext = doc.name.split('.').pop()?.toLowerCase() || 'file';
                  const Icon = fileIcons[ext] || File;
                  const color = fileColors[ext] || "#6452db";
                  return (
                    <tr key={doc.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4"><div className="flex items-center gap-3"><Icon className="w-4 h-4" style={{ color }} /><span className="text-sm text-foreground">{doc.name}</span></div></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground capitalize">{doc.category}</td>
                      <td className="py-3 px-4"><div className="flex flex-wrap gap-1">{(doc.tags || []).map(tag => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}</div></td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{(doc.size / 1024).toFixed(0)} KB</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteDocument(doc.id)}><Trash2 className="w-3.5 h-3.5" /></Button></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (<tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No documents found</td></tr>)}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
