import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Building2, Eye, EyeOff, Loader2, Shield, UserPlus, LogIn, Lock, Mail, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function AnimatedHero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        viewBox="0 0 800 600"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#1a1d23" : "#f8fafc"} />
            <stop offset="100%" stopColor={isDark ? "#0f1115" : "#e2e8f0"} />
          </linearGradient>
          <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6452db" />
            <stop offset="100%" stopColor="#6452db" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8964" />
            <stop offset="100%" stopColor="#ff8964" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8dc572" />
            <stop offset="100%" stopColor="#8dc572" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <rect width="800" height="600" fill="url(#heroGrad)" />

        <circle cx="100" cy="80" r="1.5" fill={isDark ? "white" : "#6452db"} className="twinkle" style={{ animationDelay: "0s" }} />
        <circle cx="250" cy="120" r="1" fill={isDark ? "white" : "#ff8964"} className="twinkle" style={{ animationDelay: "1.2s" }} />
        <circle cx="400" cy="60" r="2" fill={isDark ? "white" : "#8dc572"} className="twinkle" style={{ animationDelay: "0.5s" }} />
        <circle cx="550" cy="150" r="1" fill={isDark ? "white" : "#6452db"} className="twinkle" style={{ animationDelay: "2s" }} />
        <circle cx="700" cy="90" r="1.5" fill={isDark ? "white" : "#ff8964"} className="twinkle" style={{ animationDelay: "0.8s" }} />
        <circle cx="150" cy="200" r="1" fill={isDark ? "white" : "#8dc572"} className="twinkle" style={{ animationDelay: "1.5s" }} />
        <circle cx="650" cy="220" r="1" fill={isDark ? "white" : "#6452db"} className="twinkle" style={{ animationDelay: "0.3s" }} />
        <circle cx="300" cy="40" r="1" fill={isDark ? "white" : "#ff8964"} className="twinkle" style={{ animationDelay: "2.5s" }} />
        <circle cx="500" cy="100" r="1.5" fill={isDark ? "white" : "#8dc572"} className="twinkle" style={{ animationDelay: "1.8s" }} />

        <line x1="200" y1="300" x2="350" y2="220" stroke="#6452db" strokeWidth="1" className="pulse-line" />
        <line x1="350" y1="220" x2="500" y2="280" stroke="#6452db" strokeWidth="1" className="pulse-line" style={{ animationDelay: "0.5s" }} />
        <line x1="500" y1="280" x2="650" y2="200" stroke="#6452db" strokeWidth="1" className="pulse-line" style={{ animationDelay: "1s" }} />
        <line x1="350" y1="220" x2="400" y2="350" stroke="#ff8964" strokeWidth="1" className="pulse-line" style={{ animationDelay: "0.3s" }} />
        <line x1="200" y1="300" x2="300" y2="400" stroke="#8dc572" strokeWidth="1" className="pulse-line" style={{ animationDelay: "0.7s" }} />
        <line x1="500" y1="280" x2="600" y2="380" stroke="#ff8964" strokeWidth="1" className="pulse-line" style={{ animationDelay: "1.2s" }} />

        <circle cx="200" cy="300" r="8" fill="#6452db" className="float" style={{ animationDelay: "0s" }} />
        <circle cx="350" cy="220" r="10" fill="#ff8964" className="float" style={{ animationDelay: "1s" }} />
        <circle cx="500" cy="280" r="7" fill="#8dc572" className="float" style={{ animationDelay: "2s" }} />
        <circle cx="650" cy="200" r="6" fill="#6452db" className="float" style={{ animationDelay: "0.5s" }} />
        <circle cx="400" cy="350" r="9" fill="#ff8964" className="float" style={{ animationDelay: "1.5s" }} />
        <circle cx="300" cy="400" r="5" fill="#8dc572" className="float" style={{ animationDelay: "0.3s" }} />
        <circle cx="600" cy="380" r="7" fill="#6452db" className="float" style={{ animationDelay: "2.5s" }} />

        <g fill={isDark ? "#0b0d10" : "#e2e8f0"} opacity="0.8">
          <rect x="50" y="380" width="60" height="220" rx="2" />
          <rect x="120" y="340" width="50" height="260" rx="2" />
          <rect x="180" y="360" width="70" height="240" rx="2" />
          <rect x="260" y="320" width="55" height="280" rx="2" />
          <rect x="320" y="350" width="65" height="250" rx="2" />
          <rect x="400" y="300" width="80" height="300" rx="2" />
          <rect x="490" y="340" width="50" height="260" rx="2" />
          <rect x="550" y="370" width="70" height="230" rx="2" />
          <rect x="630" y="330" width="60" height="270" rx="2" />
          <rect x="700" y="360" width="50" height="240" rx="2" />
        </g>

        <g fill="#6452db" opacity="0.4">
          <rect x="65" y="400" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.2s" }} />
          <rect x="85" y="400" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "1.1s" }} />
          <rect x="135" y="360" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.6s" }} />
          <rect x="155" y="360" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "1.8s" }} />
          <rect x="200" y="380" width="10" height="14" rx="1" className="twinkle" style={{ animationDelay: "0.4s" }} />
          <rect x="225" y="380" width="10" height="14" rx="1" className="twinkle" style={{ animationDelay: "1.3s" }} />
          <rect x="275" y="340" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.9s" }} />
          <rect x="295" y="340" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "2.1s" }} />
          <rect x="340" y="370" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.1s" }} />
          <rect x="360" y="370" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "1.6s" }} />
          <rect x="420" y="320" width="10" height="14" rx="1" className="twinkle" style={{ animationDelay: "0.7s" }} />
          <rect x="445" y="320" width="10" height="14" rx="1" className="twinkle" style={{ animationDelay: "1.4s" }} />
          <rect x="505" y="360" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.3s" }} />
          <rect x="525" y="360" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "2s" }} />
          <rect x="570" y="390" width="10" height="14" rx="1" className="twinkle" style={{ animationDelay: "0.5s" }} />
          <rect x="595" y="390" width="10" height="14" rx="1" className="twinkle" style={{ animationDelay: "1.2s" }} />
          <rect x="645" y="350" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.8s" }} />
          <rect x="665" y="350" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "1.9s" }} />
          <rect x="715" y="380" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "0.4s" }} />
          <rect x="735" y="380" width="8" height="12" rx="1" className="twinkle" style={{ animationDelay: "1.7s" }} />
        </g>

        <g transform="translate(320, 480)">
          <rect x="0" y="40" width="24" height="60" rx="3" fill="url(#barGrad1)" className="grow-bar" style={{ animationDelay: "0s", transformOrigin: "12px 100px" }} />
          <rect x="32" y="20" width="24" height="80" rx="3" fill="url(#barGrad2)" className="grow-bar" style={{ animationDelay: "0.3s", transformOrigin: "44px 100px" }} />
          <rect x="64" y="50" width="24" height="50" rx="3" fill="url(#barGrad3)" className="grow-bar" style={{ animationDelay: "0.6s", transformOrigin: "76px 100px" }} />
          <rect x="96" y="10" width="24" height="90" rx="3" fill="url(#barGrad1)" className="grow-bar" style={{ animationDelay: "0.9s", transformOrigin: "108px 100px" }} />
          <rect x="128" y="30" width="24" height="70" rx="3" fill="url(#barGrad2)" className="grow-bar" style={{ animationDelay: "1.2s", transformOrigin: "140px 100px" }} />
        </g>
      </svg>

      <div className="absolute bottom-12 left-12 right-12">
        <h2 className={cn("text-4xl font-bold mb-3 tracking-tight", isDark ? "text-white" : "text-foreground")}>
          StartOps
        </h2>
        <p className={cn("text-lg leading-relaxed max-w-md", isDark ? "text-white/60" : "text-muted-foreground")}>
          The intelligent CRM platform that helps teams close more deals, manage relationships, and grow revenue — all in one place.
        </p>
        <div className="flex items-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8dc572]" />
            <span className={cn("text-sm", isDark ? "text-white/50" : "text-muted-foreground")}>Real-time sync</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff8964]" />
            <span className={cn("text-sm", isDark ? "text-white/50" : "text-muted-foreground")}>AI-powered insights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#6452db]" />
            <span className={cn("text-sm", isDark ? "text-white/50" : "text-muted-foreground")}>Enterprise security</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
    const timer = setTimeout(() => setFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one special character";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSignUp) {
      const pwError = validatePassword(password);
      if (pwError) {
        toast.error(pwError);
        return;
      }
    }

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
              role: "user",
            });

          if (memError) throw memError;

          toast.success("Account created! Welcome.");
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
        if (error) {
          throw error;
        }
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
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-line {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.7; }
        }
        @keyframes grow-bar {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.8; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float {
          animation: float 6s ease-in-out infinite;
        }
        .pulse-line {
          animation: pulse-line 4s ease-in-out infinite;
        }
        .grow-bar {
          animation: grow-bar 5s ease-in-out infinite;
        }
        .twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .form-enter {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .float, .pulse-line, .grow-bar, .twinkle, .form-enter {
            animation: none !important;
          }
          .form-enter {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className={cn("min-h-screen flex", isDark ? "bg-[#0b0d10]" : "bg-background")}>
        {/* Left panel - Animated Hero */}
        <div className="hidden md:flex md:w-1/2 relative">
          <AnimatedHero />
        </div>

        {/* Right panel - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "absolute top-6 right-6 p-2.5 rounded-xl transition-all duration-300",
              isDark
                ? "text-white/40 hover:text-white hover:bg-white/5"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Sun
              className={cn(
                "w-5 h-5 absolute transition-all duration-300",
                isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
              )}
            />
            <Moon
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
              )}
            />
            <span className="sr-only">Toggle theme</span>
          </button>

          <div
            className={`w-full max-w-[420px] ${formVisible ? "form-enter" : "opacity-0"}`}
          >
            {/* Mobile logo */}
            <div className="md:hidden text-center mb-8">
              <div className="w-12 h-12 rounded-expo-xl bg-expo-blue flex items-center justify-center mx-auto mb-4">
               <Building2 className="w-6 h-6 text-white" />
             </div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                StartOps
              </h1>
            </div>

            <div className={cn(
              "border rounded-expo-xl p-6 sm:p-8 shadow-expo-lg dark:shadow-expo-dark-lg",
              isDark
                ? "bg-expo-dark-surface border-expo-dark-border"
                : "bg-card border-border"
            )}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isSignUp ? "Sign up to get started with your workspace" : "Sign in to your workspace"}
                </p>
              </div>

              {isSignUp && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">New accounts are assigned user role</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">First Name</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required={isSignUp}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Last Name</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="admin@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-medium transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSignUp ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-expo-blue hover:text-expo-blue/80 transition-colors"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                </button>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground/50">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-xs">SSL Secured</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-xs">Encrypted</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs">SOC 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}