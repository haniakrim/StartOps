import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Calendar, Users } from "lucide-react";

export interface KeyResult {
  id: string;
  goal_id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  status: string;
  progress: number;
}

export interface Goal {
  id: string;
  name: string;
  description: string | null;
  period: string;
  status: string;
  progress: number;
  owner_id: string | null;
  created_at: string;
  key_results: KeyResult[];
}

const statusColors: Record<string, string> = {
  on_track: "bg-[#8dc572]/20 text-[#8dc572]",
  at_risk: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  behind: "bg-[#be6464]/20 text-[#be6464]",
  completed: "bg-[#6452db]/20 text-[#6452db]",
};

const statusLabels: Record<string, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  behind: "Behind",
  completed: "Completed",
};

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goalId: string, krId: string, newCurrent: number) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onUpdateProgress, onDelete }: GoalCardProps) {
  return (
    <Card className="bg-[#18191b] border-white/10 hover:border-white/20 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-white">{goal.name}</h3>
              <Badge
                variant="secondary"
                className={`text-xs ${statusColors[goal.status] || statusColors.on_track}`}
              >
                {statusLabels[goal.status] || goal.status}
              </Badge>
            </div>
            {goal.description && (
              <p className="text-sm text-white/50">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {goal.period}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {goal.key_results.length} key results
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-white">{goal.progress || 0}%</p>
              <p className="text-xs text-white/30">complete</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/30 hover:text-[#be6464]"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={goal.progress || 0} className="h-2 bg-white/10" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            Key Results
          </p>
          {goal.key_results.length === 0 && (
            <p className="text-sm text-white/30 py-2">No key results defined</p>
          )}
          {goal.key_results.map((kr) => {
            const krProgress =
              kr.target_value > 0
                ? Math.min(100, (kr.current_value / kr.target_value) * 100)
                : 0;
            return (
              <div
                key={kr.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0d10] border border-white/5"
              >
                <div className="flex-shrink-0">
                  {krProgress >= 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#8dc572]" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white">{kr.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">
                        {kr.unit === "$" ? "$" : ""}
                        {kr.current_value}
                        {kr.unit === "%" ? "%" : kr.unit === "#" ? "" : ` ${kr.unit}`}
                        {" / "}
                        {kr.unit === "$" ? "$" : ""}
                        {kr.target_value}
                        {kr.unit === "%" ? "%" : kr.unit === "#" ? "" : ` ${kr.unit}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={krProgress} className="h-1 bg-white/10" />
                    </div>
                    <span className="text-xs text-white/40 w-10 text-right">
                      {Math.round(krProgress)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    className="w-20 h-7 bg-[#18191b] border-white/10 text-white text-xs px-2"
                    value={kr.current_value}
                    onChange={(e) =>
                      onUpdateProgress(goal.id, kr.id, parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}