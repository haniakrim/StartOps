import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if 2FA is enabled (simulated)
      if (data.user) {
        setShowTwoFactor(true);
        toast({
          title: "Two-Factor Authentication",
          description: "Enter the 6-digit code from your authenticator app",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate 2FA verification
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Success",
        description: "Authenticated successfully",
      });
      navigate("/");
    }, 1000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: email.split("@")[0],
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Check your email to confirm your account",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#0b0d10" }}>
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "#5b3df0" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: "#ff8964" }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#6452db] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Enterprise CRM</h1>
        </div>

        <Card className="border-[rgba(255,255,255,0.10)] bg-[rgba(24,25,27,0.78)] backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">
              {showTwoFactor ? "Two-Factor Authentication" : "Welcome back"}
            </CardTitle>
            <CardDescription className="text-white/60">
              {showTwoFactor
                ? "Enter the verification code from your authenticator"
                : "Sign in to your enterprise account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showTwoFactor ? (
              <form onSubmit={handleTwoFactor} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/85">Authentication Code</Label>
                  <Input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="bg-[#18191b] border-[#303236] text-white text-center text-lg tracking-[0.5em]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white"
                  disabled={loading || twoFactorCode.length !== 6}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                  onClick={() => setShowTwoFactor(false)}
                >
                  Back to sign in
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#18191b] mb-4">
                  <TabsTrigger value="login" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/60">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/60">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/85">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="bg-[#18191b] border-[#303236] text-white placeholder:text-white/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/85">Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[#18191b] border-[#303236] text-white placeholder:text-white/30 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-white text-[#0b0d10] hover:bg-white/90 font-medium"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/85">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="bg-[#18191b] border-[#303236] text-white placeholder:text-white/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/85">Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-[#18191b] border-[#303236] text-white placeholder:text-white/30 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#6452db] hover:bg-[#5645c7] text-white"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {/* Enterprise features */}
            <div className="mt-6 pt-4 border-t border-[#303236]">
              <div className="flex items-center gap-2 text-xs text-white/45">
                <Shield className="w-3 h-3" />
                <span>SSO/SAML • 2FA • Session Management • Audit Logs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
