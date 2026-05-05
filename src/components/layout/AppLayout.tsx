import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GitBranch,
  BarChart3,
  Settings,
  Shield,
  Zap,
  Webhook,
  Key,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Ticket,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Contacts", path: "/contacts" },
  { icon: Briefcase, label: "Deals", path: "/deals" },
  { icon: GitBranch, label: "Pipelines", path: "/pipelines" },
  { icon: Zap, label: "Workflows", path: "/workflows" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Building2, label: "Organization", path: "/organization" },
  { icon: Shield, label: "Audit Logs", path: "/audit-logs" },
  { icon: Ticket, label: "Support", path: "/support" },
  { icon: Key, label: "API Keys", path: "/api-keys" },
  { icon: Webhook, label: "Webhooks", path: "/webhooks" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-[#0b0d10] text-white overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`flex flex-col border-r border-[#303236] transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          }`}
          style={{ backgroundColor: "#0b0d10" }}
        >
          {/* Logo */}
          <div className="h-14 flex items-center px-4 border-b border-[#303236]">
            <div className="w-8 h-8 rounded-lg bg-[#6452db] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="ml-3 font-semibold text-sm tracking-tight text-white/90">
                Enterprise CRM
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-[#1f2126] text-[#6452db]"
                          : "text-white/65 hover:text-white hover:bg-[#18191b]"
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-[#1f2126] border-[#303236]">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-2 border-t border-[#303236] space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-md text-white/65 hover:text-white hover:bg-[#18191b] transition-all"
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm">Collapse</span>
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-[#1f2126] border-[#303236]">
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/65 hover:text-white hover:bg-[#18191b] transition-all"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>Sign Out</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-[#1f2126] border-[#303236]">
                  Sign Out
                </TooltipContent>
              )}
            </Tooltip>

            {/* User avatar */}
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-7 h-7 bg-[#6452db]">
                <AvatarFallback className="text-xs bg-[#6452db] text-white">
                  {getInitials(user?.email || "")}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm text-white/85 truncate">{user?.email}</p>
                  <p className="text-xs text-white/45">Online</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
