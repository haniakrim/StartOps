import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  Shield,
  BarChart3,
  Webhook,
  Settings,
  LifeBuoy,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Activity,
  UserCircle,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/contacts", icon: Users, label: "Contacts" },
  { path: "/companies", icon: Building2, label: "Companies" },
  { path: "/deals", icon: GitBranch, label: "Deals" },
  { path: "/activities", icon: Activity, label: "Activities" },
  { path: "/organization", icon: Settings, label: "Organization" },
  { path: "/security", icon: Shield, label: "Security" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/api", icon: Webhook, label: "API & Webhooks" },
  { path: "/audit", icon: FileText, label: "Audit Logs" },
  { path: "/support", icon: LifeBuoy, label: "Support" },
  { path: "/settings", icon: Cog, label: "Settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const userName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userRole = profile?.role || "Member";

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0b0d10] border-r border-white/10 transition-all duration-300 flex flex-col ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#6452db] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <span className="ml-3 font-semibold text-white tracking-tight">
              StartOps
            </span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#18191b] text-[#ff8964]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <div className="ml-auto w-1 h-5 rounded-full bg-[#ff8964]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-3 mt-2 px-2">
            <Avatar className="w-8 h-8 bg-[#6452db]">
              <AvatarFallback className="bg-[#6452db] text-white text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <button
                onClick={() => window.location.href = "/profile"}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-medium text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-white/40 truncate capitalize">
                  {userRole}
                </p>
              </button>
            )}
            {!collapsed && (
              <button
                onClick={signOut}
                className="text-white/30 hover:text-[#be6464] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalSearch />

        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-white/10 bg-[#0b0d10]/80 backdrop-blur-sm sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative cursor-pointer" onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              window.dispatchEvent(event);
            }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                readOnly
                placeholder="Search contacts, deals, companies... (⌘K)"
                className="w-full bg-[#18191b] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-white/60 hover:text-[#be6464] hover:bg-white/5"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}