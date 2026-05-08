import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const NOTIF_KEY = "startops_notifications";

interface NotifSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dealUpdates: boolean;
  contactUpdates: boolean;
}

function getStoredNotifSettings(): NotifSettings {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          emailNotifications: true,
          pushNotifications: true,
          dealUpdates: true,
          contactUpdates: true,
        };
  } catch {
    return {
      emailNotifications: true,
      pushNotifications: true,
      dealUpdates: true,
      contactUpdates: true,
    };
  }
}

const Settings = () => {
  const { toast } = useToast();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(getStoredNotifSettings);
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: user?.email || "" });
  const [loading, setLoading] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (user?.id) {
      supabase.from("profiles").select("first_name, last_name, email").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || user?.email || "",
          });
        }
      });
    }
  }, [user]);

  const isDark = resolvedTheme === "dark";

  const updateNotif = <K extends keyof NotifSettings>(
    key: K,
    value: NotifSettings[K]
  ) => {
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSave = async () => {
    if (user?.id) {
      setLoading(true);
      const { error } = await supabase.from("profiles").update({
        first_name: profile.first_name,
        last_name: profile.last_name,
      }).eq("id", user.id);
      setLoading(false);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and profile</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <input
                id="first-name"
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <input
                id="last-name"
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={notifSettings.emailNotifications}
              onCheckedChange={(checked) =>
                updateNotif("emailNotifications", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={notifSettings.pushNotifications}
              onCheckedChange={(checked) =>
                updateNotif("pushNotifications", checked)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="deal-updates">Deal Updates</Label>
            <Switch
              id="deal-updates"
              checked={notifSettings.dealUpdates}
              onCheckedChange={(checked) =>
                updateNotif("dealUpdates", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="contact-updates">Contact Updates</Label>
            <Switch
              id="contact-updates"
              checked={notifSettings.contactUpdates}
              onCheckedChange={(checked) =>
                updateNotif("contactUpdates", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default Settings;
