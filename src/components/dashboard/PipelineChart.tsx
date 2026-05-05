import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const pipelineData = [
  { name: "Lead", value: 45 }, { name: "Qualified", value: 32 },
  { name: "Proposal", value: 28 }, { name: "Negotiation", value: 18 },
  { name: "Closed", value: 24 },
];

export function PipelineChart() {
  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-medium">Pipeline Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={pipelineData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} width={80} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
            <Bar dataKey="value" fill="#5683da" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}