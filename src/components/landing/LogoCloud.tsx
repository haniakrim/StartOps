import { motion } from "framer-motion";
import {
  Building2,
  Rocket,
  Zap,
  Globe,
  Shield,
  Cpu,
  Layers,
  Hexagon,
} from "lucide-react";

const logos = [
  { name: "TechFlow", icon: Cpu },
  { name: "DataSync", icon: Layers },
  { name: "CloudNine", icon: Globe },
  { name: "SecureBase", icon: Shield },
  { name: "FastTrack", icon: Rocket },
  { name: "PowerGrid", icon: Zap },
  { name: "HexaCorp", icon: Hexagon },
  { name: "BuildRight", icon: Building2 },
];

export default function LogoCloud() {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A1628] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A1628] to-transparent z-10" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-12 animate-marquee"
        style={{
          animation: "marquee 30s linear infinite",
        }}
      >
        {[...logos, ...logos, ...logos].map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex items-center gap-2 shrink-0 opacity-30 hover:opacity-50 transition-opacity"
          >
            <logo.icon className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {logo.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
