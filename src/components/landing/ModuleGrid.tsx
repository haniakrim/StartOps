import { motion } from "framer-motion";
import {
  Users,
  Building2,
  TrendingUp,
  Calendar,
  FileText,
  Receipt,
  CreditCard,
  Truck,
  Wallet,
  FolderKanban,
  Package,
  UserCircle,
  Clock,
  Megaphone,
  FileSpreadsheet,
  Mail,
  Repeat,
  BarChart3,
  FileBarChart,
  LineChart,
  Sparkles,
  Target,
  GitBranch,
  Settings,
  CalendarDays,
  FileStack,
  Shield,
  Code,
  ClipboardList,
  StickyNote,
} from "lucide-react";

interface Module {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const modules: Module[] = [
  // CRM
  { name: "Contacts", description: "Manage leads and customer relationships", icon: Users, color: "#6452db", category: "CRM" },
  { name: "Companies", description: "Track organizations and accounts", icon: Building2, color: "#6452db", category: "CRM" },
  { name: "Deals", description: "Visual pipeline from lead to close", icon: TrendingUp, color: "#ff8964", category: "CRM" },
  { name: "Activities", description: "Calls, meetings, tasks, and emails", icon: Calendar, color: "#5683da", category: "CRM" },
  // Finance
  { name: "Invoices", description: "Create and track billing", icon: FileText, color: "#8dc572", category: "Finance" },
  { name: "Expenses", description: "Monitor spending and budgets", icon: Receipt, color: "#8dc572", category: "Finance" },
  { name: "Vendors", description: "Supplier and vendor management", icon: Truck, color: "#8dc572", category: "Finance" },
  { name: "Cash Flow", description: "Real-time financial visibility", icon: Wallet, color: "#8dc572", category: "Finance" },
  // Operations
  { name: "Projects", description: "Kanban boards and task tracking", icon: FolderKanban, color: "#f0ad4e", category: "Operations" },
  { name: "Inventory", description: "Stock levels and product tracking", icon: Package, color: "#f0ad4e", category: "Operations" },
  { name: "Employees", description: "Team directory and HR records", icon: UserCircle, color: "#f0ad4e", category: "Operations" },
  { name: "Timesheets", description: "Time tracking and reporting", icon: Clock, color: "#f0ad4e", category: "Operations" },
  // Growth
  { name: "Campaigns", description: "Marketing campaign management", icon: Megaphone, color: "#be6464", category: "Growth" },
  { name: "Quotes", description: "Professional quote builder", icon: FileSpreadsheet, color: "#be6464", category: "Growth" },
  { name: "Email Templates", description: "Reusable email designs", icon: Mail, color: "#be6464", category: "Growth" },
  { name: "Subscriptions", description: "Recurring revenue tracking", icon: Repeat, color: "#be6464", category: "Growth" },
  // Intelligence
  { name: "Analytics", description: "Real-time dashboards and KPIs", icon: BarChart3, color: "#5683da", category: "Intelligence" },
  { name: "Reports", description: "Custom reports and exports", icon: FileBarChart, color: "#5683da", category: "Intelligence" },
  { name: "Forecasts", description: "AI-powered revenue predictions", icon: LineChart, color: "#5683da", category: "Intelligence" },
  { name: "AI Assistant", description: "Smart insights and automation", icon: Sparkles, color: "#6452db", category: "Intelligence" },
  { name: "Goals", description: "OKRs and target tracking", icon: Target, color: "#5683da", category: "Intelligence" },
  // Platform
  { name: "Workflows", description: "Automate repetitive tasks", icon: GitBranch, color: "#ff8964", category: "Platform" },
  { name: "Custom Fields", description: "Tailor data to your needs", icon: Settings, color: "#ff8964", category: "Platform" },
  { name: "Calendar", description: "Shared team scheduling", icon: CalendarDays, color: "#ff8964", category: "Platform" },
  { name: "Documents", description: "File storage and sharing", icon: FileStack, color: "#ff8964", category: "Platform" },
  { name: "Security", description: "SSO, 2FA, and audit logs", icon: Shield, color: "#ff8964", category: "Platform" },
  { name: "API", description: "REST API and webhooks", icon: Code, color: "#ff8964", category: "Platform" },
  { name: "Audit", description: "Complete activity history", icon: ClipboardList, color: "#ff8964", category: "Platform" },
  { name: "Notes", description: "Shared notes and wikis", icon: StickyNote, color: "#ff8964", category: "Platform" },
];

const categories = ["CRM", "Finance", "Operations", "Growth", "Intelligence", "Platform"];

const categoryColors: Record<string, string> = {
  CRM: "#6452db",
  Finance: "#8dc572",
  Operations: "#f0ad4e",
  Growth: "#be6464",
  Intelligence: "#5683da",
  Platform: "#ff8964",
};

export default function ModuleGrid() {
  return (
    <div className="space-y-16">
      {categories.map((category) => {
        const categoryModules = modules.filter((m) => m.category === category);
        return (
          <div key={category}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: categoryColors[category] }}
              />
              <h3 className="text-xl font-semibold text-white">{category}</h3>
              <div className="flex-1 h-px bg-white/5" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryModules.map((module, i) => (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative p-5 rounded-xl bg-[#18191b] border border-white/5 hover:border-white/15 transition-colors cursor-default"
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                    style={{
                      background: `radial-gradient(circle at center, ${module.color}10, transparent 70%)`,
                    }}
                  />

                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${module.color}15` }}
                    >
                      <module.icon className="w-5 h-5" style={{ color: module.color }} />
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{module.name}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{module.description}</p>
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
