import { useState, useCallback } from "react";

export interface NextAction {
  id: string;
  title: string;
  type: "call" | "email" | "meeting" | "follow_up";
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

export function useNextActionSuggestions(_dealId?: string) {
  const [actions, setActions] = useState<NextAction[]>([]);

  const generateSuggestions = useCallback(() => {
    setActions([]);
  }, []);

  return { actions, generateSuggestions };
}

interface DealContext {
  stage: string;
  probability: number;
  daysInStage: number;
  daysSinceLastActivity: number;
  daysUntilClose: number | null;
  activityCount: number;
  score: number;
}

export function generateNextActions(ctx: DealContext): NextAction[] {
  const actions: NextAction[] = [];

  if (ctx.daysSinceLastActivity > 3) {
    actions.push({
      id: "follow-up",
      title: `Follow up — ${ctx.daysSinceLastActivity} days since last activity`,
      type: "follow_up",
      priority: ctx.daysSinceLastActivity > 7 ? "high" : "medium",
    });
  }

  if (ctx.stage === "lead" || ctx.stage === "qualified") {
    actions.push({
      id: "discovery-call",
      title: "Schedule discovery call",
      type: "call",
      priority: "high",
    });
  }

  if (ctx.stage === "proposal") {
    actions.push({
      id: "send-proposal",
      title: "Send proposal follow-up",
      type: "email",
      priority: "medium",
    });
  }

  if (ctx.daysUntilClose !== null && ctx.daysUntilClose < 7 && ctx.stage !== "closed-won" && ctx.stage !== "closed-lost") {
    actions.push({
      id: "closing-push",
      title: `Closing push — ${ctx.daysUntilClose} days remaining`,
      type: "meeting",
      priority: "high",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "check-in",
      title: "Routine check-in",
      type: "email",
      priority: "low",
    });
  }

  return actions;
}
