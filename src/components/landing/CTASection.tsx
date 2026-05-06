import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[#6452db]" />
      <div className="absolute inset-0 bg-[#0b0d10] opacity-90" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, #6452db40, transparent)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative px-8 py-16 lg:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#6452db]" />
          <span className="text-xs text-white/60">
            Start free — no credit card required
          </span>
        </motion.div>

        <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-4">
          Ready to grow your startup?
        </h2>
        <p className="text-base lg:text-lg text-white/50 max-w-xl mx-auto mb-8">
          Join thousands of founders using StartOps to manage their entire
          business — from first contact to final invoice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={onGetStarted}
            className="bg-[#6452db] text-white hover:bg-[#6452db]/90 h-12 px-8 text-base"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={onGetStarted}
            className="border-white/20 text-white hover:bg-white/5 h-12 px-8 text-base"
          >
            Sign In
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
