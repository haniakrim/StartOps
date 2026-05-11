import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NextAction {
  id: string;
  title: string;
  type: string;
  priority: string;
  dueDate?: string;
}

interface Props {
  actions: NextAction[];
  dealId: string;
  contactId?: string | null;
  onActionCreated?: () => void;
}

export function NextActionCard({ actions, onActionCreated }: Props) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <Card key={action.id} className="bg-card border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{action.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {action.type} · {action.priority}
                {action.dueDate ? ` · ${action.dueDate}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => {
                toast.success("Marked as done");
                onActionCreated?.();
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
