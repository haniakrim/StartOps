import { useState, useEffect } from "react";
import { FileText, User, Shield, Settings, Database, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  time: string;
  type: string;
  severity: string;
}

const typeIcons: Record<string, React.ElementType> = {
  auth: User,
  security: Shield,
  data: Database,
  settings: Settings,
};

const severityColors: Record<string, string> = {
  info: "bg-[#337ab7]/20 text-[#337ab7]",
  warning: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  error: "bg-[#eb5757]/20 text-[#eb5757]",
};

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped: AuditLog[] = (data || []).map((log: any) => ({
        id: log.id,
        action: log.action,
        actor: log.user_id ? `User ${log.user_id.slice(0, 8)}` : "System",
        target: log.entity_type + (log.entity_id ? ` ${log.entity_id.slice(0, 8)}` : ""),
        time: new Date(log.created_at).toLocaleString(),
        type: log.entity_type === "auth" ? "auth" : log.entity_type === "security" ? "security" : "data",
        severity: log.action.includes("delete") || log.action.includes("fail") ? "error" : log.action.includes("update") ? "warning" : "info",
      }));

      setLogs(mapped);
    } catch (error: any) {
      toast.error("Failed to load audit logs: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Audit Logs</h1>
        <p className="text-white/50 mt-1">Track all activity across your organization</p>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6452db]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-2">
            {logs.length === 0 && (
              <p className="text-sm text-white/40 text-center py-8">No audit logs yet. Activity will appear here as users interact with the system.</p>
            )}
            {logs.map((log) => {
              const Icon = typeIcons[log.type] || FileText;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-3 rounded-md hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-[#0b0d10] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{log.action}</span>
                      <Badge className={`text-xs border-0 ${severityColors[log.severity]}`}>
                        {log.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {log.actor} on {log.target}
                    </p>
                  </div>
                  <span className="text-xs text-white/30 flex-shrink-0">{log.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}