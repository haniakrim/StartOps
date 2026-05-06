import { useState } from "react";
import { Calendar, Filter, GitBranch, DollarSign, Activity, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateRanges } from "@/lib/reports";
import type { DateRange } from "@/lib/reports";
import { PipelineReport } from "@/components/reports/PipelineReport";
import { RevenueReport } from "@/components/reports/RevenueReport";
import { ActivitiesReport } from "@/components/reports/ActivitiesReport";
import { CommunicationsReport } from "@/components/reports/CommunicationsReport";

export default function Reports() {
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [activeTab, setActiveTab] = useState("pipeline");

  const range: DateRange =
    dateRanges.find((r) => r.label === dateRange) || dateRanges[1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Structured, exportable business intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-[#18191b] border-white/10 text-white w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f2126] border-white/10 text-white">
              {dateRanges.map((r) => (
                <SelectItem key={r.label} value={r.label}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(activeTab)}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="bg-[#18191b] border border-white/10">
          <TabsTrigger
            value="pipeline"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger
            value="communications"
            className="data-[state=active]:bg-[#6452db] data-[state=active]:text-white text-white/50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <PipelineReport range={range} />
        </TabsContent>
        <TabsContent value="revenue" className="mt-6">
          <RevenueReport range={range} />
        </TabsContent>
        <TabsContent value="activities" className="mt-6">
          <ActivitiesReport range={range} />
        </TabsContent>
        <TabsContent value="communications" className="mt-6">
          <CommunicationsReport range={range} />
        </TabsContent>
      </Tabs>
    </div>
  );
}