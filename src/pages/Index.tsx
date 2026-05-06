import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/landing/StaggerContainer";
import HeroDashboardPreview from "@/components/landing/HeroDashboardPreview";
import FeatureSection from "@/components/landing/FeatureSection";
import StatsSection from "@/components/landing/StatsSection";
import ModuleGrid from "@/components/landing/ModuleGrid";
import LogoCloud from "@/components/landing/LogoCloud";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A1628] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0066B1] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">StartOps</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Modules", "Pricing", "Docs"].map((item) => (
              <span
                key={item}
                className="text-sm text-white/50 hover:text-white transition-colors cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm bg-[#0066B1] text-white hover:bg-[#0066B1]/90 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066B1]/10 border border-[#0066B1]/20 text-sm text-[#00BFFF] mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BFFF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BFFF]"></span>
                  </span>
                  Now with AI-powered insights
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                  The all-in-one{" "}
                  <span className="text-[#00BFFF]">operating system</span>{" "}
                  for startups
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
                  CRM, finance, projects, inventory, and analytics — unified in one
                  powerful platform. Built for founders who move fast.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-8 h-12 text-base bg-[#0066B1] text-white hover:bg-[#0066B1]/90 rounded-lg transition-colors"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    className="flex items-center gap-2 px-8 h-12 text-base border border-white/10 text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="mt-12 flex items-center gap-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-[#1A2332] border-2 border-[#0A1628] flex items-center justify-center"
                      >
                        <span className="text-xs text-white/60">{i}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-white/40">
                    Trusted by{" "}
                    <span className="text-white/60 font-medium">2,000+ startups</span>
                  </p>
                </div>
              </FadeIn>
            </div>

            <FadeIn direction="left" delay={0.2}>
              <HeroDashboardPreview />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-white/30 mb-8">
            Trusted by innovative teams worldwide
          </p>
          <LogoCloud />
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <StatsSection />
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Everything you need to{" "}
                <span className="text-[#E63946]">operate at scale</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                From first customer to enterprise — StartOps grows with you.
              </p>
            </FadeIn>
          </div>

          <FeatureSection
            title="Unified Customer Intelligence"
            description="Track every touchpoint across the customer journey. From first visit to renewal, see the complete picture in one place."
            badge="CRM"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Contacts", value: "12,450", change: "+24%" },
                { label: "Companies", value: "3,200", change: "+18%" },
                { label: "Deals", value: "$2.4M", change: "+32%" },
                { label: "Activities", value: "8,900", change: "+15%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-xs text-[#8dc572]">{stat.change}</p>
                </div>
              ))}
            </div>
          </FeatureSection>

          <FeatureSection
            title="Real-Time Financial Visibility"
            description="Know your burn rate, runway, and revenue in real-time. Connect your bank, Stripe, and accounting tools for a complete financial picture."
            badge="Finance"
            reversed
          >
            <div className="space-y-3">
              {[
                { label: "Monthly Revenue", value: "$124,500", bar: 75, color: "#0066B1" },
                { label: "Burn Rate", value: "$48,200", bar: 45, color: "#E63946" },
                { label: "Runway", value: "18 months", bar: 60, color: "#00BFFF" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">{item.label}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.bar}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FeatureSection>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                30+ integrated{" "}
                <span className="text-[#00BFFF]">modules</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Every tool you need, connected and unified. No more switching
                between apps.
              </p>
            </FadeIn>
          </div>

          <ModuleGrid />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <CTASection />
        </div>
      </section>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6">
        <LandingFooter />
      </div>
    </div>
  );
}
