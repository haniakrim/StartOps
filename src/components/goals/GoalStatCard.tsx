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
    <Card className="bg-[#18191b] border-white/10">
      <CardContent className="p-5">
        <Icon className="w-5 h-5 mb-3" style={{ color: iconColor }} />
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-sm text-white/50">{label}</p>
      </CardContent>
    </Card>
  );
}