import { useState, useEffect } from "react";
import { TrendingUp, Loader2, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ForecastData {
  month: string;
  projected: number;
  weighted: number;
  confidence_low: number;
  confidence_high: number;
}

export function AIForecast() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projected: 0, weighted: 0, confidence: 0 });

  useEffect(() => {
    generateForecast();
  }, []);

  async function generateForecast() {
    try {
      setLoading(true);
      const { data: deals } = await supabase
        .from("deals")
        .select("value, probability, stage, status, expected_close_date, created_at")
        .eq("status", "open");

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const forecast: ForecastData[] = months.map(month => {
        const monthDeals = (deals || []).filter((d: any) => {
          const closeDate = d.expected_close_date ? new Date(d.expected_close_date) : new Date(d.created_at);
          return closeDate.toLocaleString("default", { month: "short" }) === month;
        });

        const projected = monthDeals.reduce((s, d) => s + (d.value || 0), 0);
        const weighted = monthDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);
        const variance = monthDeals.reduce((s, d) => s + Math.pow((d.value || 0) - (weighted / Math.max(monthDeals.length, 1)), 2), 0);
        const stdDev = Math.sqrt(variance / Math.max(monthDeals.length, 1));

        return {
          month,
          projected,
          weighted,
          confidence_low: Math.max(0, weighted - stdDev * 1.5),
          confidence_high: weighted + stdDev * 1.5,
        };
      });

      const totalProjected = forecast.reduce((s, f) => s + f.projected, 0);
      const totalWeighted = forecast.reduce((s, f) => s + f.weighted, 0);
      const avgConfidence = totalProjected > 0 ? (totalWeighted / totalProjected) * 100 : 0;

      setData(forecast);
      setStats({ projected: totalProjected, weighted: totalWeighted, confidence: avgConfidence });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base font-medium flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-primary" />
            AI Revenue Forecast
          </CardTitle>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            Probabilistic Model
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Projected</p>
            <p className="text-lg font-semibold text-foreground">${stats.projected.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Weighted</p>
            <p className="text-lg font-semibold text-primary">${Math.round(stats.weighted).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
            <p className="text-lg font-semibold text-emerald-500">{stats.confidence.toFixed(1)}%</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorWeighted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8dc572" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8dc572" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`]}
            />
            <Area type="monotone" dataKey="projected" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" name="Projected" />
            <Area type="monotone" dataKey="weighted" stroke="#8dc572" strokeWidth={2} fillOpacity={1} fill="url(#colorWeighted)" name="Weighted" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}