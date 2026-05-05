import { useState } from "react";
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

const sessions = [
  {
    id: 1,
    device: "Chrome on macOS",
    location: "San Francisco, CA",
    ip: "192.168.1.105",
    current: true,
    lastActive: "Now",
  },
  {
    id: 2,
    device: "Safari on iPhone",
    location: "San Francisco, CA",
    ip: "192.168.1.110",
    current: false,
    lastActive: "2 hours ago",
  },
  {
    id: 3,
    device: "Firefox on Windows",
    location: "New York, NY",
    ip: "10.0.0.45",
    current: false,
    lastActive: "1 day ago",
  },
];

const ssoProviders = [
  {
    name: "Google Workspace",
    status: "connected",
    domain: "startops.com",
    lastSync: "2 hours ago",
  },
  {
    name: "Microsoft Azure AD",
    status: "connected",
    domain: "startops.com",
    lastSync: "1 day ago",
  },
  {
    name: "Okta",
    status: "disconnected",
    domain: "-",
    lastSync: "Never",
  },
  {
    name: "OneLogin",
    status: "disconnected",
    domain: "-",
    lastSync: "Never",
  },
];

export default function Security() {
  const [twoFA, setTwoFA] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Security & Authentication
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Manage authentication, access control, and compliance settings
        </p>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="auth"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Shield className="w-4 h-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger
            value="sso"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Globe className="w-4 h-4 mr-2" />
            SSO / SAML
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Clock className="w-4 h-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value="access"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Key className="w-4 h-4 mr-2" />
            Access Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="mt-6 space-y-4">
          {/* Two-Factor Authentication */}
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#5683da]/20 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-[#5683da]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-white/50 mt-1 max-w-lg">
                      Require a second verification step when signing in. We
                      support authenticator apps, SMS, and security keys.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge
                        variant="secondary"
                        className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Authenticator App
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        SMS Backup
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={twoFA}
                  onCheckedChange={setTwoFA}
                  className="data-[state=checked]:bg-[#6452db]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#ff8964]/20 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-[#ff8964]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white">
                    Password Policy
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    Enforce strong password requirements across your organization
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      { label: "Minimum 12 characters", active: true },
                      { label: "Upper & lowercase required", active: true },
                      { label: "Numbers required", active: true },
                      { label: "Special characters required", active: true },
                      { label: "Password expiry (90 days)", active: true },
                      { label: "Prevent password reuse", active: true },
                    ].map((rule) => (
                      <div
                        key={rule.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        {rule.active ? (
                          <Check className="w-4 h-4 text-[#8dc572]" />
                        ) : (
                          <X className="w-4 h-4 text-[#be6464]" />
                        )}
                        <span
                          className={
                            rule.active ? "text-white/70" : "text-white/30"
                          }
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biometric */}
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#6452db]/20 flex items-center justify-center flex-shrink-0">
                    <Fingerprint className="w-5 h-5 text-[#6452db]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">
                      Biometric Authentication
                    </h3>
                    <p className="text-sm text-white/50 mt-1">
                      Allow fingerprint and Face ID sign-in on supported devices
                    </p>
                  </div>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-[#6452db]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-medium text-white">
                    Single Sign-On (SSO)
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    Configure SAML 2.0 identity providers for your organization
                  </p>
                </div>
                <Switch
                  checked={ssoEnabled}
                  onCheckedChange={setSsoEnabled}
                  className="data-[state=checked]:bg-[#6452db]"
                />
              </div>

              <div className="space-y-3">
                {ssoProviders.map((provider) => (
                  <div
                    key={provider.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {provider.name}
                        </p>
                        <p className="text-xs text-white/40">
                          Domain: {provider.domain} · Last sync:{" "}
                          {provider.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          provider.status === "connected"
                            ? "bg-[#8dc572]/20 text-[#8dc572]"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {provider.status === "connected" ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        {provider.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/50 hover:text-white hover:bg-white/5"
                      >
                        {provider.status === "connected"
                          ? "Configure"
                          : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <h3 className="text-base font-medium text-white mb-4">
                SAML Configuration
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">
                      Entity ID (Issuer)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value="https://startops.com/saml/metadata"
                        readOnly
                        className="bg-[#0b0d10] border-white/10 text-white text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:text-white flex-shrink-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">
                      ACS URL (Consumer URL)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value="https://startops.com/saml/acs"
                        readOnly
                        className="bg-[#0b0d10] border-white/10 text-white text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:text-white flex-shrink-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">
                    SAML Certificate
                  </Label>
                  <div className="p-3 rounded-md bg-[#0b0d10] border border-white/5 font-mono text-xs text-white/50">
                    MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiUMA0GCSqGSIb3Qa3BajELMAkGA1UEBhM...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-base font-medium text-white">
                    Session Management
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    Control session duration and automatic logout behavior
                  </p>
                </div>
                <Switch
                  checked={sessionTimeout}
                  onCheckedChange={setSessionTimeout}
                  className="data-[state=checked]:bg-[#6452db]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Session Timeout</p>
                  <p className="text-lg font-semibold text-white">30 min</p>
                </div>
                <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Max Sessions</p>
                  <p className="text-lg font-semibold text-white">5</p>
                </div>
                <div className="p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Concurrent</p>
                  <p className="text-lg font-semibold text-white">3</p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-white mb-3">
                Active Sessions
              </h4>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0b0d10] border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {session.device.includes("iPhone") ? (
                          <SmartphoneIcon className="w-4 h-4 text-white/40" />
                        ) : (
                          <Monitor className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {session.device}
                          </p>
                          {session.current && (
                            <Badge
                              variant="secondary"
                              className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/40">
                          {session.location} · {session.ip} ·{" "}
                          {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#be6464] hover:text-[#be6464] hover:bg-[#be6464]/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
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
                  <div className="w-10 h-10 rounded-lg bg-[#f0ad4e]/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#f0ad4e]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">
                      IP Restrictions
                    </h3>
                    <p className="text-sm text-white/50 mt-1">
                      Limit access to specific IP addresses or ranges
                    </p>
                  </div>
                </div>
                <Switch
                  checked={ipRestriction}
                  onCheckedChange={setIpRestriction}
                  className="data-[state=checked]:bg-[#6452db]"
                />
              </div>

              {ipRestriction && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <Badge
                      variant="secondary"
                      className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                    >
                      Allow
                    </Badge>
                    <span className="text-sm text-white/70 font-mono">
                      192.168.1.0/24
                    </span>
                    <span className="text-xs text-white/40">Office Network</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto text-white/30 hover:text-[#be6464]"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0b0d10] border border-white/5">
                    <Badge
                      variant="secondary"
                      className="bg-[#8dc572]/20 text-[#8dc572] text-xs"
                    >
                      Allow
                    </Badge>
                    <span className="text-sm text-white/70 font-mono">
                      10.0.0.0/16
                    </span>
                    <span className="text-xs text-white/40">VPN Range</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto text-white/30 hover:text-[#be6464]"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add IP Range
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5">
              <h3 className="text-base font-medium text-white mb-4">
                API Access Keys
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#0b0d10] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Production API Key
                    </p>
                    <p className="text-xs text-white/40">
                      Created Jan 15, 2024 · Last used 2 hours ago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0b0d10] border border-white/5">
                      <span className="text-xs text-white/50 font-mono">
                        {showPassword
                          ? "sk_live_51H8x...9zK2m"
                          : "sk_live_••••••••••••"}
                      </span>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/30 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/50 hover:text-[#be6464] hover:bg-[#be6464]/10"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
