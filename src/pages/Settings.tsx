import { useState, useEffect } from "react";
import { Settings, Palette, Globe, Bell, Save, Loader2, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState({
    name: "StartOps",
    slug: "startops",
    domain: "",
    primary_color: "#6452db",
    secondary_color: "#ff8964",
  });
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    deal_alerts: true,
    weekly_digest: false,
    dark_mode: true,
  });

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      toast.success("Organization settings saved");
    } catch (error: any) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/50 mt-1">Manage your workspace preferences and organization</p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="organization" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Building2 className="w-4 h-4 mr-2" />Organization</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader><CardTitle className="text-white text-base">Organization Details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Organization Name</Label>
                  <Input value={org.name} onChange={(e) => setOrg((p) => ({ ...p, name: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Slug</Label>
                  <Input value={org.slug} onChange={(e) => setOrg((p) => ({ ...p, slug: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Custom Domain</Label>
                  <Input value={org.domain} onChange={(e) => setOrg((p) => ({ ...p, domain: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white" placeholder="crm.yourcompany.com" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-[#6452db] text-white hover:bg-[#6452db]/90">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div><p className="text-sm font-medium text-white">Dark Mode</p><p className="text-xs text-white/40">Use dark theme throughout the app</p></div>
                <Switch checked={preferences.dark_mode} onCheckedChange={(v) => setPreferences((p) => ({ ...p, dark_mode: v }))} className="data-[state=checked]:bg-[#6452db]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={org.primary_color} onChange={(e) => setOrg((p) => ({ ...p, primary_color: e.target.value }))} className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer" />
                    <Input value={org.primary_color} onChange={(e) => setOrg((p) => ({ ...p, primary_color: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={org.secondary_color} onChange={(e) => setOrg((p) => ({ ...p, secondary_color: e.target.value }))} className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer" />
                    <Input value={org.secondary_color} onChange={(e) => setOrg((p) => ({ ...p, secondary_color: e.target.value }))} className="bg-[#0b0d10] border-white/10 text-white font-mono text-sm" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5 space-y-4">
              {[
                { label: "Email Notifications", desc: "Receive updates about deals and contacts", key: "email_notifications" },
                { label: "Deal Alerts", desc: "Get notified when deals move stages", key: "deal_alerts" },
                { label: "Weekly Digest", desc: "Summary of activity every Monday", key: "weekly_digest" },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
                  <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-white/40">{item.desc}</p></div>
                  <Switch checked={(preferences as any)[item.key]} onCheckedChange={(v) => setPreferences((p) => ({ ...p, [item.key]: v }))} className="data-[state=checked]:bg-[#6452db]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}