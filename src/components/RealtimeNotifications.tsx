import { useEffect, useState } from "react";
import { Bell, X, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/useOrganization";

interface RealtimeNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function RealtimeNotifications() {
  const { organizationId } = useOrganization();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("realtime_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (n: any) =>
              n &&
              typeof n === "object" &&
              typeof n.id === "string" &&
              typeof n.title === "string" &&
              typeof n.message === "string" &&
              n.title.length < 200 &&
              n.message.length < 1000
          );
          setNotifications(valid);
          setUnreadCount(valid.filter((n: RealtimeNotification) => !n.read).length);
        }
      } catch {
        localStorage.removeItem("realtime_notifications");
      }
    }

    const channels = [
      supabase.channel("deals-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "deals" }, (payload) => {
          const newRecord = payload.new as Record<string, any>;
          if (organizationId && newRecord.organization_id && newRecord.organization_id !== organizationId) return;
          addNotification({
            type: "success",
            title: "New Deal Created",
            message: `Deal "${newRecord.name}" was created`,
          });
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "deals" }, (payload) => {
          const newRecord = payload.new as Record<string, any>;
          const oldRecord = payload.old as Record<string, any>;
          if (organizationId && newRecord.organization_id && newRecord.organization_id !== organizationId) return;
          const oldStage = oldRecord.stage;
          const newStage = newRecord.stage;
          if (oldStage !== newStage) {
            addNotification({
              type: "info",
              title: "Deal Stage Changed",
              message: `"${newRecord.name}" moved from ${oldStage} to ${newStage}`,
            });
          }
        })
        .subscribe(),

      supabase.channel("contacts-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "contacts" }, (payload) => {
          const newRecord = payload.new as Record<string, any>;
          if (organizationId && newRecord.organization_id && newRecord.organization_id !== organizationId) return;
          addNotification({
            type: "info",
            title: "New Contact Added",
            message: `${newRecord.first_name} ${newRecord.last_name} was added`,
          });
        })
        .subscribe(),

      supabase.channel("activities-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, (payload) => {
          const newRecord = payload.new as Record<string, any>;
          if (organizationId && newRecord.organization_id && newRecord.organization_id !== organizationId) return;
          addNotification({
            type: "warning",
            title: "New Activity",
            message: `New ${newRecord.type}: ${newRecord.subject}`,
          });
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, [organizationId]);

  function addNotification(notification: Omit<RealtimeNotification, "id" | "created_at" | "read">) {
    if (!notification.title || !notification.message) return;
    if (notification.title.length > 200 || notification.message.length > 1000) return;
    const newNotification: RealtimeNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50);
      localStorage.setItem("realtime_notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);
    toast[notification.type](notification.title, { description: notification.message });
  }

  function markAllRead() {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("realtime_notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  }

  function clearAll() {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("realtime_notifications");
  }

  const typeIcons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertTriangle,
  };

  const typeColors = {
    info: "text-blue-500",
    success: "text-emerald-500",
    warning: "text-orange-500",
    error: "text-red-500",
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-[10px] text-white border-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground h-7">
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const Icon = typeIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 border-b border-border hover:bg-accent ${!notification.read ? "bg-primary/5" : ""}`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 ${typeColors[notification.type]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={clearAll} className="w-full text-xs text-muted-foreground hover:text-destructive">
                  Clear all notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}