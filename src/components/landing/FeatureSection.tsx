import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  reversed?: boolean;
  badge?: string;
}

export function FeatureSection({
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
      } items-center gap-8 lg:gap-16`}
    >
      <motion.div
        initial={{ opacity: 0, x: reversed ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1 space-y-4"
      >
        {badge && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6452db]/10 text-[#6452db] border border-[#6452db]/20">
            {badge}
          </span>
        )}
        <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-base text-white/50 leading-relaxed max-w-lg">
          {description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reversed ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1 w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
