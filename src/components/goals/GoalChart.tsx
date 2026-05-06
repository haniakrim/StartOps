import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface GoalChartProps {
  data: {
    period: string;
    goals: number;
    completed: number;
    avgProgress: number;
  }[];
}

export function GoalChart({ data }: GoalChartProps) {
  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#6452db]" />
          OKR Performance by Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2126",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="goals" fill="#6452db" radius={[4, 4, 0, 0]} name="Total Goals" />
            <Bar dataKey="completed" fill="#8dc572" radius={[4, 4, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}