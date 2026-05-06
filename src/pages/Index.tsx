import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Sparkles,
  BrainCircuit,
  GitBranch,
  Users,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDashboardPreview } from "@/components/landing/HeroDashboardPreview";
import { ModuleGrid } from "@/components/landing/ModuleGrid";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FadeIn } from "@/components/landing/FadeIn";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6452db] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0d10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6452db] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">StartOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20"
            style={{
              background:
                "radial-gradient(ellipse, #6452db30 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-40 right-0 w-[400px] h-[400px] opacity-10"
            style={{
              background:
                "radial-gradient(circle, #ff896420 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-10"
            style={{
              background:
                "radial-gradient(circle, #5683da20 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6452db]/10 border border-[#6452db]/20 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6452db]" />
                <span className="text-xs text-[#6452db] font-medium">
                  Now with AI-powered insights
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
              >
                Everything your startup{" "}
                <span className="relative">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6452db, #ff8964)",
                    }}
                  >
                    needs to grow
                  </span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/50 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                The all-in-one platform for startups. Manage contacts, track
                deals, run your finances, and get AI insights — all in one
                place.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#6452db] text-white hover:bg-[#6452db]/90 h-12 px-8 text-base"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-white/10 text-white hover:bg-white/5 h-12 px-8 text-base"
                >
                  Sign In
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
              >
                {[
                  { icon: Shield, label: "Enterprise Security" },
                  { icon: Zap, label: "Real-time Sync" },
                  { icon: BrainCircuit, label: "AI Assistant" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-white/30"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <HeroDashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <StatsSection />
        </div>
      </section>

      {/* Module Grid Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
              <Zap className="w-3.5 h-3.5 text-[#f0ad4e]" />
              <span className="text-xs text-white/50">One platform, endless possibilities</span>
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
              30+ modules, zero compromises
            </h2>
            <p className="text-base text-white/50 max-w-2xl mx-auto">
              From CRM to finance, project management to AI analytics — every
              tool your startup needs, deeply integrated and ready to scale.
            </p>
          </FadeIn>

          <ModuleGrid />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 lg:py-28 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          {/* Feature 1: AI Insights */}
          <FeatureSection
            title="AI-powered insights that actually matter"
            description="Stop guessing. Start knowing. Our AI analyzes your pipeline, identifies at-risk deals, forecasts revenue, and surfaces anomalies before they become problems."
            badge="AI Intelligence"
          >
            <div className="bg-[#18191b] border border-white/10 rounded-xl p-5 space-y-3">
              {[
                {
                  icon: BarChart3,
                  text: "Revenue forecast: $1.2M (+23% QoQ)",
                  color: "#8dc572",
                },
                {
                  icon: BrainCircuit,
                  text: "3 deals flagged as at-risk",
                  color: "#f0ad4e",
                },
                {
                  icon: Users,
                  text: "Lead conversion up 18% this month",
                  color: "#5683da",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon
                      className="w-4 h-4"
                      style={{ color: item.color }}
                    />
                  </div>
                  <span className="text-sm text-white/70">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </FeatureSection>

          {/* Feature 2: Pipeline */}
          <FeatureSection
            title="Visual pipeline that moves as fast as you do"
            description="Drag-and-drop deals across stages. See pipeline value at a glance. Track probability, expected close dates, and lead sources — all in a beautiful Kanban view."
            reversed
            badge="Sales"
          >
            <div className="bg-[#18191b] border border-white/10 rounded-xl p-5">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                  { name: "Lead", count: 12, color: "#5683da", value: "$240K" },
                  {
                    name: "Qualified",
                    count: 8,
                    color: "#6452db",
                    value: "$480K",
                  },
                  {
                    name: "Proposal",
                    count: 5,
                    color: "#ff8964",
                    value: "$320K",
                  },
                  {
                    name: "Closed",
                    count: 3,
                    color: "#8dc572",
                    value: "$180K",
                  },
                ].map((stage) => (
                  <div
                    key={stage.name}
                    className="flex-shrink-0 w-32 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-xs text-white/60">
                        {stage.name}
                      </span>
                      <span className="text-[10px] text-white/30 ml-auto">
                        {stage.count}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {Array.from({ length: Math.min(stage.count, 3) }).map(
                        (_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0b0d10] border border-white/5 rounded-md p-2"
                          >
                            <div className="h-1.5 w-16 bg-white/10 rounded mb-1" />
                            <div className="h-1 w-10 bg-white/5 rounded" />
                          </motion.div>
                        )
                      )}
                    </div>
                    <p className="text-xs text-white/40 text-center">
                      {stage.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FeatureSection>

          {/* Feature 3: Finance */}
          <FeatureSection
            title="Finance that keeps up with your ambition"
            description="Invoices, expenses, vendor management, and cash flow forecasting — all with AI anomaly detection that catches issues before they cost you."
            badge="Finance"
          >
            <div className="bg-[#18191b] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Revenue", value: "$94,200", color: "#8dc572" },
                  { label: "Outstanding", value: "$32,400", color: "#5683da" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#0b0d10] border border-white/5 rounded-lg p-3"
                  >
                    <p className="text-[10px] text-white/40 mb-1">{stat.label}</p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1 h-16">
                {[42, 38, 55, 48, 62, 58, 75].map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${v}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="flex-1 rounded-t-sm bg-[#6452db]/40"
                    style={{ minHeight: "4px" }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#be6464]/5 border border-[#be6464]/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#be6464]" />
                <span className="text-xs text-white/50">
                  AI detected: Duplicate invoice #INV-2045
                </span>
              </div>
            </div>
          </FeatureSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <CTASection onGetStarted={() => navigate("/login")} />
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
