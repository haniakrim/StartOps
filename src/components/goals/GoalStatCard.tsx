import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface GoalStatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
}

export function GoalStatCard({
  icon: Icon,
  iconColor,
  value,
  label,
}: GoalStatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <Icon className="w-5 h-5 mb-3" style={{ color: iconColor }} />
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
