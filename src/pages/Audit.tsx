import { FileText, User, Shield, Settings, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const logs = [
  { action: "User login", actor: "john@startops.com", target: "Account", time: "2 min ago", type: "auth", severity: "info" },
  { action: "API key regenerated", actor: "sarah@startops.com", target: "Production API", time: "15 min ago", type: "security", severity: "warning" },
  { action: "Deal updated", actor: "james@startops.com", target: "Acme Corp - $45K", time: "1 hour ago", type: "data", severity: "info" },
  { action: "SSO configuration changed", actor: "admin@startops.com", target: "Google Workspace", time: "3 hours ago", type: "security", severity: "warning" },
  { action: "Contact deleted", actor: "mike@startops.com", target: "Jane Smith", time: "5 hours ago", type: "data", severity: "info" },
  { action: "Failed login attempt", actor: "unknown", target: "admin@startops.com", time: "6 hours ago", type: "auth", severity: "error" },
  { action: "Webhook created", actor: "lisa@startops.com", target: "contact.created", time: "1 day ago", type: "settings", severity: "info" },
  { action: "Role permission updated", actor: "admin@startops.com", target: "Sales Team", time: "2 days ago", type: "security", severity: "warning" },
];

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

const Audit = () => {
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
            {logs.map((log, i) => {
              const Icon = typeIcons[log.type] || FileText;
              return (
                <div
                  key={i}
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
};

export default Audit;