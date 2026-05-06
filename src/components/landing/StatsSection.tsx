import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { value: 30, suffix: "+", label: "Modules" },
  { value: 100, suffix: "%", label: "Cloud Native" },
  { value: 99, suffix: "%", label: "Uptime SLA" },
  { value: 24, suffix: "/7", label: "Support" },
];

export default function StatsSection() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="text-center"
        >
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
            <AnimatedCounter
              target={stat.value}
              suffix={stat.suffix}
              duration={2.5}
            />
          </div>
          <div className="text-sm text-white/40 uppercase tracking-wider">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
