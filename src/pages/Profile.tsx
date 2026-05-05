import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
  Shield,
  Bell,
  Key,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile, user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          avatar_url: form.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  const userName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex items-center gap-6 p-6 rounded-xl bg-[#18191b] border border-white/10">
        <div className="relative">
          <Avatar className="w-20 h-20 bg-[#6452db]">
            <AvatarFallback className="bg-[#6452db] text-white text-2xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0b0d10] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#6452db] transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{userName}</h2>
          <p className="text-sm text-white/50">{user?.email}</p>
          <Badge
            variant="secondary"
            className="mt-2 bg-[#6452db]/20 text-[#6452db] text-xs capitalize"
          >
            {profile?.role || "User"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Key className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="bg-[#18191b] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">First Name</Label>
                    <Input
                      value={form.first_name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, first_name: e.target.value }))
                      }
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Last Name</Label>
                    <Input
                      value={form.last_name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, last_name: e.target.value }))
                      }
                      className="bg-[#0b0d10] border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    disabled
                    className="bg-[#0b0d10] border-white/10 text-white/50"
                  />
                  <p className="text-xs text-white/30">
                    Email cannot be changed. Contact support to update.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="bg-[#0b0d10] border-white/10 text-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5 space-y-4">
              {[
                {
                  label: "Email Notifications",
                  desc: "Receive updates about deals and contacts via email",
                  defaultChecked: true,
                },
                {
                  label: "Deal Alerts",
                  desc: "Get notified when deals move stages or close",
                  defaultChecked: true,
                },
                {
                  label: "Task Reminders",
                  desc: "Daily digest of upcoming tasks and activities",
                  defaultChecked: false,
                },
                {
                  label: "Team Mentions",
                  desc: "Notifications when you're mentioned in notes",
                  defaultChecked: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    defaultChecked={item.defaultChecked}
                    className="data-[state=checked]:bg-[#6452db]"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <Card className="bg-[#18191b] border-white/10">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#5683da]/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-[#5683da]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  Enable
                </Button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ff8964]/20 flex items-center justify-center flex-shrink-0">
                    <Key className="w-4 h-4 text-[#ff8964]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Change Password
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Last changed 3 months ago
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  Update
                </Button>
              </div>
              <div className="flex items-start justify-between py-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#be6464]/20 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-[#be6464]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Active Sessions
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      3 devices currently logged in
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}