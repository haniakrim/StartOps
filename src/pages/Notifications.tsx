import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  GitBranch,
  User,
  Activity,
  Mail,
  DollarSign,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  type: "deal" | "contact" | "activity" | "system" | "invoice";
  title: string;
  description: string;
  read: boolean;
  created_at: string;
  entity_id?: string;
  entity_type?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  deal: { icon: GitBranch, color: "#8dc572", bg: "bg-[#8dc572]/10" },
  contact: { icon: User, color: "#5683da", bg: "bg-[#5683da]/10" },
  activity: { icon: Activity, color: "#f0ad4e", bg: "bg-[#f0ad4e]/10" },
  system: { icon: AlertCircle, color: "#ff8964", bg: "bg-[#ff8964]/10" },
  invoice: { icon: DollarSign, color: "#6452db", bg: "bg-[#6452db]/10" },
};

function formatTimeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

function groupByDate(items: NotificationItem[]) {
  const groups: Record<string, NotificationItem[]> = {};
  items.forEach((item) => {
    const date = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) key = "Today";
    else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else key = date.toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" });

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);

      const [dealsRes, contactsRes, activitiesRes] = await Promise.all([
        supabase.from("deals").select("id, name, stage, value, created_at, updated_at").order("updated_at", { ascending: false }).limit(20),
        supabase.from("contacts").select("id, first_name, last_name, company, created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("activities").select("id, subject, type, status, created_at").order("created_at", { ascending: false }).limit(20),
      ]);

      const items: NotificationItem[] = [];

      (dealsRes.data || []).forEach((d: any) => {
        items.push({
          id: `deal-${d.id}`,
          type: "deal",
          title: d.name,
          description: `Deal moved to ${d.stage} — $${(d.value || 0).toLocaleString()}`,
          read: false,
          created_at: d.updated_at || d.created_at,
          entity_id: d.id,
          entity_type: "deal",
        });
      });

      (contactsRes.data || []).forEach((c: any) => {
        items.push({
          id: `contact-${c.id}`,
          type: "contact",
          title: `${c.first_name} ${c.last_name}`,
          description: c.company ? `New contact at ${c.company}` : "New contact added",
          read: false,
          created_at: c.created_at,
          entity_id: c.id,
          entity_type: "contact",
        });
      });

      (activitiesRes.data || []).forEach((a: any) => {
        items.push({
          id: `activity-${a.id}`,
          type: "activity",
          title: a.subject,
          description: `${a.type} marked as ${a.status}`,
          read: false,
          created_at: a.created_at,
          entity_id: a.id,
          entity_type: "activity",
        });
      });

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const savedRead = localStorage.getItem("startops_read_notifications");
      const readIds = savedRead ? JSON.parse(savedRead) : [];
      items.forEach((item) => { if (readIds.includes(item.id)) item.read = true; });

      setNotifications(items);
    } catch (error: any) {
      toast.error("Failed to load notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function markAsRead(id: string) {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveReadState(updated);
  }

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveReadState(updated);
    toast.success("All notifications marked as read");
  }

  function clearAll() {
    setNotifications([]);
    localStorage.setItem("startops_read_notifications", "[]");
    toast.success("Notifications cleared");
  }

  function saveReadState(items: NotificationItem[]) {
    const readIds = items.filter((n) => n.read).map((n) => n.id);
    localStorage.setItem("startops_read_notifications", JSON.stringify(readIds));
  }

  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6452db] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-white/50 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <CheckCheck className="w-4 h-4 mr-2" />Mark All Read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-white/50 hover:text-[#be6464] hover:bg-[#be6464]/10">
            <Trash2 className="w-4 h-4 mr-2" />Clear
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger value="all" onClick={() => setFilter("all")} className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <Bell className="w-4 h-4 mr-2" />All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter("unread")} className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <AlertCircle className="w-4 h-4 mr-2" />Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="deals" onClick={() => setFilter("deal")} className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <GitBranch className="w-4 h-4 mr-2" />Deals
          </TabsTrigger>
          <TabsTrigger value="contacts" onClick={() => setFilter("contact")} className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50">
            <User className="w-4 h-4 mr-2" />Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationList grouped={grouped} onMarkRead={markAsRead} />
        </TabsContent>
        <TabsContent value="unread" className="mt-6">
          <NotificationList grouped={grouped} onMarkRead={markAsRead} />
        </TabsContent>
        <TabsContent value="deals" className="mt-6">
          <NotificationList grouped={grouped} onMarkRead={markAsRead} />
        </TabsContent>
        <TabsContent value="contacts" className="mt-6">
          <NotificationList grouped={grouped} onMarkRead={markAsRead} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  grouped,
  onMarkRead,
}: {
  grouped: Record<string, NotificationItem[]>;
  onMarkRead: (id: string) => void;
}) {
  const dates = Object.keys(grouped);

  if (dates.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-sm text-white/40">No notifications to show</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <div key={date}>
          <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3 sticky top-0 bg-[#0b0d10] py-2">
            {date}
          </h3>
          <div className="space-y-2">
            {grouped[date].map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.system;
              const Icon = config.icon;

              return (
                <Card
                  key={notification.id}
                  className={`bg-[#18191b] border-white/10 hover:border-white/20 transition-colors ${
                    !notification.read ? "border-l-2 border-l-[#6452db]" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium ${!notification.read ? "text-white" : "text-white/60"}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge className="bg-[#6452db]/20 text-[#6452db] text-xs border-0">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/40">{notification.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-white/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          <span className="text-xs text-white/30 capitalize">{notification.type}</span>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkRead(notification.id)}
                          className="text-white/30 hover:text-[#8dc572] hover:bg-[#8dc572]/10 h-8"
                        >
                          <Check className="w-4 h-4 mr-1" />Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}