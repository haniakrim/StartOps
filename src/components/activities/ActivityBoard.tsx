import { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, Calendar, Phone, Mail, MessageSquare, Activity, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: string;
  priority: string;
  created_at: string;
  contacts: { first_name: string; last_name: string } | null;
  deals: { name: string } | null;
}

interface ActivityBoardProps {
  activities: ActivityItem[];
  onUpdate: () => void;
}

const columns = [
  { id: "pending", label: "To Do", color: "hsl(var(--primary))", icon: Clock },
  { id: "in_progress", label: "In Progress", color: "hsl(var(--chart-2))", icon: AlertCircle },
  { id: "completed", label: "Done", color: "hsl(var(--chart-4))", icon: CheckCircle2 },
];

const typeIcons: Record<string, React.ElementType> = {
  email: Mail, call: Phone, meeting: Calendar, task: Activity, note: MessageSquare,
};

const typeColors: Record<string, string> = {
  email: "#6452db", call: "#8dc572", meeting: "#f0ad4e", task: "#5683da", note: "#ff8964",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/15 text-red-600 dark:text-red-400",
  medium: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

export function ActivityBoard({ activities, onUpdate }: ActivityBoardProps) {
  const [draggedItem, setDraggedItem] = useState<ActivityItem | null>(null);

  async function updateStatus(id: string, newStatus: string) {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === "completed") {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from("activities")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success(`Moved to ${columns.find((c) => c.id === newStatus)?.label}`);
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  }

  async function deleteActivity(id: string) {
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
      toast.success("Activity deleted");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  }

  const handleDragStart = (item: ActivityItem) => setDraggedItem(item);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== status) {
      updateStatus(draggedItem.id, status);
      setDraggedItem(null);
    }
  };

  const getColumnItems = (status: string) => {
    if (status === "pending") return activities.filter((a) => a.status !== "completed" && a.status !== "in_progress");
    if (status === "in_progress") return activities.filter((a) => a.status === "in_progress");
    return activities.filter((a) => a.status === "completed");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const items = getColumnItems(col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className="bg-card rounded-lg border border-border p-3 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-sm font-medium text-foreground">{col.label}</span>
              </div>
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">{items.length}</Badge>
            </div>

            <div className="space-y-2">
              {items.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-md">Drop activities here</div>
              )}
              {items.map((activity) => {
                const TypeIcon = typeIcons[activity.type] || Activity;
                const color = typeColors[activity.type] || "#5683da";

                return (
                  <Card
                    key={activity.id}
                    draggable
                    onDragStart={() => handleDragStart(activity)}
                    className="bg-card border-border cursor-grab active:cursor-grabbing hover:border-primary/20 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                            <TypeIcon className="w-3.5 h-3.5" style={{ color }} />
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{activity.subject}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteActivity(activity.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{activity.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={`text-xs ${priorityColors[activity.priority] || priorityColors.medium}`}>
                          {activity.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{activity.type}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {activity.contacts && (
                          <span>{activity.contacts.first_name} {activity.contacts.last_name}</span>
                        )}
                        {activity.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}