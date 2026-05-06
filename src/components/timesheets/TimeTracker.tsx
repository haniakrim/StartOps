import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, Clock, RotateCcw, Briefcase, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface ProjectTask {
  id: string;
  name: string;
  project_id: string;
}

interface TimeTrackerProps {
  projects: Project[];
  tasks: ProjectTask[];
  onEntryCreated: () => void;
}

type TimerState = "idle" | "running" | "paused";

export function TimeTracker({ projects, tasks, onEntryCreated }: TimeTrackerProps) {
  const [state, setState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef(0);

  const filteredTasks = tasks.filter((t) => t.project_id === projectId);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const start = useCallback(() => {
    if (state === "idle") {
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = 0;
    } else if (state === "paused") {
      startTimeRef.current = Date.now();
    }
    setState("running");
  }, [state]);

  const pause = useCallback(() => {
    if (state === "running") {
      pausedElapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      setState("paused");
    }
  }, [state]);

  const reset = useCallback(() => {
    setState("idle");
    setElapsed(0);
    pausedElapsedRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stopAndSave = useCallback(async () => {
    if (state === "running") {
      pausedElapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    const totalSeconds = pausedElapsedRef.current;
    const hours = Math.round((totalSeconds / 3600) * 100) / 100;

    if (hours < 0.01) {
      toast.error("Timer too short — must be at least 1 minute");
      return;
    }

    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("time_entries").insert({
        project_id: projectId || null,
        task_id: taskId || null,
        description: description || null,
        hours,
        date: new Date().toISOString().split("T")[0],
        billable,
        user_id: userData.user?.id,
      });

      if (error) throw error;

      toast.success(`Logged ${hours.toFixed(2)} hours`);
      reset();
      setDescription("");
      setProjectId("");
      setTaskId("");
      onEntryCreated();
    } catch (error: any) {
      toast.error("Failed to save time entry: " + error.message);
    } finally {
      setSaving(false);
    }
  }, [state, projectId, taskId, description, billable, reset, onEntryCreated]);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        const current = pausedElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(current);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (state === "paused") {
        setElapsed(pausedElapsedRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = ((elapsed % 3600) / 3600) * circumference;

  return (
    <Card className="bg-[#18191b] border-white/10">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#6452db" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference - progress} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock className={`w-5 h-5 mb-1 ${state === "running" ? "text-[#6452db]" : "text-white/30"}`} />
              <span className="text-2xl font-mono font-semibold text-white tracking-tight">{formatTime(elapsed)}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">{state === "running" ? "Tracking" : state === "paused" ? "Paused" : "Ready"}</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center gap-3">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you working on?" className="bg-[#0b0d10] border-white/10 text-white flex-1" />
              <button onClick={() => setBillable(!billable)} className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${billable ? "bg-[#8dc572]/20 text-[#8dc572] border border-[#8dc572]/30" : "bg-white/5 text-white/40 border border-white/10"}`}>
                {billable ? "Billable" : "Non-billable"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={projectId} onValueChange={(v) => { setProjectId(v); setTaskId(""); }}>
                <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><Briefcase className="w-4 h-4 mr-2 text-white/30" /><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                  {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>

              <Select value={taskId} onValueChange={setTaskId} disabled={!projectId || filteredTasks.length === 0}>
                <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white"><CheckCircle2 className="w-4 h-4 mr-2 text-white/30" /><SelectValue placeholder={filteredTasks.length === 0 ? "No tasks" : "Select task"} /></SelectTrigger>
                <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                  {filteredTasks.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              {state === "idle" && (
                <Button onClick={start} className="bg-[#6452db] text-white hover:bg-[#6452db]/90 flex-1"><Play className="w-4 h-4 mr-2" /> Start Timer</Button>
              )}
              {state === "running" && (
                <>
                  <Button onClick={pause} variant="outline" className="border-white/10 text-white hover:bg-white/5 flex-1"><Pause className="w-4 h-4 mr-2" /> Pause</Button>
                  <Button onClick={stopAndSave} disabled={saving} className="bg-[#8dc572] text-black hover:bg-[#8dc572]/90 flex-1"><Square className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Stop & Log"}</Button>
                </>
              )}
              {state === "paused" && (
                <>
                  <Button onClick={start} className="bg-[#6452db] text-white hover:bg-[#6452db]/90 flex-1"><Play className="w-4 h-4 mr-2" /> Resume</Button>
                  <Button onClick={stopAndSave} disabled={saving} className="bg-[#8dc572] text-black hover:bg-[#8dc572]/90 flex-1"><Square className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Stop & Log"}</Button>
                  <Button onClick={reset} variant="ghost" size="icon" className="text-white/30 hover:text-[#be6464]"><RotateCcw className="w-4 h-4" /></Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}