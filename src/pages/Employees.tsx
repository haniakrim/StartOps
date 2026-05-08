import { useState, useEffect } from "react";
import {
  Users, Star, TrendingUp, Award, Plus, Search, Loader2,
  Building2, BarChart3, Zap, Download
} from "lucide-react";
import { exportToCSV } from "@/lib/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";
import { useOrganization } from "@/hooks/useOrganization";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  department_id: string | null;
  team_id: string | null;
  utilization_target: number;
  is_active: boolean;
  departments: { name: string } | null;
  teams: { name: string } | null;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface EmployeeSkill {
  skill_id: string;
  proficiency: number;
  skills: { name: string; category: string } | null;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<Record<string, EmployeeSkill[]>>({});
  const { organizationId } = useOrganization();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ first_name: "", last_name: "", email: "", title: "", department_id: "" });
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { fetchData(); }, []);
  useRealtimeTable("employees", fetchData);
  useRealtimeTable("skills", fetchData);
  useRealtimeTable("employee_skills", fetchData);

  async function fetchData() {
    if (!organizationId) {
      setLoading(false);
      setEmployees([]);
      return;
    }
    try {
      setLoading(true);
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select(`*, departments:department_id (name), teams:team_id (name)`)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (empError) throw empError;
      setEmployees((empData || []).map((d: any) => ({ ...d, departments: d.departments?.[0] ?? null, teams: d.teams?.[0] ?? null })));

      const { data: skillData } = await supabase.from("skills").select("*").order("name");
      setSkills(skillData || []);

      const { data: empSkillData } = await supabase.from("employee_skills").select(`*, skills:skill_id (name, category)`);
      const grouped: Record<string, EmployeeSkill[]> = {};
      (empSkillData || []).forEach((es: any) => {
        if (!grouped[es.employee_id]) grouped[es.employee_id] = [];
        grouped[es.employee_id].push({ skill_id: es.skill_id, proficiency: es.proficiency, skills: es.skills?.[0] ?? null });
      });
      setEmployeeSkills(grouped);

      const { data: deptData } = await supabase.from("departments").select("id, name").order("name");
      setDepartments(deptData || []);
    } catch (error: any) {
      toast.error("Failed to load employees: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) {
      toast.error("No organization found");
      return;
    }
    try {
      const { error } = await supabase.from("employees").insert({
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name,
        email: newEmployee.email,
        title: newEmployee.title,
        department_id: newEmployee.department_id || null,
        organization_id: organizationId,
      });
      if (error) throw error;
      toast.success("Employee added");
      setDialogOpen(false);
      setNewEmployee({ first_name: "", last_name: "", email: "", title: "", department_id: "" });
      fetchData();
    } catch (error: any) {
      toast.error("Failed to add employee: " + error.message);
    }
  }

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (e.departments?.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const skillCategories = [...new Set(skills.map(s => s.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">People & Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Workforce intelligence and skill graph</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const exportData = employees.map(e => ({
              "First Name": e.first_name,
              "Last Name": e.last_name,
              "Email": e.email,
              "Title": e.title || "",
              "Department": e.departments?.name || "",
              "Team": e.teams?.name || "",
              "Utilization": e.utilization_target,
              "Status": e.is_active ? "Active" : "Inactive",
            }));
            exportToCSV(exportData, "employees");
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
              <form onSubmit={createEmployee} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required value={newEmployee.first_name} onChange={(e) => setNewEmployee(p => ({ ...p, first_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required value={newEmployee.last_name} onChange={(e) => setNewEmployee(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newEmployee.title} onChange={(e) => setNewEmployee(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newEmployee.department_id} onValueChange={(v) => setNewEmployee(p => ({ ...p, department_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Employee</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <Users className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-semibold text-foreground">{employees.length}</p>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Zap className="w-5 h-5 text-orange-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{skills.length}</p>
            <p className="text-sm text-muted-foreground">Skills Tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-3" />
            <p className="text-2xl font-semibold text-foreground">{Math.round(employees.reduce((s, e) => s + (e.utilization_target || 80), 0) / (employees.length || 1))}%</p>
            <p className="text-sm text-muted-foreground">Avg Utilization Target</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList>
          <TabsTrigger value="directory"><Users className="w-4 h-4 mr-2" />Directory</TabsTrigger>
          <TabsTrigger value="skills"><Award className="w-4 h-4 mr-2" />Skill Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(emp => {
              const empSkills = employeeSkills[emp.id] || [];
              const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase();
              return (
                <Card key={emp.id} className="hover:border-border/80 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">{emp.first_name} {emp.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{emp.title || "No title"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {emp.departments && <Badge variant="secondary" className="text-xs">{emp.departments.name}</Badge>}
                          {emp.teams && <Badge variant="secondary" className="text-xs">{emp.teams.name}</Badge>}
                        </div>
                      </div>
                    </div>
                    {empSkills.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {empSkills.slice(0, 4).map(es => (
                            <Badge key={es.skill_id} variant="outline" className="text-xs text-muted-foreground">
                              {es.skills?.name} <Star className="w-3 h-3 ml-1 text-yellow-500" />
                            </Badge>
                          ))}
                          {empSkills.length > 4 && <Badge variant="outline" className="text-xs text-muted-foreground/50">+{empSkills.length - 4}</Badge>}
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground/60">Utilization Target</span>
                        <span className="text-foreground">{emp.utilization_target || 80}%</span>
                      </div>
                      <Progress value={emp.utilization_target || 80} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && <div className="col-span-full text-center py-12 text-sm text-muted-foreground/50">No employees found</div>}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillCategories.map(category => (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">{category || "General"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skills.filter(s => s.category === category).map(skill => {
                      const count = Object.values(employeeSkills).flat().filter(es => es.skill_id === skill.id).length;
                      return (
                        <div key={skill.id} className="flex items-center justify-between p-2 rounded bg-muted border border-border/50">
                          <span className="text-sm text-foreground">{skill.name}</span>
                          <Badge variant="secondary" className="text-xs text-primary">{count} people</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
            {skillCategories.length === 0 && <div className="col-span-full text-center py-12 text-sm text-muted-foreground/50">No skills configured yet</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
