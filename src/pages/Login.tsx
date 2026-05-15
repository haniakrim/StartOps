import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Zap, Shield, Users, BarChart3 } from "lucide-react";
import HeroLogo from "@/components/landing/HeroLogo";
import LoginHeroIllustration from "@/components/landing/LoginHeroIllustration";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data.session) {
        toast({
          title: "Authentication failed",
          description: "No session returned. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Manually persist the session to ensure storage adapter writes it
      const setResult = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      // Wait for storage to flush
      await sleep(400);

      // Full page reload so AuthContext picks up the session on /dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("[Login] Unexpected error:", err);
      toast({
        title: "Authentication failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        await sleep(400);
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-hp-slate relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />

        <div className="relative z-10 flex flex-col p-12 h-full">
          <div className="shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <HeroLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-foreground">StartOps</span>
            </div>

            <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">
              The all-in-one{" "}
              <span className="text-primary">operating system</span>{" "}
              for startups
            </h1>
            <p className="text-base text-muted-foreground max-w-md">
              CRM, finance, projects, inventory, and analytics — unified in one powerful platform.
            </p>
          </div>

          <div className="flex-1 min-h-0 my-4">
            <LoginHeroIllustration className="w-full h-full" />
          </div>

          <div className="shrink-0 space-y-3 mb-6">
            {[
              { icon: Zap, text: "AI-powered insights" },
              { icon: Shield, text: "Enterprise-grade security" },
              { icon: Users, text: "Team collaboration" },
              { icon: BarChart3, text: "Real-time analytics" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs text-muted-foreground">{i}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="text-foreground font-medium">2,000+ startups</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <HeroLogo className="w-8 h-8" />
              <span className="font-semibold text-lg">StartOps</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
