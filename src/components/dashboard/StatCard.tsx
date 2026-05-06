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
    <Card className="bg-card border-border hover:border-expo-blue/20 transition-all duration-300 hover:shadow-expo-md dark:hover:shadow-expo-dark-md group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-expo-lg transition-colors duration-300" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === "up" ? "bg-expo-green/10 text-expo-green" : "bg-expo-pink/10 text-expo-pink"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-h3 text-foreground">{value}</p>
          <p className="text-body-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
