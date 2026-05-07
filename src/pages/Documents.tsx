import { useState, useEffect } from "react";
import {
  FileText, Upload, Folder, Search, Plus, Loader2, Trash2, Download,
  File, Image, FileSpreadsheet, FileCode, MoreHorizontal, Filter,
  Clock, User, Building2, Tag
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
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  svg: Image,
  txt: File,
  json: FileCode,
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
};

const fileColors: Record<string, string> = {
  pdf: "#be6464",
  doc: "#5683da",
  docx: "#5683da",
  xls: "#8dc572",
  xlsx: "#8dc572",
  csv: "#8dc572",
  jpg: "#ff8964",
  jpeg: "#ff8964",
  png: "#ff8964",
  gif: "#ff8964",
  svg: "#ff8964",
  txt: "#6452db",
  json: "#f0ad4e",
  js: "#f0ad4e",
  ts: "#f0ad4e",
  tsx: "#f0ad4e",
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
  const [newDoc, setNewDoc] = useState({
    name: "",
    category: "general",
    entity_type: "",
    entity_id: "",
    tags: "",
  });

  useEffect(() => { fetchDocuments(); }, [organizationId]);
  useRealtimeTable("documents", fetchDocuments);

  async function fetchDocuments() {
    if (!organizationId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast.error("Failed to load documents: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) {
      toast.error("No organization selected");
      return;
    }
    try {
      setUploading(true);
      const { error } = await supabase.from("documents").insert({
        name: newDoc.name,
        category: newDoc.category,
        entity_type: newDoc.entity_type || null,
        entity_id: newDoc.entity_id || null,
        tags: newDoc.tags ? newDoc.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        type: "pdf",
        size: 0,
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Document added");
      setDialogOpen(false);
      setNewDoc({ name: "", category: "general", entity_type: "", entity_id: "", tags: "" });
      fetchDocuments();
    } catch (error: any) {
      toast.error("Failed to add document: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(id: string) {
    if (!organizationId) return;
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id).eq("organization_id", organizationId);
      if (error) throw error;
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error: any) {
      toast.error("Failed to delete document: " + error.message);
    }
  }

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  ).filter(d => categoryFilter === "all" || d.category === categoryFilter);

  const categories = [...new Set(documents.map(d => d.category))];
  const totalSize = documents.reduce((s, d) => s + (d.size || 0), 0);

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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Documents</h1>
          <p className="text-sm text-white/50 mt-1">Manage files, contracts, and attachments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => {
            const exportData = documents.map(d => ({
              "Name": d.name,
              "Category": d.category,
              "Type": d.type,
              "Size (KB)": d.size,
              "Tags": (d.tags || []).join(", "),
              "Created": d.created_at,
            }));
            exportToCSV(exportData, "documents");
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                <Plus className="w-4 h-4 mr-2" />Add Document
              </Button>
            </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white">
            <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
            <form onSubmit={uploadDocument} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Document Name</Label>
                <Input required value={newDoc.name} onChange={(e) => setNewDoc(p => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Contract_AcmeCorp_2024.pdf" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Category</Label>
                <Select value={newDoc.category} onValueChange={(v) => setNewDoc(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="proposals">Proposals</SelectItem>
                    <SelectItem value="invoices">Invoices</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Linked To</Label>
                  <Select value={newDoc.entity_type} onValueChange={(v) => setNewDoc(p => ({ ...p, entity_type: v }))}>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="deal">Deal</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Entity ID</Label>
                  <Input value={newDoc.entity_id} onChange={(e) => setNewDoc(p => ({ ...p, entity_id: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Tags (comma-separated)</Label>
                <Input value={newDoc.tags} onChange={(e) => setNewDoc(p => ({ ...p, tags: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="contract, legal, 2024" />
              </div>
              <Button type="submit" disabled={uploading} className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Add Document
              </Button>
            </form>
          </DialogContent>
         </Dialog>
       </div>
     </div>
 
     <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <FileText className="w-5 h-5 text-[#6452db] mb-3" />
            <p className="text-2xl font-semibold text-white">{documents.length}</p>
            <p className="text-sm text-white/50">Total Documents</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Folder className="w-5 h-5 text-[#ff8964] mb-3" />
            <p className="text-2xl font-semibold text-white">{categories.length}</p>
            <p className="text-sm text-white/50">Categories</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Upload className="w-5 h-5 text-[#8dc572] mb-3" />
            <p className="text-2xl font-semibold text-white">{(totalSize / 1024 / 1024).toFixed(1)} MB</p>
            <p className="text-sm text-white/50">Storage Used</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-5">
            <Clock className="w-5 h-5 text-[#5683da] mb-3" />
            <p className="text-2xl font-semibold text-white">{documents.filter(d => {
              const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
              return days <= 7;
            }).length}</p>
            <p className="text-sm text-white/50">Added This Week</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2126] border-white/10 text-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#6452db]/10 border border-[#6452db]/20">
          <span className="text-sm text-white">{selected.length} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-[#be6464] hover:text-[#be6464] hover:bg-[#be6464]/10 h-8" onClick={async () => {
            if (!organizationId) return;
            try {
              const { error } = await supabase.from("documents").delete().in("id", selected).eq("organization_id", organizationId);
              if (error) throw error;
              toast.success(`${selected.length} documents deleted`);
              setSelected([]);
              fetchDocuments();
            } catch (error: any) {
              toast.error("Failed to delete: " + error.message);
            }
          }}>
            <Trash2 className="w-4 h-4 mr-1" />Delete
          </Button>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white h-8" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="grid" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">Grid</TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">List</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(doc => {
              const ext = doc.name.split('.').pop()?.toLowerCase() || 'file';
              const Icon = fileIcons[ext] || File;
              const color = fileColors[ext] || "#6452db";
              return (
                <Card key={doc.id} className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="checkbox"
                          className="rounded border-white/20 bg-transparent"
                          checked={selected.includes(doc.id)}
                          onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, doc.id] : prev.filter((id) => id !== doc.id))}
                        />
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#be6464] opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDocument(doc.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <h3 className="text-sm font-medium text-white truncate mb-1">{doc.name}</h3>
                    <p className="text-xs text-white/40 mb-2">{doc.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {(doc.tags || []).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] border-white/10 text-white/40">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-white/30">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      <span>{(doc.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-white/40">
                {search ? "No documents match your search" : "No documents yet. Add your first document!"}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Tags</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Size</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase">Date</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => {
                    const ext = doc.name.split('.').pop()?.toLowerCase() || 'file';
                    const Icon = fileIcons[ext] || File;
                    const color = fileColors[ext] || "#6452db";
                    return (
                      <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" style={{ color }} />
                            <span className="text-sm text-white">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/70 capitalize">{doc.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(doc.tags || []).map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px] border-white/10 text-white/40">{tag}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/50">{(doc.size / 1024).toFixed(0)} KB</td>
                        <td className="py-3 px-4 text-sm text-white/50">{new Date(doc.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#be6464]" onClick={() => deleteDocument(doc.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-sm text-white/40">No documents found</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}