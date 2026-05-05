import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  BarChart3,
  Users,
  Globe,
  Lock,
  Workflow,
  Webhook,
  FileText,
  Headphones,
  Star,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SSO/SAML, 2FA, IP restrictions, and granular RBAC with full audit trails.",
    color: "#5683da",
  },
  {
    icon: Workflow,
    title: "Advanced Automation",
    description:
      "Custom workflows, deal automation, and trigger-based actions to streamline your pipeline.",
    color: "#ff8964",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description:
      "Real-time dashboards, forecasting, conversion funnels, and team performance metrics.",
    color: "#6452db",
  },
  {
    icon: Webhook,
    title: "API & Integrations",
    description:
      "RESTful API with rate limiting, webhooks, and native integrations with your stack.",
    color: "#8dc572",
  },
];

const enterpriseFeatures = [
  "SSO / SAML Authentication",
  "Two-Factor Authentication (2FA)",
  "Granular Role-Based Access Control",
  "Team Hierarchies & Departments",
  "Audit Logs & Compliance",
  "Custom Fields & Objects",
  "Workflow Automation",
  "API Access with Rate Limiting",
  "Webhook Integrations",
  "White-labeling Options",
  "Advanced Reporting & Analytics",
  "Data Export (CSV, JSON, XLSX)",
  "Enterprise SLA & Support",
  "Dedicated Customer Success Manager",
];

const testimonials = [
  {
    quote:
      "NexusCRM transformed our sales process. The automation features alone saved us 20 hours per week.",
    author: "Sarah Chen",
    role: "VP of Sales, Acme Corp",
  },
  {
    quote:
      "The enterprise security features and audit logs give our compliance team complete confidence.",
    author: "James Wilson",
    role: "CTO, TechStart Inc",
  },
  {
    quote:
      "Best-in-class API and webhook support. We integrated with our entire stack in under a week.",
    author: "Maria Garcia",
    role: "Head of Engineering, Global Systems",
  },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0d10]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6452db] flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-white tracking-tight">
                NexusCRM
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#enterprise"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Enterprise
              </a>
              <a
                href="#pricing"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Testimonials
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="bg-white text-[#0b0d10] hover:bg-white/90 rounded-full px-5">
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden text-white/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0b0d10] border-b border-white/5 px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block text-sm text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#enterprise"
              className="block text-sm text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Enterprise
            </a>
            <a
              href="#pricing"
              className="block text-sm text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <Link
              to="/dashboard"
              className="block w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full bg-white text-[#0b0d10] hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#5b3df0] rounded-full opacity-20 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-[#3b82f6] rounded-full opacity-15 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-[#ff8964] rounded-full opacity-10 blur-[120px] animate-pulse-glow" />

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="bg-[#6452db]/20 text-[#6452db] border-[#6452db]/30 mb-6"
          >
            <Star className="w-3 h-3 mr-1" />
            Enterprise CRM Platform
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[0.9] mb-6">
            Everything your sales
            <br />
            <span className="text-[#ff8964]">team needs</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            The enterprise-grade CRM with advanced security, custom workflows,
            deep analytics, and seamless integrations. Built for teams that
            demand more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button className="bg-white text-[#0b0d10] hover:bg-white/90 rounded-full px-8 py-6 text-base font-medium">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 py-6 text-base"
              >
                View Demo
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-white/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm">GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">99.99% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Built for enterprise scale
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Advanced features that power the world's fastest-growing sales teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors"
              >
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon
                      className="w-6 h-6"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                variant="secondary"
                className="bg-[#ff8964]/20 text-[#ff8964] border-[#ff8964]/30 mb-6"
              >
                <Zap className="w-3 h-3 mr-1" />
                Enterprise Plan
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-6">
                Security and compliance
                <br />
                <span className="text-[#ff8964]">at every layer</span>
              </h2>
              <p className="text-lg text-white/50 mb-8">
                From SSO and 2FA to granular audit logs and custom permissions,
                NexusCRM is built to meet the most stringent enterprise
                requirements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {enterpriseFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#8dc572]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#8dc572]" />
                    </div>
                    <span className="text-sm text-white/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[#6452db] rounded-3xl opacity-10 blur-3xl" />
              <Card className="relative bg-[#18191b]/80 backdrop-blur-sm border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#6452db]" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">
                        Security Dashboard
                      </h3>
                      <p className="text-xs text-white/40">
                        Real-time security overview
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "SSO Status", value: "Active", status: "good" },
                      { label: "2FA Enrollment", value: "94%", status: "good" },
                      { label: "Failed Logins (24h)", value: "3", status: "warn" },
                      { label: "Active Sessions", value: "47", status: "good" },
                      { label: "API Keys", value: "12 active", status: "good" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5"
                      >
                        <span className="text-sm text-white/60">
                          {item.label}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            item.status === "good"
                              ? "bg-[#8dc572]/20 text-[#8dc572]"
                              : "bg-[#f0ad4e]/20 text-[#f0ad4e]"
                          }`}
                        >
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Trusted by enterprise teams
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              See why leading companies choose NexusCRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card
                key={t.author}
                className="bg-[#18191b] border-white/10"
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-4 h-4 fill-[#f0ad4e] text-[#f0ad4e]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6452db] flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {t.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.author}</p>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-[#ff8964] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative p-12 rounded-3xl bg-[#18191b] border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Ready to transform your sales?
            </h2>
            <p className="text-lg text-white/50 mb-8 max-w-xl mx-auto">
              Start your 14-day free trial. No credit card required. Full
              enterprise features included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button className="bg-white text-[#0b0d10] hover:bg-white/90 rounded-full px-8 py-6 text-base font-medium">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 py-6 text-base"
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Integrations", "API", "Security"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-4">
                Enterprise
              </h4>
              <ul className="space-y-2">
                {["SSO", "Audit Logs", "SLA", "Support"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security", "Compliance"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#6452db] flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="text-sm text-white/40">
                © 2024 NexusCRM. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                SOC 2 Type II
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[#5683da]/20 text-[#5683da] text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                GDPR
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
