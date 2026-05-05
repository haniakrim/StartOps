import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Palette,
  Shield,
  Bell,
  Globe,
  Database,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Acme Corp",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    language: "en",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    ssoEnabled: false,
    sessionTimeout: "30",
    passwordPolicy: "strong",
    ipWhitelist: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    dealUpdates: true,
    contactUpdates: false,
    dailyDigest: true,
    slackIntegration: false,
  });

  const [whiteLabelSettings, setWhiteLabelSettings] = useState({
    customLogo: false,
    primaryColor: "#6452db",
    secondaryColor: "#ff8964",
    customDomain: "",
    removeBranding: false,
  });

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Settings saved successfully" });
    }, 800);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
          <p className="text-white/60 mt-1">Configure your CRM instance</p>
        </div>
        <Button
          className="bg-[#6452db] hover:bg-[#5645c7] text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Settings className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-[#18191b] border border-[#303236]">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/60">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/60">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/60">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="whitelabel" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/60">
            <Palette className="w-4 h-4 mr-2" />
            White Label
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="bg-[#18191b] border-[#303236]">
            <CardHeader>
              <CardTitle className="text-white text-lg">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(v) => setGeneralSettings({ ...generalSettings, dateFormat: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(v) => setGeneralSettings({ ...generalSettings, language: v })}
                  >
                    <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18191b] border-[#303236]">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="bg-[#18191b] border-[#303236]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Require Two-Factor Authentication</p>
                  <p className="text-sm text-white/60">Enforce 2FA for all team members</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorRequired}
                  onCheckedChange={(v) => setSecuritySettings({ ...securitySettings, twoFactorRequired: v })}
                />
              </div>
              <div className="border-t border-[#303236] pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">SSO/SAML Authentication</p>
                    <p className="text-sm text-white/60">Enable single sign-on via SAML 2.0</p>
                  </div>
                  <Switch
                    checked={securitySettings.ssoEnabled}
                    onCheckedChange={(v) => setSecuritySettings({ ...securitySettings, ssoEnabled: v })}
                  />
                </div>
              </div>
              <div className="border-t border-[#303236] pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Select
                      value={securitySettings.sessionTimeout}
                      onValueChange={(v) => setSecuritySettings({ ...securitySettings, sessionTimeout: v })}
                    >
                      <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#18191b] border-[#303236]">
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Password Policy</Label>
                    <Select
                      value={securitySettings.passwordPolicy}
                      onValueChange={(v) => setSecuritySettings({ ...securitySettings, passwordPolicy: v })}
                    >
                      <SelectTrigger className="bg-[#0b0d10] border-[#303236] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#18191b] border-[#303236]">
                        <SelectItem value="basic">Basic (8+ chars)</SelectItem>
                        <SelectItem value="strong">Strong (12+ chars, mixed)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (16+ chars, all types)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#303236] pt-6">
                <div className="space-y-2">
                  <Label>IP Whitelist (comma-separated)</Label>
                  <Input
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                    placeholder="192.168.1.1, 10.0.0.0/8"
                  />
                  <p className="text-xs text-white/45">Leave empty to allow all IPs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18191b] border-[#303236]">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-[#6452db]" />
                Data & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Audit Logging</p>
                  <p className="text-sm text-white/60">Log all user actions for compliance</p>
                </div>
                <Badge variant="outline" className="border-[#8dc572]/40 text-[#8dc572]">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Data Retention</p>
                  <p className="text-sm text-white/60">Auto-delete logs after 7 years</p>
                </div>
                <Badge variant="outline" className="border-[#8dc572]/40 text-[#8dc572]">
                  Compliant
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">GDPR Data Export</p>
                  <p className="text-sm text-white/60">Allow users to export their data</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-[#18191b] border-[#303236]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  key: "emailNotifications",
                  label: "Email Notifications",
                  description: "Receive email alerts for important events",
                  value: notificationSettings.emailNotifications,
                },
                {
                  key: "dealUpdates",
                  label: "Deal Updates",
                  description: "Get notified when deals are updated",
                  value: notificationSettings.dealUpdates,
                },
                {
                  key: "contactUpdates",
                  label: "Contact Updates",
                  description: "Get notified when contacts are modified",
                  value: notificationSettings.contactUpdates,
                },
                {
                  key: "dailyDigest",
                  label: "Daily Digest",
                  description: "Receive a daily summary of activities",
                  value: notificationSettings.dailyDigest,
                },
                {
                  key: "slackIntegration",
                  label: "Slack Integration",
                  description: "Send notifications to Slack channels",
                  value: notificationSettings.slackIntegration,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={(v) =>
                      setNotificationSettings({ ...notificationSettings, [item.key]: v })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whitelabel" className="mt-6">
          <Card className="bg-[#18191b] border-[#303236]">
            <CardHeader>
              <CardTitle className="text-white text-lg">White Labeling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Custom Logo</p>
                  <p className="text-sm text-white/60">Upload your company logo</p>
                </div>
                <Switch
                  checked={whiteLabelSettings.customLogo}
                  onCheckedChange={(v) => setWhiteLabelSettings({ ...whiteLabelSettings, customLogo: v })}
                />
              </div>
              <div className="border-t border-[#303236] pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={whiteLabelSettings.primaryColor}
                      onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg bg-transparent border border-[#303236] cursor-pointer"
                    />
                    <Input
                      value={whiteLabelSettings.primaryColor}
                      onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, primaryColor: e.target.value })}
                      className="bg-[#0b0d10] border-[#303236] text-white flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={whiteLabelSettings.secondaryColor}
                      onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg bg-transparent border border-[#303236] cursor-pointer"
                    />
                    <Input
                      value={whiteLabelSettings.secondaryColor}
                      onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, secondaryColor: e.target.value })}
                      className="bg-[#0b0d10] border-[#303236] text-white flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-[#303236] pt-6">
                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input
                    value={whiteLabelSettings.customDomain}
                    onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, customDomain: e.target.value })}
                    className="bg-[#0b0d10] border-[#303236] text-white"
                    placeholder="crm.yourcompany.com"
                  />
                  <p className="text-xs text-white/45">Requires DNS configuration</p>
                </div>
              </div>
              <div className="border-t border-[#303236] pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Remove Branding</p>
                    <p className="text-sm text-white/60">Hide all CRM vendor branding</p>
                  </div>
                  <Switch
                    checked={whiteLabelSettings.removeBranding}
                    onCheckedChange={(v) => setWhiteLabelSettings({ ...whiteLabelSettings, removeBranding: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
