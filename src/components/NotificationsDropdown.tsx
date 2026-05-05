import { useState, useEffect } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  subject: string;
  created_at: string;
  read: boolean;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("id, type, subject, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setNotifications((data || []).map((d: any, i: number) => ({ ...d, read: i > 2 })));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function formatTimeAgo(date: string) {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-white/60 hover:text-white hover:bg-white/5"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-[#ff8964] text-[10px] text-black border-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#18191b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#ff8964] hover:text-[#ff8964]/80">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#6452db] animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/40">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setOpen(false);
                      navigate("/activities");
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${
                      !n.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-[#ff8964]" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "text-white font-medium" : "text-white/70"}`}>{n.subject}</p>
                      <p className="text-xs text-white/40 mt-0.5 capitalize">{n.type} · {formatTimeAgo(n.created_at)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-white/10 text-center">
              <button onClick={() => { setOpen(false); navigate("/activities"); }} className="text-xs text-white/50 hover:text-white transition-colors">
                View all activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}