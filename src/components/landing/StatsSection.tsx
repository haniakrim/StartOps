import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { value: 30, suffix: "+", label: "Modules", description: "Everything you need" },
  { value: 100, suffix: "%", label: "AI-Powered", description: "Smart insights everywhere" },
  { value: 0, suffix: "", label: "Setup Time", description: "Get started instantly", isText: true, textValue: "< 1 min" },
  { value: 99, suffix: "%", label: "Uptime", description: "Enterprise reliability" },
];

export function StatsSection() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="relative bg-[#18191b] border border-white/[0.06] rounded-xl p-5 text-center group hover:border-white/10 transition-colors"
        >
          <div className="absolute inset-0 rounded-xl bg-[#6452db]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {stat.isText ? (
                <span>{stat.textValue}</span>
              ) : (
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2}
                />
              )}
            </p>
            <p className="text-sm font-medium text-white/70 mt-1">{stat.label}</p>
            <p className="text-xs text-white/40 mt-0.5">{stat.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
