import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  color: string;
}

export function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-[#8dc572]" : "text-[#be6464]"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-sm text-white/50 mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}