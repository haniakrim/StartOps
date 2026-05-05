import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Revenue", value: "$124,500", change: "+12.5%", up: true, icon: DollarSign },
  { label: "Active Users", value: "2,845", change: "+8.2%", up: true, icon: Users },
  { label: "Conversion Rate", value: "3.24%", change: "-2.1%", up: false, icon: Activity },
  { label: "Avg Deal Size", value: "$8,420", change: "+5.7%", up: true, icon: BarChart3 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
        <p className="text-white/50 mt-1">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#18191b] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-white/40" />
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.up ? "text-[#8dc572]" : "text-[#eb5757]"
                  }`}
                >
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-semibold text-white mt-3">{stat.value}</p>
              <p className="text-sm text-white/40 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 flex items-end justify-between gap-2">
            {[35, 42, 28, 55, 48, 62, 45, 58, 52, 68, 75, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#6452db] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-white/40">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;