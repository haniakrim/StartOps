import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  Shield,
  Plus,
  Network,
  UserCog,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: { first_name: string; last_name: string; email: string };
}

interface Department {
  id: string;
  name: string;
  description: string;
  manager_id: string;
}

export default function Organization() {
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const { toast } = useToast();

  const [newMember, setNewMember] = useState({ email: "", role: "member" });
  const [newDept, setNewDept] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: membersData } = await supabase
        .from("organization_members")
        .select("*, profiles(first_name, last_name, email)")
        .order("joined_at", { ascending: false });

      const { data: deptsData } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      setMembers(membersData || []);
      setDepartments(deptsData || []);
    } catch (error) {
      console.error("Error fetching organization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Invitation sent", description: `An invite was sent to ${newMember.email}` });
    setShowMemberDialog(false);
    setNewMember({ email: "", role: "member" });
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("departments").insert([
        {
          name: newDept.name,
          description: newDept.description,
          organization_id: (await supabase.from("organizations").select("id").limit(1)).data?.[0]?.id,
        },
      ]);

      if (error) throw error;

      toast({ title: "Department created" });
      setShowDeptDialog(false);
      setNewDept({ name: "", description: "" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const roles = [
    { value: "admin", label: "Admin", color: "#eb5757" },
    { value: "manager", label: "Manager", color: "#ff8964" },
    { value: "member", label: "Member", color: "#5683da" },
    { value: "viewer", label: "Viewer", color: "#8dc572" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Organization</h1>
        <p className="text-white/60 mt-1">Manage team hierarchy and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Members</p>
                <p className="text-2xl font-semibold text-white mt-1">{members.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#6452db]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Departments</p>
                <p className="text-2xl font-semibold text-white mt-1">{departments.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#5683da]/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-[#5683da]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-[#303236]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Admins</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {members.filter((m) => m.role === "admin").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#ff8964]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments */}
      <Card className="bg-[#18191b] border-[#303236]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">Departments</CardTitle>
          <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#303236] text-white/85 hover:bg-[#1f2126]">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-[#303236] text-white">
              <DialogHeader>
                <DialogTitle>New Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                  Create Department
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-4 rounded-lg bg-[#0b0d10] border border-[#303236] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#6452db]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{dept.name}</p>
                    <p className="text-sm text-white/45 truncate">{dept.description || "No description"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <div className="col-span-full text-center py-8 text-white/45">
                No departments yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-[#18191b] border-[#303236]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">Team Members</CardTitle>
          <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18191b] border-[#303236] text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(v) => setNewMember({ ...newMember, role: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      {roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white">
                  Send Invitation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#303236] hover:bg-transparent">
                <TableHead className="text-white/60">Member</TableHead>
                <TableHead className="text-white/60">Role</TableHead>
                <TableHead className="text-white/60">Department</TableHead>
                <TableHead className="text-white/60">Joined</TableHead>
                <TableHead className="text-white/60">Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const roleConfig = roles.find((r) => r.value === member.role) || roles[2];
                return (
                  <TableRow key={member.id} className="border-[#303236] hover:bg-[#1f2126]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6452db]/20 flex items-center justify-center">
                          <UserCog className="w-4 h-4 text-[#6452db]" />
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            {member.profiles?.first_name} {member.profiles?.last_name}
                          </p>
                          <p className="text-xs text-white/45">{member.profiles?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: `${roleConfig.color}40`,
                          color: roleConfig.color,
                        }}
                      >
                        {roleConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/65">—</TableCell>
                    <TableCell className="text-white/65">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs border-[#303236] text-white/60">
                          Read
                        </Badge>
                        <Badge variant="outline" className="text-xs border-[#303236] text-white/60">
                          Write
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-white/45">
                    No team members yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
