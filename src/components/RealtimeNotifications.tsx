import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";

const NOTIFICATIONS_KEY = "realtime_notifications";
const READ_KEY = "startops_read_notifications";

interface Notification {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

function getStoredNotifications(): Notification[] {
  try {
    const stored = sessionStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getReadIds(): Set<string> {
  try {
    const stored = sessionStorage.getItem(READ_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

const RealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(getStoredNotifications);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const [isOpen, setIsOpen] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          setNotifications((prev) => {
            const updated = [notification, ...prev].slice(0, 50);
            try {
              sessionStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
            } catch {
              // Ignore storage errors
            }
            return updated;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        sessionStorage.setItem(READ_KEY, JSON.stringify([...updated]));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const markAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      sessionStorage.setItem(READ_KEY, JSON.stringify([...allIds]));
    } catch {
      // Ignore
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No notifications
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-2 rounded text-sm cursor-pointer hover:bg-accent ${
                    readIds.has(notification.id) ? "opacity-60" : ""
                  }`}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {notification.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RealtimeNotifications;