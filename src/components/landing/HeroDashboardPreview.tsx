import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Phone,
  MoreHorizontal,
} from "lucide-react";

const statCards = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
    color: "#0071E3",
  },
  {
    title: "Active Deals",
    value: "48",
    change: "+8.2%",
    up: true,
    icon: TrendingUp,
    color: "#FF2D55",
  },
  {
    title: "Contacts",
    value: "1,284",
    change: "+24%",
    up: true,
    icon: Users,
    color: "#0071E3",
  },
  {
    title: "Companies",
    value: "342",
    change: "-2.1%",
    up: false,
    icon: Building2,
    color: "#2997FF",
  },
];

const pipelineStages = [
  { name: "Lead", count: 24, color: "#2997FF" },
  { name: "Qualified", count: 18, color: "#0071E3" },
  { name: "Proposal", count: 12, color: "#FF2D55" },
  { name: "Negotiation", count: 8, color: "#2997FF" },
  { name: "Closed Won", count: 6, color: "#0071E3" },
];

const contacts = [
  { name: "Sarah Chen", company: "TechFlow", email: "sarah@techflow.io", status: "Active" },
  { name: "Marcus Johnson", company: "DataSync", email: "marcus@datasync.com", status: "Lead" },
  { name: "Emily Davis", company: "CloudNine", email: "emily@cloudnine.ai", status: "Customer" },
];

const chartBars = [35, 55, 40, 70, 45, 60, 80, 50, 65, 75, 55, 85];

const views = ["stats", "chart", "pipeline", "contacts"] as const;

export default function HeroDashboardPreview() {
  const [currentView, setCurrentView] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const view = views[currentView];

  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-hp-blue/20 via-hp-red/10 to-hp-blue-light/20 rounded-3xl blur-2xl animate-pulse-glow" />

      {/* Dashboard card */}
      <div className="relative bg-background border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 text-xs text-white/40">
              <BarChart3 className="w-3 h-3" />
              Dashboard
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[280px]">
          <AnimatePresence mode="wait">
            {view === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-3"
              >
                {statCards.map((stat) => (
                  <div
                    key={stat.title}
                    className="p-3 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                      <span
                        className={`text-[10px] font-medium flex items-center gap-0.5 ${
                          stat.up ? "text-hp-green" : "text-hp-red"
                        }`}
                      >
                        {stat.up ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] text-white/40">{stat.title}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {view === "chart" && (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Revenue Overview</span>
                  <span className="text-xs text-hp-green flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +23.5%
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-40">
                  {chartBars.map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-hp-blue to-hp-red/60"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>Jan</span>
                  <span>Jun</span>
                  <span>Dec</span>
                </div>
              </motion.div>
            )}

            {view === "pipeline" && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Deal Pipeline</span>
                  <span className="text-xs text-white/40">68 total</span>
                </div>
                <div className="space-y-2">
                  {pipelineStages.map((stage, i) => (
                    <motion.div
                      key={stage.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-xs text-white/60 w-20">{stage.name}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stage.count / 24) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                      </div>
                      <span className="text-xs text-white font-medium w-6 text-right">
                        {stage.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === "contacts" && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Recent Contacts</span>
                  <MoreHorizontal className="w-4 h-4 text-white/30" />
                </div>
                {contacts.map((contact, i) => (
                  <motion.div
                    key={contact.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hp-blue to-hp-red flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {contact.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{contact.name}</div>
                      <div className="text-[10px] text-white/40 truncate">{contact.company}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-white/20 hover:text-white/40 cursor-pointer" />
                      <Phone className="w-3 h-3 text-white/20 hover:text-white/40 cursor-pointer" />
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        contact.status === "Active"
                          ? "bg-hp-green/10 text-hp-green"
                          : contact.status === "Customer"
                          ? "bg-hp-blue/10 text-hp-blue"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View indicators */}
        <div className="flex items-center justify-center gap-1.5 py-3 border-t border-white/5">
          {views.map((v, i) => (
            <button
              key={v}
              onClick={() => setCurrentView(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentView ? "bg-hp-blue w-4" : "bg-white/20 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
