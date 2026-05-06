import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Key,
  Smartphone,
  Fingerprint,
  Globe,
  Clock,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  Monitor,
  SmartphoneIcon,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ssoProviders = [
  { name: "Google Workspace", status: "connected", domain: "startops.com", lastSync: "2 hours ago" },
  { name: "Microsoft Azure AD", status: "connected", domain: "startops.com", lastSync: "1 day ago" },
  { name: "Okta", status: "disconnected", domain: "-", lastSync: "Never" },
  { name: "OneLogin", status: "disconnected", domain: "-", lastSync: "Never" },
];

export default function Security() {
  const { user } = useAuth();
  const [twoFA, setTwoFA] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    fetchSessions();
    checkMFAStatus();
  }, []);

  async function checkMFAStatus() {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setTwoFA(data?.currentLevel === "aal2");
  }

  async function fetchSessions() {
    try {
      setLoadingSessions(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      // We only have current session info from client, show mock for demo
      setSessions([
        { id: 1, device: "Chrome on macOS", location: "San Francisco, CA", ip: "192.168.1.105", current: true, lastActive: "Now" },
        { id: 2, device: "Safari on iPhone", location: "San Francisco, CA", ip: "192.168.1.110", current: false, lastActive: "2 hours ago" },
      ]);
    } catch (error: any) {
      toast.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  }

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one special character";
    return null;
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const pwError = validatePassword(newPassword);
    if (pwError) {
      toast.error(pwError);
      return;
    }
    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Failed to change password: " + error.message);
    } finally {
      setChangingPassword(false);
    }
  }

  async function toggle2FA() {
    try {
      if (!twoFA) {
        // Enroll MFA - simplified flow
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
        if (error) throw error;
        toast.success("2FA enrollment initiated. Check your authenticator app.");
      } else {
        // Unenroll would need factorId
        toast.info("Contact support to disable 2FA");
      }
    } catch (error: any) {
      toast.error("2FA operation failed: " + error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Security & Authentication</h1>
        <p className="text-sm text-white/50 mt-1">Manage authentication, access control, and compliance settings</p>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="auth" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Shield className="w-4 h-4 mr-2" />Authentication</TabsTrigger>
          <TabsTrigger value="sso" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Globe className="w-4 h-4 mr-2" />SSO / SAML</TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Clock className="w-4 h-4 mr-2" />Sessions</TabsTrigger>
          <TabsTrigger value="access" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Key className="w-4 h-4 mr-2" />Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#5683da]/20 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-[#5683da]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-white/50 mt-1 max-w-lg">Require a second verification step when signing in.</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="bg-[#8dc572]/20 text-[#8dc572] text-xs"><Check className="w-3 h-3 mr-1" />Authenticator App</Badge>
                    </div>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={() => toggle2FA()} className="data-[state=checked]:bg-[#6452db]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-[#ff8964]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white">Change Password</h3>
                  <p className="text-sm text-white/50 mt-1">Update your account password</p>
                  <form onSubmit={changePassword} className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">New Password</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#0b0d10] border-white/10 text-white pr-10" required minLength={8} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-white/40">Min 8 chars, uppercase, lowercase, number, special char</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Confirm Password</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-[#0b0d10] border-white/10 text-white" required />
                    </div>
                    <Button type="submit" disabled={changingPassword} className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Update Password
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-medium text-white">Single Sign-On (SSO)</h3>
                  <p className="text-sm text-white/50 mt-1">Configure SAML 2.0 identity providers</p>
                </div>
                <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} className="data-[state=checked]:bg-[#6452db]" />
              </div>
              <div className="space-y-3">
                {ssoProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Globe className="w-4 h-4 text-white/40" /></div>
                      <div>
                        <p className="text-sm font-medium text-white">{provider.name}</p>
                        <p className="text-xs text-white/40">Domain: {provider.domain} · Last sync: {provider.lastSync}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${provider.status === "connected" ? "bg-[#8dc572]/20 text-[#8dc572]" : "bg-white/10 text-white/50"}`}>
                      {provider.status === "connected" ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}{provider.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-medium text-white">Session Management</h3>
                  <p className="text-sm text-white/50 mt-1">Control session duration and automatic logout</p>
                </div>
                <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} className="data-[state=checked]:bg-[#6452db]" />
              </div>
              <h4 className="text-sm font-medium text-white mb-3">Active Sessions</h4>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {session.device.includes("iPhone") ? <SmartphoneIcon className="w-4 h-4 text-white/40" /> : <Monitor className="w-4 h-4 text-white/40" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{session.device}</p>
                          {session.current && <Badge variant="secondary" className="bg-[#8dc572]/20 text-[#8dc572] text-xs">Current</Badge>}
                        </div>
                        <p className="text-xs text-white/40">{session.location} · {session.ip} · {session.lastActive}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-[#be6464] hover:text-[#be6464] hover:bg-[#be6464]/10"><LogOut className="w-4 h-4 mr-2" />Revoke</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f0ad4e]/20 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-[#f0ad4e]" /></div>
                  <div>
                    <h3 className="text-base font-medium text-white">IP Restrictions</h3>
                    <p className="text-sm text-white/50 mt-1">Limit access to specific IP addresses</p>
                  </div>
                </div>
                <Switch checked={ipRestriction} onCheckedChange={setIpRestriction} className="data-[state=checked]:bg-[#6452db]" />
              </div>
              {ipRestriction && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <Badge variant="secondary" className="bg-[#8dc572]/20 text-[#8dc572] text-xs">Allow</Badge>
                    <span className="text-sm text-white/70 font-mono">192.168.1.0/24</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-white/30 hover:text-[#be6464]"><X className="w-3 h-3" /></Button>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"><Plus className="w-4 h-4 mr-2" />Add IP Range</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}