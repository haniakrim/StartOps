import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Props {
  title: string;
  type: string;
  priority: string;
  dueDate?: string;
}

export function NextActionCard({ title, type, priority, dueDate }: Props) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-xs font-medium">{title}</p>
          <p className="text-[10px] text-muted-foreground">{type} · {priority}{dueDate ? ` · ${dueDate}` : ""}</p>
        </div>
      </CardContent>
    </Card>
  );
}
