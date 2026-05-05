import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Shield,
  Plug,
  ClipboardList,
  HeadphonesIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/contacts", icon: Users, label: "Contacts" },
  { path: "/deals", icon: Briefcase, label: "Deals" },
  { path: "/team", icon: Building2, label: "Team" },
  { path: "/security", icon: Shield, label: "Security" },
  { path: "/integrations", icon: Plug, label: "Integrations" },
  { path: "/audit", icon: ClipboardList, label: "Audit Logs" },
  { path: "/support", icon: HeadphonesIcon, label: "Support" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-canvas text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-hairline-soft bg-canvas transition-all duration-300 ${
          collapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-hairline-soft shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="ml-3 font-app font-bold text-lg tracking-tight">
              NexusCRM
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-app transition-colors ${
                  isActive
                    ? "bg-surface text-white"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-violet" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-violet" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-hairline-soft shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 rounded-md text-white/45 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-hairline-soft bg-canvas/80 backdrop-blur-sm shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full h-9 pl-9 pr-4 rounded-md bg-surface border border-hairline-soft text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md text-white/45 hover:text-white hover:bg-white/5 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral" />
            </button>
            <button className="p-2 rounded-md text-white/45 hover:text-white hover:bg-white/5 transition-colors">
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-2">
                  <Avatar className="w-8 h-8 border border-hairline-soft">
                    <AvatarFallback className="bg-violet text-white text-xs font-app font-medium">
                      AG
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-surface-elevated border-hairline-soft text-white"
              >
                <div className="px-3 py-2 border-b border-hairline-soft">
                  <p className="text-sm font-medium">Alex Grant</p>
                  <p className="text-xs text-white/45">alex@nexuscrm.io</p>
                </div>
                <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-hairline-soft" />
                <DropdownMenuItem className="text-white/65 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
