import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Eye, EyeOff, Loader2, Shield, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
        
        // If session is returned, email confirmation is disabled — auto-login
        if (data.session) {
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
    <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#6452db] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            StartOps
          </h1>
          <p className="text-sm text-white/50 mt-2">
            {isSignUp ? "Create your admin account" : "Sign in to your workspace"}
          </p>
          {isSignUp && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8dc572]/10 border border-[#8dc572]/20">
              <Shield className="w-3.5 h-3.5 text-[#8dc572]" />
              <span className="text-xs text-[#8dc572] font-medium">New accounts are automatically assigned admin role</span>
            </div>
          )}
        </div>

        <div className="bg-[#18191b] border border-white/10 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[#0b0d10] border-white/10 text-white"
                    placeholder="John"
                    required={isSignUp}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-[#0b0d10] border-white/10 text-white"
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
                className="bg-[#0b0d10] border-white/10 text-white"
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
                  className="bg-[#0b0d10] border-white/10 text-white pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90 h-10"
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

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[#ff8964] hover:text-[#ff8964]/80 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up as admin"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Enterprise-grade security with SSO, SAML, and 2FA support
        </p>
      </div>
    </div>
  );
}