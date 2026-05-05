import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Shield,
  User,
  Settings,
  Database,
  Key,
  Globe,
  AlertTriangle,
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuditEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  severity: "info" | "warning" | "critical";
  category: string;
}

const auditLogs: AuditEntry[] = [
  {
    id: 1,
    timestamp: "2024-03-15 14:32:18",
    user: "john@nexuscrm.com",
    action: "User Login",
    resource: "Authentication",
    details: "Successful login from Chrome on macOS",
    ip: "192.168.1.105",
    severity: "info",
    category: "auth",
  },
  {
    id: 2,
    timestamp: "2024-03-15 14:28:45",
    user: "sarah@nexuscrm.com",
    action: "Deal Updated",
    resource: "Deal #1245",
    details: "Status changed from 'Proposal' to 'Negotiation'",
    ip: "192.168.1.110",
    severity: "info",
    category: "data",
  },
  {
    id: 3,
    timestamp: "2024-03-15 13:15:22",
    user: "admin@nexuscrm.com",
    action: "Role Modified",
    resource: "User: mike@nexuscrm.com",
    details: "Role changed from 'User' to 'Manager' by admin",
    ip: "10.0.0.45",
    severity: "warning",
    category: "security",
  },
  {
    id: 4,
    timestamp: "2024-03-15 12:48:09",
    user: "system",
    action: "API Key Generated",
    resource: "API Keys",
    details: "New production API key generated for Integration - Salesforce",
    ip: "internal",
    severity: "warning",
    category: "api",
  },
  {
    id: 5,
    timestamp: "2024-03-15 11:30:00",
    user: "james@nexuscrm.com",
    action: "Failed Login Attempt",
    resource: "Authentication",
    details: "3 consecutive failed login attempts from unknown device",
    ip: "203.0.113.42",
    severity: "critical",
    category: "auth",
  },
  {
    id: 6,
    timestamp: "2024-03-15 10:22:18",
    user: "lisa@nexuscrm.com",
    action: "Contact Exported",
    resource: "Contacts (247 records)",
    details: "Bulk export initiated by user",
    ip: "192.168.1.115",
    severity: "info",
    category: "data",
  },
  {
    id: 7,
    timestamp: "2024-03-15 09:15:33",
    user: "admin@nexuscrm.com",
    action: "SSO Configuration",
    resource: "Google Workspace",
    details: "SAML certificate rotated and updated",
    ip: "10.0.0.45",
    severity: "warning",
    category: "security",
  },
  {
    id: 8,
    timestamp: "2024-03-15 08:45:12",
    user: "system",
    action: "Webhook Delivered",
    resource: "Deal Status Changes",
    details: "Webhook delivered successfully to https://api.company.com/webhooks/deals",
    ip: "internal",
    severity: "info",
    category: "api",
  },
  {
    id: 9,
    timestamp: "2024-03-15 07:30:00",
    user: "david@nexuscrm.com",
    action: "IP Restriction Triggered",
    resource: "Access Control",
    details: "Access denied from unauthorized IP address",
    ip: "198.51.100.25",
    severity: "critical",
    category: "security",
  },
  {
    id: 10,
    timestamp: "2024-03-15 06:12:45",
    user: "emily@nexuscrm.com",
    action: "Company Created",
    resource: "Company: NovaTech Ltd",
    details: "New company record created with 3 associated contacts",
    ip: "192.168.1.120",
    severity: "info",
    category: "data",
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  auth: Shield,
  data: Database,
  security: Key,
  api: Globe,
};

const categoryColors: Record<string, string> = {
  auth: "#5683da",
  data: "#6452db",
  security: "#ff8964",
  api: "#8dc572",
};

const severityConfig = {
  info: { icon: Check, color: "#8dc572", bg: "bg-[#8dc572]/20", text: "text-[#8dc572]" },
  warning: { icon: AlertTriangle, color: "#f0ad4e", bg: "bg-[#f0ad4e]/20", text: "text-[#f0ad4e]" },
  critical: { icon: AlertTriangle, color: "#be6464", bg: "bg-[#be6464]/20", text: "text-[#be6464]" },
};

export default function Audit() {
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const filtered = auditLogs.filter((entry) => {
    const matchesSearch =
      entry.user.toLowerCase().includes(search.toLowerCase()) ||
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.resource.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || entry.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Audit Logs
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Track all system activities for compliance and security
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: "12,847", icon: FileText, color: "#5683da" },
          { label: "Today", value: "156", icon: Clock, color: "#6452db" },
          { label: "Warnings", value: "23", icon: AlertTriangle, color: "#f0ad4e" },
          { label: "Critical", value: "4", icon: Shield, color: "#be6464" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#18191b] border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#18191b] border border-white/10 rounded-md p-1">
          {(["all", "auth", "data", "security", "api"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize ${
                  filterCategory === cat
                    ? "bg-[#6452db] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audit Table */}
      <Card className="bg-[#18191b] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-8"></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const CategoryIcon = categoryIcons[entry.category] || FileText;
                  const severity = severityConfig[entry.severity];
                  const SeverityIcon = severity.icon;
                  const isExpanded = expandedRows.includes(entry.id);

                  return (
                    <>
                      <tr
                        key={entry.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => toggleRow(entry.id)}
                      >
                        <td className="py-3 px-4">
                          <button className="text-white/30 hover:text-white/60">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/50 font-mono">
                          {entry.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{
                                backgroundColor: `${categoryColors[entry.category]}20`,
                              }}
                            >
                              <CategoryIcon
                                className="w-3 h-3"
                                style={{
                                  color: categoryColors[entry.category],
                                }}
                              />
                            </div>
                            <span className="text-sm text-white/70">
                              {entry.user}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-white">
                          {entry.action}
                        </td>
                        <td className="py-3 px-4 text-sm text-white/70">
                          {entry.resource}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${severity.bg} ${severity.text}`}
                          >
                            <SeverityIcon className="w-3 h-3 mr-1" />
                            {entry.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/50 font-mono">
                          {entry.ip}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#0b0d10]">
                          <td colSpan={7} className="py-3 px-4 pl-12">
                            <div className="p-3 rounded-lg border border-white/5">
                              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                                Details
                              </p>
                              <p className="text-sm text-white/70">
                                {entry.details}
                              </p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs text-white/40">
                                  Category: {entry.category}
                                </span>
                                <span className="text-xs text-white/40">
                                  Event ID: #{entry.id.toString().padStart(6, "0")}
                                </span>
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
        </CardContent>
      </Card>
    </div>
  );
}
