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
  CreditCard,
  Send,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Activity,
  Cog,
  Sparkles,
  DollarSign,
  Package,
  FolderKanban,
  Briefcase,
  Mail,
  Zap,
  ListFilter,
  Calendar as CalendarIcon,
  BrainCircuit,
  Clock,
  Target,
  Sun,
  Moon,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CommandPalette } from "@/components/CommandPalette";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/today", icon: Sun, label: "Today" },
      { path: "/activities", icon: Activity, label: "Activities" },
    ],
  },
  {
    label: "CRM",
    items: [
      { path: "/contacts", icon: Users, label: "Contacts" },
      { path: "/companies", icon: Building2, label: "Companies" },
      { path: "/deals", icon: GitBranch, label: "Deals" },
      { path: "/quotes", icon: FileText, label: "Quotes" },
      { path: "/communications", icon: Mail, label: "Communications" },
      { path: "/calendar", icon: CalendarIcon, label: "Calendar" },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/projects", icon: FolderKanban, label: "Projects" },
      { path: "/inventory", icon: Package, label: "Inventory" },
      { path: "/finance", icon: DollarSign, label: "Finance" },
      { path: "/timesheets", icon: Clock, label: "Timesheets" },
      { path: "/employees", icon: Briefcase, label: "People" },
    ],
  },
  {
    label: "Insights",
    items: [
      { path: "/forecasts", icon: BrainCircuit, label: "Forecasts" },
      { path: "/goals", icon: Target, label: "Goals" },
      { path: "/analytics", icon: BarChart3, label: "Analytics" },
      { path: "/reports", icon: FileText, label: "Reports" },
    ],
  },
  {
    label: "Automation",
    items: [
      { path: "/workflows", icon: Zap, label: "Workflows" },
      { path: "/campaigns", icon: Send, label: "Campaigns" },
      { path: "/email-templates", icon: BookOpen, label: "Email Templates" },
      { path: "/custom-fields", icon: ListFilter, label: "Custom Fields" },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/documents", icon: FolderOpen, label: "Documents" },
      { path: "/assistant", icon: Sparkles, label: "AI Assistant" },
      { path: "/notifications", icon: Bell, label: "Notifications" },
      { path: "/subscriptions", icon: CreditCard, label: "Subscriptions" },
    ],
  },
  {
    label: "Admin",
    items: [
      { path: "/organization", icon: Settings, label: "Organization" },
      { path: "/security", icon: Shield, label: "Security" },
      { path: "/api", icon: Webhook, label: "API & Webhooks" },
      { path: "/audit", icon: FileText, label: "Audit Logs" },
      { path: "/support", icon: LifeBuoy, label: "Support" },
      { path: "/settings", icon: Cog, label: "Settings" },
    ],
  },
];

function SidebarNavItem({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  return (
    <NavLink
      to={item.path}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-expo-lg text-sm font-medium transition-all duration-200 relative",
        isActive
          ? "bg-expo-blue/10 text-expo-blue"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <item.icon
        className={cn(
          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
          isActive ? "text-expo-blue" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
        )}
      />
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-expo-blue/15 text-expo-blue border-0"
            >
              {item.badge}
            </Badge>
          )}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-expo-blue" />
          )}
        </>
      )}
    </NavLink>
  );
}

function NavGroupSection({
  group,
  collapsed,
  locationPathname,
  expandedGroups,
  toggleGroup,
}: {
  group: NavGroup;
  collapsed: boolean;
  locationPathname: string;
  expandedGroups: Set<string>;
  toggleGroup: (label: string) => void;
}) {
  const isExpanded = expandedGroups.has(group.label);
  const hasActiveItem = group.items.some((item) => item.path === locationPathname);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={item.path === locationPathname}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={() => toggleGroup(group.label)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors rounded-expo-md",
          hasActiveItem ? "text-primary/80" : "text-sidebar-foreground/30 hover:text-sidebar-foreground/50"
        )}
      >
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            !isExpanded && "-rotate-90"
          )}
        />
      </button>
      <div
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-200 ease-expo-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {group.items.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={item.path === locationPathname}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-expo-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        className={cn(
          "w-[18px] h-[18px] absolute transition-all duration-300",
          isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "w-[18px] h-[18px] absolute transition-all duration-300",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(navGroups.map((g) => g.label))
  );
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-sidebar border-r border-border transition-all duration-300 ease-expo-out flex flex-col",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-expo-lg bg-expo-blue flex items-center justify-center flex-shrink-0 shadow-expo-sm">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <div className="ml-3 flex items-center gap-2">
              <span className="font-semibold text-sidebar-foreground tracking-tight text-[15px]">
                StartOps
              </span>
              <Badge className="bg-expo-blue/15 text-expo-blue border-expo-blue/20 text-[10px] px-1.5 py-0 h-4 hover:bg-expo-blue/15">
                Pro
              </Badge>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          {navGroups.map((group) => (
            <NavGroupSection
              key={group.label}
              group={group}
              collapsed={collapsed}
              locationPathname={location.pathname}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-border flex-shrink-0">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-expo-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent transition-all mb-2"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Collapse sidebar</span>
              </div>
            )}
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-expo-lg hover:bg-sidebar-accent transition-colors group">
            <Avatar className="w-8 h-8 bg-expo-blue ring-2 ring-border">
              <AvatarFallback className="bg-transparent text-primary-foreground text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <button
                  onClick={() => (window.location.href = "/profile")}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium text-sidebar-foreground/90 truncate group-hover:text-sidebar-foreground transition-colors">
                    {userName}
                  </p>
                  <p className="text-[11px] text-sidebar-foreground/50 truncate capitalize">
                    {userRole}
                  </p>
                </button>
                <button
                  onClick={signOut}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-accent"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CommandPalette />

        {/* Header */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div
              className="relative cursor-pointer group"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                });
                window.dispatchEvent(event);
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors" />
              <input
                type="text"
                readOnly
                placeholder="Search commands, pages, actions..."
                className="w-full bg-muted border border-border rounded-expo-lg pl-9 pr-16 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-expo-blue/30 focus:ring-1 focus:ring-expo-blue/20 cursor-pointer transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <RealtimeNotifications />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive hover:bg-accent rounded-expo-lg"
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