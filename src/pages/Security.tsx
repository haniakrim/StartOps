import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Smartphone,
  Fingerprint,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Save,
  ChevronRight,
  LogOut,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

const sessions: Session[] = [
  { id: "1", device: "Chrome on macOS", location: "San Francisco, CA", ip: "192.168.1.1", lastActive: "Now", current: true },
  { id: "2", device: "Safari on iPhone", location: "San Francisco, CA", ip: "192.168.1.2", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Firefox on Windows", location: "New York, NY", ip: "10.0.0.5", lastActive: "1 day ago", current: false },
  { id: "4", device: "API Token", location: "US-East", ip: "52.1.2.3", lastActive: "5 min ago", current: false },
];

const securityScore = 78;

export default function Security() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [samlEnabled, setSamlEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordMinLength, setPasswordMinLength] = useState("12");
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [allowedIps, setAllowedIps] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-app font-bold text-white">Security & Authentication</h1>
        <p className="text-sm text-white/45 mt-0.5">
          Manage authentication methods, session policies, and access controls
        </p>
      </div>

      {/* Security Score */}
      <Card className="bg-surface border-hairline-soft rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={securityScore >= 80 ? "#8dc572" : securityScore >= 60 ? "#f0ad4e" : "#eb5757"}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 34 * (securityScore / 100)} ${2 * Math.PI * 34}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{securityScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white/85 mb-1">Security Score</h3>
              <p className="text-xs text-white/45 mb-3">
                Your security configuration is good but can be improved. Enable biometric authentication and IP restrictions to reach 100%.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs text-white/45">2FA enabled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs text-white/45">SSO configured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-app-error" />
                  <span className="text-xs text-white/45">Biometric off</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-app-error" />
                  <span className="text-xs text-white/45">No IP restrictions</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="auth" className="space-y-6">
        <TabsList className="bg-surface border border-hairline-soft">
          <TabsTrigger value="auth" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Monitor className="w-3.5 h-3.5 mr-1.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="password" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            Password Policy
          </TabsTrigger>
          <TabsTrigger value="access" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            Access Control
          </TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="auth" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Authentication Methods</CardTitle>
              <CardDescription className="text-xs text-white/45">
                Configure how users authenticate with the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SSO/SAML */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-electric-blue/10">
                    <Globe className="w-4 h-4 text-electric-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">SSO / SAML 2.0</p>
                    <p className="text-xs text-white/30">Enterprise single sign-on via SAML</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-success/20 text-success text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                  <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} />
                </div>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet/10">
                    <Smartphone className="w-4 h-4 text-violet" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">Two-Factor Authentication</p>
                    <p className="text-xs text-white/30">Require TOTP or SMS for all users</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-success/20 text-success text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Enforced
                  </Badge>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
              </div>

              {/* Biometric */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-coral/10">
                    <Fingerprint className="w-4 h-4 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">Biometric Authentication</p>
                    <p className="text-xs text-white/30">WebAuthn / Fingerprint / Face ID</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-warning/20 text-warning text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Optional
                  </Badge>
                  <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
                </div>
              </div>

              {/* API Keys */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-hairline-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Key className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">API Key Authentication</p>
                    <p className="text-xs text-white/30">Bearer token access for integrations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-success/20 text-success text-xs">
                    Active
                  </Badge>
                  <Button variant="outline" size="sm" className="border-hairline-soft text-white/65 hover:text-white hover:bg-white/5">
                    Manage Keys
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-app font-medium text-white">Active Sessions</CardTitle>
                  <CardDescription className="text-xs text-white/45">
                    Manage active user sessions and devices
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-hairline-soft text-app-error hover:text-app-error hover:bg-app-error/10">
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    session.current
                      ? "bg-violet/5 border-violet/20"
                      : "bg-surface-elevated border-hairline-soft"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${session.current ? "bg-violet/10" : "bg-white/5"}`}>
                      <Monitor className={`w-4 h-4 ${session.current ? "text-violet" : "text-white/45"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white/85">{session.device}</p>
                        {session.current && (
                          <Badge variant="outline" className="border-violet/20 text-violet text-[10px] px-1.5">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-white/30">{session.location}</span>
                        <span className="text-xs text-white/20">·</span>
                        <span className="text-xs text-white/30">{session.ip}</span>
                        <span className="text-xs text-white/20">·</span>
                        <span className="text-xs text-white/30">{session.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-hairline-soft text-white/45 hover:text-app-error hover:bg-app-error/10"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Session Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Session Timeout</p>
                  <p className="text-xs text-white/30">Automatically log out inactive users</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="h-9 px-3 rounded-md bg-surface border border-hairline-soft text-sm text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="720">12 hours</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Concurrent Sessions</p>
                  <p className="text-xs text-white/30">Maximum sessions per user</p>
                </div>
                <select className="h-9 px-3 rounded-md bg-surface border border-hairline-soft text-sm text-white focus:outline-none focus:border-white/20">
                  <option value="3">3 sessions</option>
                  <option value="5">5 sessions</option>
                  <option value="10">10 sessions</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Remember Device</p>
                  <p className="text-xs text-white/30">Skip 2FA on trusted devices</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Policy Tab */}
        <TabsContent value="password" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Password Requirements</CardTitle>
              <CardDescription className="text-xs text-white/45">
                Enforce strong password policies across your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Minimum Length</p>
                  <p className="text-xs text-white/30">Characters required</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={passwordMinLength}
                    onChange={(e) => setPasswordMinLength(e.target.value)}
                    className="w-20 h-9 px-3 rounded-md bg-surface border border-hairline-soft text-sm text-white text-center focus:outline-none focus:border-white/20"
                    min="8"
                    max="32"
                  />
                  <span className="text-xs text-white/45">chars</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Require Special Characters</p>
                  <p className="text-xs text-white/30">!@#$%^&*() etc.</p>
                </div>
                <Switch checked={requireSpecialChars} onCheckedChange={setRequireSpecialChars} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Require Numbers</p>
                  <p className="text-xs text-white/30">0-9 digits</p>
                </div>
                <Switch checked={requireNumbers} onCheckedChange={setRequireNumbers} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Require Uppercase Letters</p>
                  <p className="text-xs text-white/30">A-Z characters</p>
                </div>
                <Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Password Expiration</p>
                  <p className="text-xs text-white/30">Force reset after period</p>
                </div>
                <select className="h-9 px-3 rounded-md bg-surface border border-hairline-soft text-sm text-white focus:outline-none focus:border-white/20">
                  <option value="never">Never</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Previous Passwords</p>
                  <p className="text-xs text-white/30">Prevent reuse of last N passwords</p>
                </div>
                <select className="h-9 px-3 rounded-md bg-surface border border-hairline-soft text-sm text-white focus:outline-none focus:border-white/20">
                  <option value="3">Last 3</option>
                  <option value="5">Last 5</option>
                  <option value="10">Last 10</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">IP Restrictions</CardTitle>
              <CardDescription className="text-xs text-white/45">
                Limit access to specific IP addresses or ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Enable IP Whitelist</p>
                  <p className="text-xs text-white/30">Only allow access from specified IPs</p>
                </div>
                <Switch checked={ipRestriction} onCheckedChange={setIpRestriction} />
              </div>
              {ipRestriction && (
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Allowed IP Addresses</Label>
                  <textarea
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    placeholder="Enter IP addresses or CIDR ranges, one per line...&#10;192.168.1.0/24&#10;10.0.0.5"
                    className="w-full h-32 px-3 py-2 rounded-md bg-surface border border-hairline-soft text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none font-mono"
                  />
                  <p className="text-xs text-white/30">Supports IPv4, IPv6, and CIDR notation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-violet hover:bg-violet/90 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
