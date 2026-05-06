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
    <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg transition-colors duration-300" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
