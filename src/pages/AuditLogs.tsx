import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, FileText, Download, Clock, User, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  old_values: any;
  new_values: any;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Timestamp", "Action", "Entity Type", "Entity ID", "User ID", "IP Address"].join(","),
      ...logs.map((l) =>
        [l.created_at, l.action, l.entity_type, l.entity_id, l.user_id, l.ip_address].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    toast({ title: "Audit logs exported" });
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address?.includes(searchQuery);
    const matchesAction = filterAction === "all" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const actionColors: Record<string, string> = {
    create: "#8dc572",
    update: "#5683da",
    delete: "#eb5757",
    login: "#6452db",
    logout: "#f0ad4e",
  };

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Audit Logs</h1>
          <p className="text-white/60 mt-1">Compliance and security event tracking</p>
        </div>
        <Button
          variant="outline"
          className="border-[#303236] text-white/85 hover:bg-[#18191b] hover:text-white"
          onClick={handleExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#18191b] border-[#303236] text-white placeholder:text-white/30"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-40 bg-[#18191b] border-[#303236] text-white">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent className="bg-[#18191b] border-[#303236]">
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-[#18191b] border-[#303236]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#303236] hover:bg-transparent">
                <TableHead className="text-white/60">Timestamp</TableHead>
                <TableHead className="text-white/60">Action</TableHead>
                <TableHead className="text-white/60">Entity</TableHead>
                <TableHead className="text-white/60">User</TableHead>
                <TableHead className="text-white/60">IP Address</TableHead>
                <TableHead className="text-white/60">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/45">
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="w-8 h-8 text-white/30" />
                      <p>No audit logs found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-[#303236] hover:bg-[#1f2126]">
                    <TableCell>
                      <div className="flex items-center gap-2 text-white/85">
                        <Clock className="w-3 h-3 text-white/45" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{
                          borderColor: `${actionColors[log.action] || "#6452db"}40`,
                          color: actionColors[log.action] || "#6452db",
                        }}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-white/45" />
                        <span className="text-white/85 text-sm">{log.entity_type}</span>
                        <span className="text-white/45 text-xs">{log.entity_id?.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white/65">
                        <User className="w-3 h-3" />
                        {log.user_id?.slice(0, 8) || "System"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white/65">
                        <Server className="w-3 h-3" />
                        {log.ip_address || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-white/45 max-w-[200px] truncate">
                        {log.user_agent || "—"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
