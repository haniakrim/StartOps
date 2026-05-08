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
  AlertTriangle,
  CheckCircle2,
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
  const [emailVerified, setEmailVerified] = useState(false);
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
    if (user?.email_confirmed_at) {
      setEmailVerified(true);
    } else {
      setEmailVerified(false);
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{userName}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className="bg-primary/15 text-primary text-xs capitalize"
            >
              {profile?.role || "User"}
            </Badge>
            {emailVerified ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500/20 text-emerald-600 text-xs"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Email Verified
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-orange-500/20 text-orange-600 text-xs"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Email Unverified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Key className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={form.first_name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, first_name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={form.last_name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, last_name: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground/60">
                    Email cannot be changed. Contact support to update.
                  </p>
                  {!emailVerified && (
                    <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Your email is not verified. Some features may be restricted.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
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
          <Card>
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
                  className="flex items-start justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    defaultChecked={item.defaultChecked}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Coming soon: Two-factor authentication setup")}>
                  Enable
                </Button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <Key className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Change Password
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last changed 3 months ago
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/security"}>
                  Update
                </Button>
              </div>
              <div className="flex items-start justify-between py-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Active Sessions
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      3 devices currently logged in
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Session management coming soon")}>
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
