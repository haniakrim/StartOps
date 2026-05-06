import { Activity, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/hooks/useDashboardData";

const activityIcons: Record<string, React.ElementType> = {
  email: Mail, call: Phone, meeting: Calendar, task: Activity, note: Activity,
};

const activityColors: Record<string, string> = {
  email: "#6452db", call: "#8dc572", meeting: "#f0ad4e", task: "#5683da", note: "#ff8964",
};

function formatTimeAgo(date: string) {
  const now = new Date(); const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base font-medium">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent"><Activity className="w-4 h-4 mr-1" />View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No recent activity. Start engaging with your contacts!</p>}
          {items.map((activity) => {
            const Icon = activityIcons[activity.type] || Activity;
            const color = activityColors[activity.type] || "#5683da";
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{activity.contacts ? `${activity.contacts.first_name} ${activity.contacts.last_name}` : activity.deals?.name || "System"}</span>
                    <span className="text-xs text-muted-foreground/50">·</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}