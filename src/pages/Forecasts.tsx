import { useState, useEffect } from "react";
import {
  BrainCircuit, TrendingUp, TrendingDown, Plus, Loader2,
  Calendar, DollarSign, Target, AlertTriangle, Save, Trash2,
  ChevronRight, BarChart3, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";
import { useOrganization } from "@/hooks/useOrganization";
import { useRealtimeTable } from "@/hooks/useRealtime";

interface Forecast {
  id: string;
  name: string;
  period: string;
  projected_revenue: number;
  weighted_revenue: number;
  confidence_low: number;
  confidence_high: number;
  factors: any[];
  created_at: string;
}

export default function Forecasts() {
  const { organizationId } = useOrganization();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeForecast, setActiveForecast] = useState<string | null>(null);

  const [newForecast, setNewForecast] = useState({
    name: "",
    period: "Q1 2024",
    projected_revenue: "",
    weighted_revenue: "",
    confidence_low: "",
    confidence_high: "",
  });

  const [scenarioData, setScenarioData] = useState<any[]>([]);

  useEffect(() => { fetchForecasts(); }, []);
  useRealtimeTable("forecasts", fetchForecasts);

  async function fetchForecasts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forecasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setForecasts(data || []);
      if (data && data.length > 0 && !activeForecast) {
        setActiveForecast(data[0].id);
        generateScenarioData(data[0]);
      }
    } catch (error: any) {
      toast.error("Failed to load forecasts: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function generateScenarioData(forecast: Forecast) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const projected = forecast.projected_revenue || 0;
    const weighted = forecast.weighted_revenue || 0;
    const low = forecast.confidence_low || 0;
    const high = forecast.confidence_high || 0;

    const data = months.map((month, i) => {
      const seasonalFactor = 1 + 0.15 * Math.sin((i / 12) * 2 * Math.PI);
      return {
        month,
        projected: Math.round((projected / 12) * seasonalFactor),
        weighted: Math.round((weighted / 12) * seasonalFactor),
        optimistic: Math.round((high / 12) * seasonalFactor * 1.1),
        pessimistic: Math.round((low / 12) * seasonalFactor * 0.9),
      };
    });

    setScenarioData(data);
  }

  async function createForecast(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("forecasts").insert({
        name: newForecast.name,
        period: newForecast.period,
        projected_revenue: parseFloat(newForecast.projected_revenue) || 0,
        weighted_revenue: parseFloat(newForecast.weighted_revenue) || 0,
        confidence_low: parseFloat(newForecast.confidence_low) || 0,
        confidence_high: parseFloat(newForecast.confidence_high) || 0,
        factors: [],
      });
      if (error) throw error;
      toast.success("Forecast created");
      setDialogOpen(false);
      setNewForecast({ name: "", period: "Q1 2024", projected_revenue: "", weighted_revenue: "", confidence_low: "", confidence_high: "" });
      fetchForecasts();
    } catch (error: any) {
      toast.error("Failed to create forecast: " + error.message);
    }
  }

  async function deleteForecast(id: string) {
    try {
      const { error } = await supabase.from("forecasts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Forecast deleted");
      fetchForecasts();
    } catch (error: any) {
      toast.error("Failed to delete forecast: " + error.message);
    }
  }

  async function generateAIForecast() {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      const { data: deals } = await supabase
        .from("deals")
        .select("value, probability, stage, status, expected_close_date")
        .eq("status", "open");

      const totalValue = deals?.reduce((s, d) => s + (d.value || 0), 0) || 0;
      const weighted = deals?.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0) || 0;
      const variance = deals?.reduce((s, d) => {
        const prob = (d.probability || 0) / 100;
        return s + Math.pow((d.value || 0) * prob - (weighted / Math.max(deals.length, 1)), 2);
      }, 0) || 0;
      const stdDev = Math.sqrt(variance / Math.max(deals?.length || 1, 1));

      const { error } = await supabase.from("forecasts").insert({
        name: `AI Forecast ${new Date().toLocaleDateString()}`,
        period: new Date().toLocaleString("default", { month: "short", year: "numeric" }),
        projected_revenue: totalValue,
        weighted_revenue: weighted,
        confidence_low: Math.max(0, weighted - stdDev * 1.5),
        confidence_high: weighted + stdDev * 1.5,
        organization_id: organizationId,
        factors: [
          { name: "Pipeline Value", value: totalValue },
          { name: "Win Probability", value: deals?.length ? Math.round(deals.reduce((s, d) => s + (d.probability || 0), 0) / deals.length) : 0 },
          { name: "Active Deals", value: deals?.length || 0 },
        ],
      });

      if (error) throw error;
      toast.success("AI forecast generated from live pipeline data");
      fetchForecasts();
    } catch (error: any) {
      toast.error("Failed to generate forecast: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const currentForecast = forecasts.find(f => f.id === activeForecast);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Forecasts</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue forecasting and scenario planning</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={generateAIForecast}>
            <Sparkles className="w-4 h-4 mr-2" />Generate AI Forecast
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />New Forecast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Forecast</DialogTitle></DialogHeader>
              <form onSubmit={createForecast} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Forecast Name</Label>
                  <Input required value={newForecast.name} onChange={(e) => setNewForecast(p => ({ ...p, name: e.target.value }))} placeholder="Q1 2024 Revenue Forecast" />
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={newForecast.period} onValueChange={(v) => setNewForecast(p => ({ ...p, period: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                      <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                      <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                      <SelectItem value="FY 2024">FY 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projected Revenue ($)</Label>
                    <Input type="number" value={newForecast.projected_revenue} onChange={(e) => setNewForecast(p => ({ ...p, projected_revenue: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Weighted Revenue ($)</Label>
                    <Input type="number" value={newForecast.weighted_revenue} onChange={(e) => setNewForecast(p => ({ ...p, weighted_revenue: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Confidence Low ($)</Label>
                    <Input type="number" value={newForecast.confidence_low} onChange={(e) => setNewForecast(p => ({ ...p, confidence_low: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confidence High ($)</Label>
                    <Input type="number" value={newForecast.confidence_high} onChange={(e) => setNewForecast(p => ({ ...p, confidence_high: e.target.value }))} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Forecast</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {forecasts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BrainCircuit className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No forecasts yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Generate an AI forecast or create one manually</p>
            <Button onClick={generateAIForecast} className="mt-4">
              <Sparkles className="w-4 h-4 mr-2" />Generate AI Forecast
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Forecast List */}
          <div className="space-y-3">
            {forecasts.map((forecast) => (
              <Card
                key={forecast.id}
                className={`cursor-pointer transition-colors ${activeForecast === forecast.id ? "border-primary/50" : "hover:border-border/80"}`}
                onClick={() => { setActiveForecast(forecast.id); generateScenarioData(forecast); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">{forecast.name}</h3>
                        {forecast.name.includes("AI") && <Badge className="bg-primary/15 text-primary text-xs border-0">AI</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{forecast.period}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteForecast(forecast.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase">Projected</p>
                      <p className="text-sm font-semibold text-foreground">${(forecast.projected_revenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase">Weighted</p>
                      <p className="text-sm font-semibold text-primary">${(forecast.weighted_revenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Forecast Detail */}
          <div className="lg:col-span-2 space-y-4">
            {currentForecast && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        {currentForecast.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs text-muted-foreground">{currentForecast.period}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-muted border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Projected</p>
                        <p className="text-lg font-semibold text-foreground">${(currentForecast.projected_revenue || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Weighted</p>
                        <p className="text-lg font-semibold text-primary">${(currentForecast.weighted_revenue || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Confidence Low</p>
                        <p className="text-lg font-semibold text-red-500">${(currentForecast.confidence_low || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Confidence High</p>
                        <p className="text-lg font-semibold text-emerald-500">${(currentForecast.confidence_high || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={scenarioData}>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} formatter={(value: number) => [`$${value.toLocaleString()}`]} />
                        <Area type="monotone" dataKey="projected" stroke="#6452db" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" name="Projected" />
                        <Area type="monotone" dataKey="weighted" stroke="#8dc572" strokeWidth={2} fillOpacity={1} fill="url(#colorWeighted)" name="Weighted" />
                        <Area type="monotone" dataKey="optimistic" stroke="transparent" fill="rgba(141,197,114,0.05)" name="Optimistic" />
                        <Area type="monotone" dataKey="pessimistic" stroke="transparent" fill="rgba(190,100,100,0.05)" name="Pessimistic" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Factors */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      Key Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(currentForecast.factors || []).map((factor: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-foreground">{factor.name}</p>
                              <p className="text-xs text-muted-foreground">Influencing forecast accuracy</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{typeof factor.value === "number" ? factor.value.toLocaleString() : factor.value}</span>
                        </div>
                      ))}
                      {(!currentForecast.factors || currentForecast.factors.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No factors recorded for this forecast</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}