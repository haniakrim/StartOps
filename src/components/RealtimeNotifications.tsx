import { useEffect, useState } from "react";
import { Bell, X, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealtimeNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Load saved notifications
    const saved = localStorage.getItem("realtime_notifications");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: RealtimeNotification) => !n.read).length);
    }

    // Subscribe to realtime changes
    const channels = [
      supabase.channel("deals-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "deals" }, (payload) => {
          addNotification({
            type: "success",
            title: "New Deal Created",
            message: `Deal "${(payload.new as any).name}" was created`,
          });
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "deals" }, (payload) => {
          const oldStage = (payload.old as any).stage;
          const newStage = (payload.new as any).stage;
          if (oldStage !== newStage) {
            addNotification({
              type: "info",
              title: "Deal Stage Changed",
              message: `"${(payload.new as any).name}" moved from ${oldStage} to ${newStage}`,
            });
          }
        })
        .subscribe(),

      supabase.channel("contacts-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "contacts" }, (payload) => {
          addNotification({
            type: "info",
            title: "New Contact Added",
            message: `${(payload.new as any).first_name} ${(payload.new as any).last_name} was added`,
          });
        })
        .subscribe(),

      supabase.channel("activities-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, (payload) => {
          addNotification({
            type: "warning",
            title: "New Activity",
            message: `New ${(payload.new as any).type}: ${(payload.new as any).subject}`,
          });
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, []);

  function addNotification(notification: Omit<RealtimeNotification, "id" | "created_at" | "read">) {
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
    info: "text-[#00BFFF]",
    success: "text-[#0066B1]",
    warning: "text-[#00BFFF]",
    error: "text-[#E63946]",
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative text-white/60 hover:text-white hover:bg-white/5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#E63946] text-white text-[10px] border-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-[#18191b] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-white/50 hover:text-white h-7">
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/40">No notifications</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const Icon = typeIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 border-b border-white/5 hover:bg-white/[0.02] ${!notification.read ? "bg-[#6452db]/5" : ""}`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 ${typeColors[notification.type]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{notification.title}</p>
                        <p className="text-xs text-white/40">{notification.message}</p>
                        <p className="text-xs text-white/30 mt-1">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#6452db] mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={clearAll} className="w-full text-xs text-white/40 hover:text-[#be6464]">
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
