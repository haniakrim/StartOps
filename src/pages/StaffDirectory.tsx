import { useState, useMemo, useRef } from "react";
import { Search, Phone, Mail, Building2, Plus, Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/useOrganization";
import { useStaffDirectory, useCreateStaff, useUpdateStaff, useDeleteStaff, type StaffMember, ZONES, DEPARTMENTS } from "@/hooks/useStaffDirectory";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function zoneBannerClass(zone: string) {
  const z = zone.toLowerCase();
  if (z.includes("zone 1")) return "bg-[#00B5BE]";
  if (z.includes("zone 2")) return "bg-[#008F97]";
  if (z.includes("aml")) return "bg-[#006B72]";
  if (z.includes("hq")) return "bg-[#D95E3B]";
  return "bg-[#00B5BE]";
}

function zonePillClass(zone: string) {
  const z = zone.toLowerCase();
  if (z.includes("zone 1")) return "bg-[#E5F8F9] text-[#008F97]";
  if (z.includes("zone 2")) return "bg-[#D6F0F2] text-[#006B72]";
  if (z.includes("aml")) return "bg-[#CCE8EA] text-[#006B72]";
  if (z.includes("hq")) return "bg-[#FAEAE4] text-[#A0391E]";
  return "bg-[#E5F8F9] text-[#008F97]";
}

function TaakkadLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 175" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100,162 C75,142 30,115 18,77 C10,52 22,25 50,19 C65,16 80,24 100,45 C120,24 135,16 150,19 C178,25 190,52 182,77 C170,115 125,142 100,162 Z" fill="none" stroke="#62CCCC" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points="50,87 76,112 132,54" fill="none" stroke="#62CCCC" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="124" cy="115" r="16" fill="#62CCCC" />
      <circle cx="151" cy="126" r="10" fill="#62CCCC" />
    </svg>
  );
}
export default function StaffDirectory() {
  const { organizationId } = useOrganization();
  const { staff, loading } = useStaffDirectory(organizationId);
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMember, setProfileMember] = useState<StaffMember | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return staff.filter((s) => {
      const matchQ = !q || [s.name, s.job_title, s.department, s.bio].some((f) => (f || "").toLowerCase().includes(q));
      const matchZone = zoneFilter === "all" || s.zone === zoneFilter;
      const matchDept = deptFilter === "all" || s.department === deptFilter;
      return matchQ && matchZone && matchDept;
    });
  }, [staff, search, zoneFilter, deptFilter]);

  function openAdd() {
    setEditingId(null);
    setFormData({ zone: "Zone 1", department: "Medical" });
    setPhotoPreview(null);
    setFormOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditingId(member.id);
    setFormData({ ...member });
    setPhotoPreview(member.photo_url || null);
    setFormOpen(true);
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
      setFormData((p) => ({ ...p, photo_url: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) return;
    const payload = { ...formData, organization_id: organizationId } as Omit<StaffMember, "id" | "created_at" | "updated_at">;
    if (editingId) { updateStaff.mutate({ id: editingId, updates: formData }); }
    else { createStaff.mutate(payload); }
    setFormOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this profile from the directory?")) return;
    deleteStaff.mutate(id);
    setProfileOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TaakkadLogo className="w-12 h-10 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Staff Directory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Taakkad · دليل الموظفين</p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd} className="bg-[#00B5BE] hover:bg-[#008F97] text-white">
          <Plus className="w-4 h-4 mr-2" />Add Profile
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-[380px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search by name or role…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Zones" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {ZONES.map((z) => (
              <SelectItem key={z} value={z}>{z === "Aml" ? "Aml Clinics" : z === "HQ" ? "HQ" : `${z} — ${z === "Zone 1" ? "Primary Care" : "Screening"}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto hidden sm:block">{filtered.length} staff</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#00B5BE] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((s) => (
            <Card key={s.id} className="cursor-pointer overflow-hidden border border-border hover:border-[#B3E8EB] hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              onClick={() => { setProfileMember(s); setProfileOpen(true); }}>
              <div className={cn("h-1.5", zoneBannerClass(s.zone))} />
              <CardContent className="p-5 flex flex-col items-center text-center">
                <Avatar className="w-[72px] h-[72px] border-[3px] border-background shadow-[0_0_0_2px_#B3E8EB]">
                  {s.photo_url ? <AvatarImage src={s.photo_url} alt={s.name} /> : null}
                  <AvatarFallback className="bg-[#E5F8F9] text-[#008F97] text-xl font-semibold">{getInitials(s.name)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-3.5 text-[0.95rem] font-semibold text-foreground leading-tight">{s.name}</h3>
                <p className="text-[0.78rem] text-muted-foreground mt-0.5 leading-snug">{s.job_title}</p>
                <Badge className={cn("mt-3 text-[0.68rem] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full", zonePillClass(s.zone))}>{s.zone}</Badge>
                <div className="w-full mt-4 pt-3 border-t border-border/60 flex flex-col gap-1.5">
                  {s.department && (
                    <div className="flex items-center gap-1.5 text-[0.74rem] text-muted-foreground overflow-hidden">
                      <Building2 className="w-3 h-3 text-[#00B5BE] flex-shrink-0" /><span className="truncate">{s.department}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-1.5 text-[0.74rem] text-muted-foreground overflow-hidden">
                      <Phone className="w-3 h-3 text-[#00B5BE] flex-shrink-0" /><span className="truncate">{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-1.5 text-[0.74rem] text-muted-foreground overflow-hidden">
                      <Mail className="w-3 h-3 text-[#00B5BE] flex-shrink-0" /><span className="truncate">{s.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No staff found — try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {profileMember && (
            <>
              <div className="bg-gradient-to-br from-[#00B5BE] to-[#008F97] p-6 flex items-center gap-5">
                <Avatar className="w-[88px] h-[88px] border-[3px] border-white/40 shadow-none">
                  {profileMember.photo_url ? <AvatarImage src={profileMember.photo_url} alt={profileMember.name} /> : null}
                  <AvatarFallback className="bg-[#E5F8F9] text-[#008F97] text-2xl font-semibold">{getInitials(profileMember.name)}</AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <h2 className="text-lg font-bold leading-tight">{profileMember.name}</h2>
                  <p className="text-sm opacity-80 mt-0.5">{profileMember.job_title}</p>
                  <Badge className={cn("mt-2 text-[0.68rem] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full", zonePillClass(profileMember.zone))}>{profileMember.zone}</Badge>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {profileMember.bio && (
                  <div>
                    <h3 className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{profileMember.bio}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Department</h3>
                  <p className="text-sm text-muted-foreground">{profileMember.department || "—"}</p>
                </div>
                <div>
                  <h3 className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2.5">
                      <Phone className="w-4 h-4 text-[#00B5BE] flex-shrink-0" />
                      <span className="truncate">{profileMember.phone ? <a href={`tel:${profileMember.phone}`} className="text-[#008F97] hover:underline">{profileMember.phone}</a> : "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2.5">
                      <Mail className="w-4 h-4 text-[#00B5BE] flex-shrink-0" />
                      <span className="truncate">{profileMember.email ? <a href={`mailto:${profileMember.email}`} className="text-[#008F97] hover:underline">{profileMember.email}</a> : "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3 flex-wrap">
                <Button className="bg-[#00B5BE] hover:bg-[#008F97] text-white" onClick={() => { setProfileOpen(false); openEdit(profileMember); }}>Edit Profile</Button>
                <Button variant="outline" onClick={() => setProfileOpen(false)}>Close</Button>
                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive" onClick={() => handleDelete(profileMember.id)}>Remove</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-[#00B5BE]">{editingId ? "Edit Profile" : "Add New Profile"}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Fields marked <span className="text-[#00B5BE]">*</span> are required</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name <span className="text-[#00B5BE]">*</span></Label>
                <Input required placeholder="e.g. Dr. Layla Al-Rashidi" value={formData.name || ""} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Job Title <span className="text-[#00B5BE]">*</span></Label>
                <Input required placeholder="e.g. Medical Director" value={formData.job_title || ""} onChange={(e) => setFormData((p) => ({ ...p, job_title: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Zone <span className="text-[#00B5BE]">*</span></Label>
                <Select value={formData.zone || ""} onValueChange={(v) => setFormData((p) => ({ ...p, zone: v as StaffMember["zone"] }))}>
                  <SelectTrigger><SelectValue placeholder="Select zone…" /></SelectTrigger>
                  <SelectContent>{ZONES.map((z) => (
                    <SelectItem key={z} value={z}>{z === "Aml" ? "Aml Clinics" : z === "HQ" ? "HQ" : `${z} — ${z === "Zone 1" ? "Primary Care" : "Screening"}`}</SelectItem>
                  ))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department <span className="text-[#00B5BE]">*</span></Label>
                <Select value={formData.department || ""} onValueChange={(v) => setFormData((p) => ({ ...p, department: v as StaffMember["department"] }))}>
                  <SelectTrigger><SelectValue placeholder="Select department…" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Phone</Label>
                <Input placeholder="+966 5X XXX XXXX" value={formData.phone || ""} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5"><Label>Email</Label>
                <Input type="email" placeholder="name@taakkad.health.sa" value={formData.email || ""} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Photo</Label>
              <div className="border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#00B5BE] hover:bg-[#E5F8F9]/50 transition-colors bg-muted/30" onClick={() => fileInputRef.current?.click()}>
                <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-muted-foreground">
                  {photoPreview ? (
                    <><img src={photoPreview} alt="Preview" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[#B3E8EB]" />
                      <span className="text-xs text-[#008F97] font-medium">Photo uploaded</span>
                      <span className="text-[0.7rem] text-muted-foreground">Click to change</span>
                    </>
                  ) : (
                    <><User className="w-7 h-7" /><span className="text-sm">Click to upload photo</span><span className="text-[0.7rem]">JPG, PNG — max 2MB</span></>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="space-y-1.5">
              <Label>Short Bio</Label>
              <Textarea placeholder="A brief introduction — role, background, areas of expertise…" value={formData.bio || ""} onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))} className="min-h-[80px] resize-y" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#00B5BE] hover:bg-[#008F97] text-white" disabled={createStaff.isPending || updateStaff.isPending}>
                {(createStaff.isPending || updateStaff.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Update Profile" : "Save Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
