import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Target,
  Users,
  Building2,
  TrendingUp,
  GitBranch,
  Star,
  Activity,
  BrainCircuit,
  BarChart3,
} from "lucide-react";

const views = [
  { id: "stats", label: "Stats" },
  { id: "chart", label: "Revenue" },
  { id: "pipeline", label: "Pipeline" },
  { id: "contacts", label: "Contacts" },
  { id: "ai", label: "AI Insights" },
];

function MiniStatCards() {
  const cards = [
    { title: "Revenue", value: "$94,200", change: "+12.5%", icon: DollarSign, color: "#ff8964" },
    { title: "Active Deals", value: "24", change: "+8.2%", icon: Target, color: "#5683da" },
    { title: "Contacts", value: "1,284", change: "+24.1%", icon: Users, color: "#6452db" },
    { title: "Companies", value: "86", change: "-2.4%", icon: Building2, color: "#8dc572" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-[#18191b] border border-white/10 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: `${card.color}15` }}
            >
              <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
            </div>
            <span className="text-[10px] text-[#8dc572]">{card.change}</span>
          </div>
          <p className="text-sm font-semibold text-white">{card.value}</p>
          <p className="text-[10px] text-white/40">{card.title}</p>
        </div>
      ))}
    </div>
  );
}

function MiniChart() {
  const data = [42, 38, 55, 48, 62, 58, 75, 68, 82, 78, 95, 88];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="bg-[#18191b] border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/60">Revenue Overview</span>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#8dc572]" />
          <span className="text-[10px] text-[#8dc572]">+23.4%</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-20">
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${((v - min) / range) * 100}%` }}
            transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
            className="flex-1 rounded-t-sm"
            style={{
              backgroundColor: i === data.length - 1 ? "#6452db" : "#6452db60",
              minHeight: "4px",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {["Jan", "Apr", "Jul", "Oct", "Dec"].map((m) => (
          <span key={m} className="text-[9px] text-white/30">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniPipeline() {
  const stages = [
    { name: "Lead", count: 12, color: "#5683da" },
    { name: "Qualified", count: 8, color: "#6452db" },
    { name: "Proposal", count: 5, color: "#ff8964" },
    { name: "Closed", count: 3, color: "#8dc572" },
  ];

  return (
    <div className="bg-[#18191b] border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="w-3.5 h-3.5 text-[#ff8964]" />
        <span className="text-xs text-white/60">Deal Pipeline</span>
      </div>
      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[11px] text-white/50 w-16">{stage.name}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stage.count / 12) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: stage.color }}
              />
            </div>
            <span className="text-[11px] text-white/70 w-4 text-right">
              {stage.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniContacts() {
  const contacts = [
    { name: "Sarah Chen", company: "TechCorp", score: 92 },
    { name: "Mike Ross", company: "StartupX", score: 78 },
    { name: "Emma Davis", company: "GrowthIO", score: 65 },
  ];

  return (
    <div className="bg-[#18191b] border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-[#6452db]" />
        <span className="text-xs text-white/60">Top Contacts</span>
      </div>
      <div className="space-y-2">
        {contacts.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#6452db] flex items-center justify-center text-[9px] text-white font-medium">
              {c.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white truncate">{c.name}</p>
              <p className="text-[9px] text-white/40">{c.company}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-[#f0ad4e]" />
              <span className="text-[10px] text-white/60">{c.score}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MiniAI() {
  return (
    <div className="bg-[#18191b] border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <BrainCircuit className="w-3.5 h-3.5 text-[#6452db]" />
        <span className="text-xs text-white/60">AI Insights</span>
      </div>
      <div className="space-y-2">
        {[
          { icon: TrendingUp, text: "Revenue up 23% this quarter", color: "#8dc572" },
          { icon: Activity, text: "3 deals at risk — follow up", color: "#f0ad4e" },
          { icon: BarChart3, text: "Pipeline velocity +15%", color: "#5683da" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-2 p-2 rounded-md bg-white/[0.02]"
          >
            <item.icon className="w-3 h-3 flex-shrink-0" style={{ color: item.color }} />
            <span className="text-[11px] text-white/70">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function HeroDashboardPreview() {
  const [currentView, setCurrentView] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const renderView = () => {
    switch (views[currentView].id) {
      case "stats":
        return <MiniStatCards />;
      case "chart":
        return <MiniChart />;
      case "pipeline":
        return <MiniPipeline />;
      case "contacts":
        return <MiniContacts />;
      case "ai":
        return <MiniAI />;
      default:
        return <MiniStatCards />;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-[#6452db]/20 rounded-3xl blur-3xl opacity-40" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="relative bg-[#0b0d10]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
        style={{ perspective: "1000px" }}
      >
        {/* Window controls */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#be6464]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f0ad4e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#8dc572]" />
          <div className="ml-auto flex items-center gap-3">
            {views.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setCurrentView(i)}
                className={`text-[10px] transition-colors ${
                  i === currentView ? "text-white" : "text-white/30 hover:text-white/50"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={views[currentView].id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            key={currentView}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "linear" }}
            className="h-full bg-[#6452db] rounded-full"
          />
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 bg-[#18191b] border border-white/10 rounded-lg p-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#8dc572]/20 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-[#8dc572]" />
          </div>
          <div>
            <p className="text-[10px] text-white/40">Growth</p>
            <p className="text-xs text-white font-medium">+24.1%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-4 bg-[#18191b] border border-white/10 rounded-lg p-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#ff8964]/20 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-[#ff8964]" />
          </div>
          <div>
            <p className="text-[10px] text-white/40">Deals</p>
            <p className="text-xs text-white font-medium">$1.2M</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
