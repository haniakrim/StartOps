import { Clock, Briefcase, CheckCircle2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  description: string | null;
  hours: number;
  date: string;
  billable: boolean;
  projects: { name: string } | null;
  project_tasks: { name: string } | null;
}

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const recent = sessions.slice(0, 5);

  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6452db]" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-white/40 text-center py-6">No sessions yet. Start the timer above!</p>
          )}
          {recent.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[#0b0d10] border border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#6452db]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#6452db]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{session.description || "Untitled session"}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                    {session.projects && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {session.projects.name}
                      </span>
                    )}
                    {session.project_tasks && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {session.project_tasks.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    session.billable
                      ? "bg-[#8dc572]/20 text-[#8dc572]"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {session.billable ? (
                    <DollarSign className="w-3 h-3 mr-1" />
                  ) : null}
                  {session.billable ? "Billable" : "Non-bill"}
                </Badge>
                <span className="text-sm font-mono font-medium text-white">
                  {session.hours.toFixed(2)}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}