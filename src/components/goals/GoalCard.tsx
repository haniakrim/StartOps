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
  on_track: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  at_risk: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  behind: "bg-red-500/15 text-red-600 dark:text-red-400",
  completed: "bg-primary/15 text-primary",
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
    <Card className="bg-card border-border hover:border-primary/20 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground">{goal.name}</h3>
              <Badge
                variant="secondary"
                className={`text-xs ${statusColors[goal.status] || statusColors.on_track}`}
              >
                {statusLabels[goal.status] || goal.status}
              </Badge>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
              <p className="text-lg font-semibold text-foreground">{goal.progress || 0}%</p>
              <p className="text-xs text-muted-foreground">complete</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={goal.progress || 0} className="h-2 bg-muted" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Key Results
          </p>
          {goal.key_results.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">No key results defined</p>
          )}
          {goal.key_results.map((kr) => {
            const krProgress =
              kr.target_value > 0
                ? Math.min(100, (kr.current_value / kr.target_value) * 100)
                : 0;
            return (
              <div
                key={kr.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border"
              >
                <div className="flex-shrink-0">
                  {krProgress >= 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-foreground">{kr.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
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
                      <Progress value={krProgress} className="h-1 bg-muted" />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {Math.round(krProgress)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    className="w-20 h-7 bg-card border-border text-foreground text-xs px-2"
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