import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  Activity,
  DollarSign,
  Package,
  FolderKanban,
  Briefcase,
  Mail,
  Zap,
  ListFilter,
  Calendar,
  BrainCircuit,
  Clock,
  Target,
  FileText,
  BookOpen,
  Shield,
  BarChart3,
  Webhook,
  CreditCard,
  Send,
  Sparkles,
  Sun,
  Bell,
  Cog,
  LifeBuoy,
} from "lucide-react";

interface ModuleItem {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const modules: ModuleItem[] = [
  // CRM
  { name: "Dashboard", description: "AI-powered overview with real-time insights", icon: LayoutDashboard, color: "#6452db", category: "CRM" },
  { name: "Today", description: "Daily focus with prioritized tasks", icon: Sun, color: "#f0ad4e", category: "CRM" },
  { name: "Contacts", description: "Smart contact management with lead scoring", icon: Users, color: "#6452db", category: "CRM" },
  { name: "Companies", description: "Account tracking and organization", icon: Building2, color: "#5683da", category: "CRM" },
  { name: "Deals", description: "Visual pipeline with drag-and-drop", icon: GitBranch, color: "#ff8964", category: "CRM" },
  { name: "Activities", description: "Calls, meetings, and task tracking", icon: Activity, color: "#8dc572", category: "CRM" },

  // Operations
  { name: "Finance", description: "Invoices, expenses, and cash flow", icon: DollarSign, color: "#8dc572", category: "Operations" },
  { name: "Inventory", description: "Stock tracking and management", icon: Package, color: "#5683da", category: "Operations" },
  { name: "Projects", description: "Kanban boards and project tracking", icon: FolderKanban, color: "#ff8964", category: "Operations" },
  { name: "People", description: "Employee directory and HR tools", icon: Briefcase, color: "#6452db", category: "Operations" },
  { name: "Timesheets", description: "Time tracking and sessions", icon: Clock, color: "#f0ad4e", category: "Operations" },
  { name: "Calendar", description: "Schedule and event management", icon: Calendar, color: "#be6464", category: "Operations" },

  // Growth
  { name: "Communications", description: "Email and outreach management", icon: Mail, color: "#5683da", category: "Growth" },
  { name: "Quotes", description: "Quote builder and preview", icon: FileText, color: "#8dc572", category: "Growth" },
  { name: "Email Templates", description: "Reusable email templates", icon: BookOpen, color: "#6452db", category: "Growth" },
  { name: "Campaigns", description: "Marketing campaign management", icon: Send, color: "#ff8964", category: "Growth" },
  { name: "Subscriptions", description: "Recurring billing and plans", icon: CreditCard, color: "#8dc572", category: "Growth" },
  { name: "Goals", description: "Target setting and progress tracking", icon: Target, color: "#f0ad4e", category: "Growth" },

  // Intelligence
  { name: "Analytics", description: "Deep analytics and visualizations", icon: BarChart3, color: "#5683da", category: "Intelligence" },
  { name: "Reports", description: "Custom reports and exports", icon: FileText, color: "#6452db", category: "Intelligence" },
  { name: "Forecasts", description: "AI-powered revenue forecasting", icon: BrainCircuit, color: "#ff8964", category: "Intelligence" },
  { name: "AI Assistant", description: "Ask questions about your data", icon: Sparkles, color: "#6452db", category: "Intelligence" },

  // Platform
  { name: "Workflows", description: "Automate repetitive tasks", icon: Zap, color: "#f0ad4e", category: "Platform" },
  { name: "Custom Fields", description: "Extend data models your way", icon: ListFilter, color: "#5683da", category: "Platform" },
  { name: "Documents", description: "File storage and management", icon: FileText, color: "#8dc572", category: "Platform" },
  { name: "Security", description: "SSO, SAML, 2FA, audit logs", icon: Shield, color: "#be6464", category: "Platform" },
  { name: "API & Webhooks", description: "Build integrations", icon: Webhook, color: "#6452db", category: "Platform" },
  { name: "Audit Logs", description: "Track every action", icon: FileText, color: "#5683da", category: "Platform" },
  { name: "Notifications", description: "Real-time alerts and updates", icon: Bell, color: "#ff8964", category: "Platform" },
  { name: "Settings", description: "Organization and preferences", icon: Cog, color: "#8dc572", category: "Platform" },
  { name: "Support", description: "Help center and resources", icon: LifeBuoy, color: "#5683da", category: "Platform" },
];

const categories = ["CRM", "Operations", "Growth", "Intelligence", "Platform"];

const categoryColors: Record<string, string> = {
  CRM: "#6452db",
  Operations: "#5683da",
  Growth: "#ff8964",
  Intelligence: "#8dc572",
  Platform: "#f0ad4e",
};

export function ModuleGrid() {
  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const categoryModules = modules.filter((m) => m.category === category);
        return (
          <div key={category}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColors[category] }}
              />
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                {category}
              </h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categoryModules.map((module, index) => (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                  className="group relative bg-[#18191b] border border-white/[0.06] rounded-xl p-4 hover:border-white/15 transition-colors cursor-default"
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${module.color}10, transparent 70%)`,
                    }}
                  />

                  <div className="relative flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${module.color}15` }}
                    >
                      <module.icon
                        className="w-4 h-4"
                        style={{ color: module.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-white group-hover:text-white transition-colors">
                        {module.name}
                      </h4>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
