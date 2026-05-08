import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  reversed?: boolean;
  badge?: string;
}

export default function FeatureSection({
  title,
  description,
  children,
  reversed = false,
  badge,
}: FeatureSectionProps) {
  return (
    <div
      className={`flex flex-col ${
        reversed ? "lg:flex-row-reverse" : "lg:flex-row"
      } items-center gap-12 lg:gap-16`}
    >
      <motion.div
        initial={{ opacity: 0, x: reversed ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1"
      >
        {badge && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 text-xs text-white/50">
            {badge}
          </span>
        )}
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">{title}</h3>
        <p className="text-base text-white/50 leading-relaxed">{description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reversed ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1 w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}