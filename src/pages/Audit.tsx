import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  Database,
  Settings,
  LogIn,
  LogOut,
  Edit3,
  Trash2,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  action: string;
  resource: string;
  resourceType: string;
  details: string;
  ip: string;
  severity: "info" | "warning" | "critical";
  status: "success" | "failure";
}

const auditLogs: AuditLog[] = [
  { id: "1", timestamp: "2024-12-15 14:32:18", user: "Alex Grant", email: "alex@nexuscrm.io", action: "LOGIN", resource: "NexusCRM", resourceType: "auth", details: "Successful login from Chrome on macOS", ip: "192.168.1.105", severity: "info", status: "success" },
  { id: "2", timestamp: "2024-12-15 14:30:45", user: "Sarah Chen", email: "sarah@nexuscrm.io", action: "DEAL_UPDATE", resource: "Enterprise License - Q4", resourceType: "deal", details: "Stage changed from Proposal to Negotiation", ip: "192.168.1.102", severity: "info", status: "success" },
  { id: "3", timestamp: "2024-12-15 14:28:12", user: "Mike Ross", email: "mike@nexuscrm.io", action: "CONTACT_CREATE", resource: "TechFlow Inc", resourceType: "contact", details: "New contact created with 3 associated deals", ip: "192.168.1.103", severity: "info", status: "success" },
  { id: "4", timestamp: "2024-12-15 14:25:33", user: "System", email: "system@nexuscrm.io", action: "WEBHOOK_FAILED", resource: "Slack Notifications", resourceType: "integration", details: "Webhook returned 500 Internal Server Error", ip: "10.0.0.5", severity: "warning", status: "failure" },
  { id: "5", timestamp: "2024-12-15 14:20:01", user: "David Kim", email: "david@nexuscrm.io", action: "API_KEY_GENERATED", resource: "Production API", resourceType: "api", details: "New API key generated with 10,000/hr rate limit", ip: "192.168.1.104", severity: "info", status: "success" },
  { id: "6", timestamp: "2024-12-15 14:15:22", user: "Emily Watson", email: "emily@nexuscrm.io", action: "PERMISSION_CHANGE", resource: "Lisa Park", resourceType: "user", details: "Role changed from User to Manager", ip: "192.168.1.106", severity: "warning", status: "success" },
  { id: "7", timestamp: "2024-12-15 14:10:55", user: "Alex Grant", email: "alex@nexuscrm.io", action: "SETTINGS_UPDATE", resource: "Password Policy", resourceType: "settings", details: "Minimum password length changed from 8 to 12 characters", ip: "192.168.1.105", severity: "warning", status: "success" },
  { id: "8", timestamp: "2024-12-15 14:05:18", user: "Unknown", email: "unknown", action: "LOGIN_ATTEMPT", resource: "NexusCRM", resourceType: "auth", details: "Failed login attempt - Invalid credentials", ip: "185.220.101.42", severity: "critical", status: "failure" },
  { id: "9", timestamp: "2024-12-15 14:00:42", user: "James Wilson", email: "james@nexuscrm.io", action: "DEAL_DELETE", resource: "Legacy Contract", resourceType: "deal", details: "Deal permanently deleted by user", ip: "192.168.1.107", severity: "warning", status: "success" },
  { id: "10", timestamp: "2024-12-15 13:55:11", user: "Anna Martinez", email: "anna@nexuscrm.io", action: "EXPORT", resource: "Contacts", resourceType: "data", details: "Exported 247 contacts to CSV format", ip: "192.168.1.108", severity: "info", status: "success" },
  { id: "11", timestamp: "2024-12-15 13:50:28", user: "System", email: "system@nexuscrm.io", action: "BACKUP_COMPLETE", resource: "Database", resourceType: "system", details: "Daily automated backup completed successfully", ip: "10.0.0.1", severity: "info", status: "success" },
  { id: "12", timestamp: "2024-12-15 13:45:00", user: "Alex Grant", email: "alex@nexuscrm.io", action: "SSO_CONFIG", resource: "SAML Provider", resourceType: "security", details: "SAML 2.0 configuration updated for Okta integration", ip: "192.168.1.105", severity: "warning", status: "success" },
];

const actionIcons: Record<string, any> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  DEAL_UPDATE: Edit3,
  DEAL_DELETE: Trash2,
  CONTACT_CREATE: Plus,
  API_KEY_GENERATED: Database,
  PERMISSION_CHANGE: Shield,
  SETTINGS_UPDATE: Settings,
  WEBHOOK_FAILED: AlertTriangle,
  LOGIN_ATTEMPT: LogIn,
  EXPORT: Download,
  BACKUP_COMPLETE: CheckCircle2,
  SSO_CONFIG: Shield,
};

const severityColors = {
  info: "bg-electric-blue/10 text-electric-blue border-electric-blue/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-app-error/10 text-app-error border-app-error/20",
};

const statusIcons = {
  success: CheckCircle2,
  failure: AlertTriangle,
};

const statusColors = {
  success: "text-success",
  failure: "text-app-error",
};

export default function Audit() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Track all system activities for compliance and security
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-surface-elevated border-hairline-soft text-white">
              <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                <FileJson className="w-4 h-4 mr-2" /> Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                <FileText className="w-4 h-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Total Events (24h)</p>
            <p className="text-xl font-bold text-white">1,247</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-xs text-success">98.2% success rate</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Failed Attempts</p>
            <p className="text-xl font-bold text-white">23</p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span className="text-xs text-warning">+5 from yesterday</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Critical Events</p>
            <p className="text-xl font-bold text-white">3</p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-app-error" />
              <span className="text-xs text-app-error">Requires attention</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-hairline-soft rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-white/45 mb-1">Retention Period</p>
            <p className="text-xl font-bold text-white">90 days</p>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 text-electric-blue" />
              <span className="text-xs text-electric-blue">SOC 2 compliant</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-surface border-hairline-soft rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md bg-canvas border border-hairline-soft text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
            </div>
            <div className="flex items-center gap-2">
              {["all", "info", "warning", "critical"].map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSelectedSeverity(severity)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    selectedSeverity === severity
                      ? "bg-violet text-white"
                      : "bg-white/5 text-white/45 hover:text-white/65 hover:bg-white/10"
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5 ml-auto">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-surface border-hairline-soft rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="data-table-header text-left">
                <th className="px-4 py-2.5 font-app font-medium w-8"></th>
                <th className="px-4 py-2.5 font-app font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-app font-medium">User</th>
                <th className="px-4 py-2.5 font-app font-medium">Action</th>
                <th className="px-4 py-2.5 font-app font-medium">Resource</th>
                <th className="px-4 py-2.5 font-app font-medium">Severity</th>
                <th className="px-4 py-2.5 font-app font-medium">Status</th>
                <th className="px-4 py-2.5 font-app font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const ActionIcon = actionIcons[log.action] || Eye;
                const StatusIcon = statusIcons[log.status];
                const isExpanded = expandedRows.includes(log.id);
                return (
                  <>
                    <tr
                      key={log.id}
                      className="data-table-row hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => toggleRow(log.id)}
                    >
                      <td className="px-4 py-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-white/30" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/30" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/65 font-mono">{log.timestamp}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-white/30" />
                          <span className="text-sm text-white/85">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-white/5">
                            <ActionIcon className="w-3.5 h-3.5 text-white/45" />
                          </div>
                          <span className="text-sm text-white/65">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/85">{log.resource}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${severityColors[log.severity]} text-xs capitalize`}>
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className={`w-3.5 h-3.5 ${statusColors[log.status]}`} />
                          <span className={`text-xs capitalize ${statusColors[log.status]}`}>{log.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/45 font-mono">{log.ip}</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-surface-elevated/50">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="pl-8 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-white/30 w-20 shrink-0">Details:</span>
                              <span className="text-sm text-white/65">{log.details}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-white/30 w-20 shrink-0">Resource Type:</span>
                              <Badge variant="outline" className="border-hairline-soft text-white/45 text-xs capitalize">
                                {log.resourceType}
                              </Badge>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-white/30 w-20 shrink-0">User Email:</span>
                              <span className="text-sm text-white/45">{log.email}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-hairline-soft">
          <p className="text-xs text-white/30">
            Showing {filteredLogs.length} of {auditLogs.length} events
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
