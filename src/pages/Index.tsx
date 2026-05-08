import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import FadeIn from "@/components/landing/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/landing/StaggerContainer";
import HeroLogo from "@/components/landing/HeroLogo";
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeroLogo className="w-8 h-8" />
          <span className="font-semibold text-foreground">StartOps</span>
        </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Modules", "Pricing", "Docs"].map((item) => (
              <span
                key={item}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-accent" />
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Now with AI-powered insights
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  The all-in-one{" "}
                  <span className="text-primary">operating system</span>{" "}
                  for startups
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  CRM, finance, projects, inventory, and analytics — unified in one
                  powerful platform. Built for founders who move fast.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-8 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    className="flex items-center gap-2 px-8 h-12 text-base border border-border text-foreground hover:bg-accent rounded-lg transition-colors"
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
                        className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground">{i}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trusted by{" "}
                    <span className="text-foreground font-medium">2,000+ startups</span>
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
      <section className="py-12 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8">
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
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Everything you need to{" "}
                <span className="text-hp-red">operate at scale</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-hp-green">{stat.change}</p>
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
                { label: "Monthly Revenue", value: "$124,500", bar: 75, color: "hsl(var(--primary))" },
                { label: "Burn Rate", value: "$48,200", bar: 45, color: "hsl(var(--hp-red))" },
                { label: "Runway", value: "18 months", bar: 60, color: "hsl(var(--hp-blue-light))" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-between justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
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
      <section className="py-20 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                30+ integrated{" "}
                <span className="text-primary">modules</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
