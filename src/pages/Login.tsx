import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Eye, EyeOff, Loader2, Shield, UserPlus, LogIn, ArrowRight, CheckCircle2, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function AnimatedHero() {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0d10] via-[#11131a] to-[#1a1630]" />

      {/* Floating orbs */}
      <div className="absolute top-[15%] left-[20%] w-64 h-64 rounded-full bg-[#6452db]/10 blur-3xl animate-orb-float-1" />
      <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-[#ff8964]/8 blur-3xl animate-orb-float-2" />
      <div className="absolute top-[50%] left-[50%] w-48 h-48 rounded-full bg-[#8dc572]/8 blur-3xl animate-orb-float-3" />

      {/* SVG Illustration */}
      <svg
        viewBox="0 0 600 500"
        className="relative z-10 w-full max-w-lg px-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background grid dots */}
        <g className="animate-twinkle-slow">
          {[...Array(20)].map((_, i) => (
            <circle
              key={`dot-${i}`}
              cx={50 + (i % 5) * 120 + Math.random() * 40}
              cy={40 + Math.floor(i / 5) * 100 + Math.random() * 30}
              r="1.5"
              fill="white"
              opacity="0.15"
              className={`animate-twinkle-${(i % 4) + 1}`}
            />
          ))}
        </g>

        {/* Connection lines */}
        <g stroke="white" strokeWidth="0.5" opacity="0.12">
          <line x1="120" y1="180" x2="220" y2="140" className="animate-pulse-line-1" />
          <line x1="220" y1="140" x2="320" y2="160" className="animate-pulse-line-2" />
          <line x1="320" y1="160" x2="420" y2="120" className="animate-pulse-line-3" />
          <line x1="120" y1="180" x2="180" y2="280" className="animate-pulse-line-2" />
          <line x1="220" y1="140" x2="280" y2="260" className="animate-pulse-line-1" />
          <line x1="320" y1="160" x2="380" y2="280" className="animate-pulse-line-3" />
          <line x1="180" y1="280" x2="280" y2="260" className="animate-pulse-line-1" />
          <line x1="280" y1="260" x2="380" y2="280" className="animate-pulse-line-2" />
        </g>

        {/* Network nodes */}
        <g>
          <circle cx="120" cy="180" r="16" fill="#6452db" opacity="0.9" className="animate-float-1" />
          <circle cx="120" cy="180" r="8" fill="white" opacity="0.3" className="animate-float-1" />
          
          <circle cx="220" cy="140" r="20" fill="#ff8964" opacity="0.85" className="animate-float-2" />
          <circle cx="220" cy="140" r="10" fill="white" opacity="0.25" className="animate-float-2" />
          
          <circle cx="320" cy="160" r="18" fill="#8dc572" opacity="0.85" className="animate-float-3" />
          <circle cx="320" cy="160" r="9" fill="white" opacity="0.25" className="animate-float-3" />
          
          <circle cx="420" cy="120" r="14" fill="#6452db" opacity="0.8" className="animate-float-1" />
          <circle cx="420" cy="120" r="7" fill="white" opacity="0.2" className="animate-float-1" />
          
          <circle cx="180" cy="280" r="15" fill="#ff8964" opacity="0.75" className="animate-float-3" />
          <circle cx="180" cy="280" r="7.5" fill="white" opacity="0.2" className="animate-float-3" />
          
          <circle cx="280" cy="260" r="17" fill="#6452db" opacity="0.8" className="animate-float-2" />
          <circle cx="280" cy="260" r="8.5" fill="white" opacity="0.2" className="animate-float-2" />
          
          <circle cx="380" cy="280" r="13" fill="#8dc572" opacity="0.75" className="animate-float-1" />
          <circle cx="380" cy="280" r="6.5" fill="white" opacity="0.2" className="animate-float-1" />
        </g>

        {/* Node icons */}
        <g fill="white" opacity="0.9">
          <text x="120" y="184" textAnchor="middle" fontSize="10" fontWeight="bold" className="animate-float-1">$</text>
          <text x="220" y="144" textAnchor="middle" fontSize="11" fontWeight="bold" className="animate-float-2">%</text>
          <text x="320" y="164" textAnchor="middle" fontSize="10" fontWeight="bold" className="animate-float-3">+</text>
          <text x="420" y="124" textAnchor="middle" fontSize="9" fontWeight="bold" className="animate-float-1">↑</text>
        </g>

        {/* Bar chart */}
        <g transform="translate(100, 340)">
          <rect x="0" y="60" width="24" height="40" rx="4" fill="#6452db" opacity="0.7" className="animate-grow-bar-1" />
          <rect x="36" y="40" width="24" height="60" rx="4" fill="#ff8964" opacity="0.7" className="animate-grow-bar-2" />
          <rect x="72" y="20" width="24" height="80" rx="4" fill="#8dc572" opacity="0.7" className="animate-grow-bar-3" />
          <rect x="108" y="30" width="24" height="70" rx="4" fill="#6452db" opacity="0.7" className="animate-grow-bar-2" />
          <rect x="144" y="10" width="24" height="90" rx="4" fill="#ff8964" opacity="0.7" className="animate-grow-bar-1" />
          <rect x="180" y="45" width="24" height="55" rx="4" fill="#8dc572" opacity="0.7" className="animate-grow-bar-3" />
          <rect x="216" y="25" width="24" height="75" rx="4" fill="#6452db" opacity="0.7" className="animate-grow-bar-1" />
          <rect x="252" y="5" width="24" height="95" rx="4" fill="#ff8964" opacity="0.7" className="animate-grow-bar-2" />
          <rect x="288" y="35" width="24" height="65" rx="4" fill="#8dc572" opacity="0.7" className="animate-grow-bar-3" />
          <rect x="324" y="15" width="24" height="85" rx="4" fill="#6452db" opacity="0.7" className="animate-grow-bar-1" />
        </g>

        {/* Chart base line */}
        <line x1="100" y1="440" x2="460" y2="440" stroke="white" strokeWidth="1" opacity="0.15" />

        {/* Growth line */}
        <path
          d="M 100 400 Q 180 380, 260 360 T 420 300"
          stroke="#8dc572"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          strokeDasharray="6 4"
          className="animate-dash-flow"
        />

        {/* Building silhouettes */}
        <g transform="translate(80, 460)" opacity="0.3">
          <rect x="0" y="0" width="30" height="40" rx="2" fill="white" />
          <rect x="35" y="-15" width="25" height="55" rx="2" fill="white" />
          <rect x="65" y="5" width="35" height="35" rx="2" fill="white" />
          <rect x="105" y="-10" width="28" height="50" rx="2" fill="white" />
          <rect x="138" y="8" width="32" height="32" rx="2" fill="white" />
          <rect x="175" y="-5" width="26" height="45" rx="2" fill="white" />
          <rect x="206" y="10" width="30" height="30" rx="2" fill="white" />
          <rect x="241" y="-8" width="28" height="48" rx="2" fill="white" />
          <rect x="274" y="5" width="34" height="35" rx="2" fill="white" />
          <rect x="313" y="-12" width="24" height="52" rx="2" fill="white" />
          <rect x="342" y="8" width="30" height="32" rx="2" fill="white" />
          <rect x="377" y="-3" width="28" height="43" rx="2" fill="white" />
        </g>
      </svg>

      {/* Brand text */}
      <div className="relative z-10 text-center px-8 mt-4">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
          Grow your business
          <br />
          <span className="text-[#6452db]">with confidence</span>
        </h2>
        <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
          The all-in-one CRM platform designed to help you close more deals and build lasting customer relationships.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <BarChart3 className="w-3.5 h-3.5 text-[#6452db]" />
            Pipeline Analytics
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <Users className="w-3.5 h-3.5 text-[#ff8964]" />
            Contact Management
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <TrendingUp className="w-3.5 h-3.5 text-[#8dc572]" />
            Revenue Forecasting
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .insert({
              name: `${firstName || email.split("@")[0]}'s Organization`,
              slug: `org-${Date.now()}`,
            })
            .select()
            .single();

          if (orgError) throw orgError;

          const { error: memError } = await supabase
            .from("organization_members")
            .insert({
              organization_id: orgData.id,
              user_id: data.user!.id,
              role: "admin",
            });

          if (memError) throw memError;

          toast.success("Account created! Welcome, admin.");
          navigate("/dashboard");
        } else {
          toast.success("Account created! Check your email to confirm, then sign in.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] flex">
      {/* Scoped animations */}
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes pulse-line {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.25; }
        }
        @keyframes grow-bar-1 {
          0%, 100% { transform: scaleY(0.7); }
          50% { transform: scaleY(1); }
        }
        @keyframes grow-bar-2 {
          0%, 100% { transform: scaleY(0.85); }
          50% { transform: scaleY(1); }
        }
        @keyframes grow-bar-3 {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1); }
        }
        @keyframes twinkle-1 {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        @keyframes twinkle-2 {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.25; }
        }
        @keyframes twinkle-3 {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes twinkle-4 {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.2; }
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-10px, 15px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.1); }
          66% { transform: translate(15px, -15px) scale(0.9); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, -25px) scale(1.08); }
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 7s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 8s ease-in-out infinite; }
        .animate-pulse-line-1 { animation: pulse-line 4s ease-in-out infinite; }
        .animate-pulse-line-2 { animation: pulse-line 5s ease-in-out infinite 1s; }
        .animate-pulse-line-3 { animation: pulse-line 6s ease-in-out infinite 0.5s; }
        .animate-grow-bar-1 { transform-origin: bottom; animation: grow-bar-1 5s ease-in-out infinite; }
        .animate-grow-bar-2 { transform-origin: bottom; animation: grow-bar-2 6s ease-in-out infinite 0.5s; }
        .animate-grow-bar-3 { transform-origin: bottom; animation: grow-bar-3 7s ease-in-out infinite 1s; }
        .animate-twinkle-1 { animation: twinkle-1 4s ease-in-out infinite; }
        .animate-twinkle-2 { animation: twinkle-2 5s ease-in-out infinite 1s; }
        .animate-twinkle-3 { animation: twinkle-3 6s ease-in-out infinite 0.5s; }
        .animate-twinkle-4 { animation: twinkle-4 7s ease-in-out infinite 2s; }
        .animate-orb-float-1 { animation: orb-float-1 20s ease-in-out infinite; }
        .animate-orb-float-2 { animation: orb-float-2 25s ease-in-out infinite; }
        .animate-orb-float-3 { animation: orb-float-3 18s ease-in-out infinite; }
        .animate-dash-flow { animation: dash-flow 2s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-1, .animate-float-2, .animate-float-3,
          .animate-pulse-line-1, .animate-pulse-line-2, .animate-pulse-line-3,
          .animate-grow-bar-1, .animate-grow-bar-2, .animate-grow-bar-3,
          .animate-twinkle-1, .animate-twinkle-2, .animate-twinkle-3, .animate-twinkle-4,
          .animate-orb-float-1, .animate-orb-float-2, .animate-orb-float-3,
          .animate-dash-flow, .animate-fade-in-up {
            animation: none !important;
          }
          .animate-fade-in-up { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Left panel — Animated Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <AnimatedHero />
      </div>

      {/* Right panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[420px] animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#6452db] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">StartOps</h1>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-white/50 mt-2">
              {isSignUp
                ? "Get started with your free admin account"
                : "Sign in to access your workspace"}
            </p>
            {isSignUp && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8dc572]/10 border border-[#8dc572]/20">
                <Shield className="w-3.5 h-3.5 text-[#8dc572]" />
                <span className="text-xs text-[#8dc572] font-medium">
                  New accounts are automatically assigned admin role
                </span>
              </div>
            )}
          </div>

          <div className="bg-[#18191b] border border-white/10 rounded-xl p-6 sm:p-8 shadow-xl shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">First Name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-[#0b0d10] border-white/10 text-white focus:border-[#6452db] focus:ring-[#6452db]/20 transition-colors"
                      placeholder="John"
                      required={isSignUp}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-[#0b0d10] border-white/10 text-white focus:border-[#6452db] focus:ring-[#6452db]/20 transition-colors"
                      placeholder="Doe"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0b0d10] border-white/10 text-white focus:border-[#6452db] focus:ring-[#6452db]/20 transition-colors"
                  placeholder="admin@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0b0d10] border-white/10 text-white pr-10 focus:border-[#6452db] focus:ring-[#6452db]/20 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90 h-11 text-sm font-medium transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Admin Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#ff8964] hover:text-[#ff8964]/80 transition-colors group"
              >
                {isSignUp ? (
                  <>
                    Already have an account? Sign in
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    Need an account? Sign up as admin
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-white/30">
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SSO Ready</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SAML 2.0</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2FA Support</span>
            </div>
          </div>

          <p className="text-center text-xs text-white/20 mt-4">
            Enterprise-grade security for your customer data
          </p>
        </div>
      </div>
    </div>
  );
}
