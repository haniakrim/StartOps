import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-destructive/10 border border-border p-12 lg:p-16 text-center"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />

      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-7 h-7 text-primary" />
        </motion.div>

        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to grow your startup?
        </h2>
        <p className="text-base text-white/50 max-w-xl mx-auto mb-8">
          Join thousands of founders who use StartOps to manage their entire
          business. Start free, scale as you grow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-8 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 h-12 text-base border border-white/10 text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </motion.div>
  );
}
