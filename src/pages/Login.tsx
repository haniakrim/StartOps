import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { loginRateLimiter, signupRateLimiter } from "@/lib/rate-limiter";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitMs, setRateLimitMs] = useState(0);

  useEffect(() => {
    if (rateLimitMs <= 0) return;
    const interval = setInterval(() => {
      const check = loginRateLimiter.check();
      setRateLimitMs(check.remainingMs);
      if (check.allowed) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitMs]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const rateCheck = loginRateLimiter.check();
    if (!rateCheck.allowed) {
      setRateLimitMs(rateCheck.remainingMs);
      toast({
        title: "Too many attempts",
        description: `Please wait ${Math.ceil(rateCheck.remainingMs / 1000)}s before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const rateResult = loginRateLimiter.recordFailure();
        setRateLimitMs(rateResult.remainingMs);

        // Generic error message to prevent account enumeration
        toast({
          title: "Authentication failed",
          description: "Invalid credentials. Please check your email and password.",
          variant: "destructive",
        });
      } else {
        loginRateLimiter.recordSuccess();
        navigate("/");
      }
    } catch {
      loginRateLimiter.recordFailure();
      toast({
        title: "Authentication failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const rateCheck = signupRateLimiter.check();
    if (!rateCheck.allowed) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${Math.ceil(rateCheck.remainingMs / 1000)}s before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        signupRateLimiter.recordFailure();
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        signupRateLimiter.recordSuccess();
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch {
      signupRateLimiter.recordFailure();
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isRateLimited = rateLimitMs > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">StartOps CRM</CardTitle>
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
                    disabled={isRateLimited}
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
                    disabled={isRateLimited}
                  />
                </div>
                {isRateLimited && (
                  <p className="text-sm text-destructive">
                    Too many failed attempts. Please wait {Math.ceil(rateLimitMs / 1000)}s.
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading || isRateLimited}>
                  {loading ? "Signing in..." : "Sign In"}
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
  );
};

export default Login;