import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  DollarSign, FileText, CheckCircle2, AlertCircle, Loader2,
  Plus, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "activity" | "deal" | "invoice" | "project" | "task";
  status: string;
  description?: string;
  color: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const [newEvent, setNewEvent] = useState({
    title: "", type: "activity", date: "", time: "", description: "",
  });

  useEffect(() => { fetchEvents(); }, [currentDate]);

  async function fetchEvents() {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [actsRes, dealsRes, invoicesRes, projectsRes, tasksRes] = await Promise.all([
        supabase.from("activities").select("id, subject, due_date, status, type, description").gte("due_date", startOfMonth.toISOString()).lte("due_date", endOfMonth.toISOString()),
        supabase.from("deals").select("id, name, expected_close_date, stage, status").gte("expected_close_date", startOfMonth.toISOString()).lte("expected_close_date", endOfMonth.toISOString()),
        supabase.from("invoices").select("id, invoice_number, due_date, status, amount").gte("due_date", startOfMonth.toISOString()).lte("due_date", endOfMonth.toISOString()),
        supabase.from("projects").select("id, name, end_date, status").gte("end_date", startOfMonth.toISOString()).lte("end_date", endOfMonth.toISOString()),
        supabase.from("project_tasks").select("id, name, due_date, status").gte("due_date", startOfMonth.toISOString()).lte("due_date", endOfMonth.toISOString()),
      ]);

      const allEvents: CalendarEvent[] = [
        ...(actsRes.data || []).filter((a: any) => a.due_date).map((a: any) => ({
          id: a.id, title: a.subject, date: new Date(a.due_date),
          type: "activity" as const, status: a.status, description: a.description,
          color: a.status === "completed" ? "#8dc572" : a.status === "overdue" ? "#be6464" : "#6452db",
        })),
        ...(dealsRes.data || []).filter((d: any) => d.expected_close_date).map((d: any) => ({
          id: d.id, title: d.name, date: new Date(d.expected_close_date),
          type: "deal" as const, status: d.stage, description: `Deal close date`,
          color: d.stage === "closed-won" ? "#8dc572" : d.stage === "closed-lost" ? "#be6464" : "#ff8964",
        })),
        ...(invoicesRes.data || []).filter((i: any) => i.due_date).map((i: any) => ({
          id: i.id, title: `Invoice ${i.invoice_number}`, date: new Date(i.due_date),
          type: "invoice" as const, status: i.status, description: `$${(i.amount || 0).toLocaleString()}`,
          color: i.status === "paid" ? "#8dc572" : i.status === "overdue" ? "#be6464" : "#f0ad4e",
        })),
        ...(projectsRes.data || []).filter((p: any) => p.end_date).map((p: any) => ({
          id: p.id, title: p.name, date: new Date(p.end_date),
          type: "project" as const, status: p.status, description: "Project deadline",
          color: p.status === "completed" ? "#8dc572" : p.status === "at_risk" ? "#be6464" : "#5683da",
        })),
        ...(tasksRes.data || []).filter((t: any) => t.due_date).map((t: any) => ({
          id: t.id, title: t.name, date: new Date(t.due_date),
          type: "task" as const, status: t.status, description: "Project task",
          color: t.status === "completed" ? "#8dc572" : t.status === "in_progress" ? "#f0ad4e" : "#6452db",
        })),
      ];

      setEvents(allEvents);
    } catch (error: any) {
      toast.error("Failed to load calendar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const dateTime = newEvent.date && newEvent.time
        ? new Date(`${newEvent.date}T${newEvent.time}`).toISOString()
        : new Date().toISOString();

      const { error } = await supabase.from("activities").insert({
        subject: newEvent.title,
        type: newEvent.type,
        description: newEvent.description || null,
        due_date: dateTime,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Event created");
      setDialogOpen(false);
      setNewEvent({ title: "", type: "activity", date: "", time: "", description: "" });
      fetchEvents();
    } catch (error: any) {
      toast.error("Failed to create event: " + error.message);
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const filteredEvents = filter === "all" ? events : events.filter(e => e.type === filter);

  const getEventsForDate = (day: number) => {
    const date = new Date(year, month, day);
    return filteredEvents.filter(e =>
      e.date.getDate() === date.getDate() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getFullYear() === date.getFullYear()
    );
  };

  const typeIcons: Record<string, React.ElementType> = {
    activity: CheckCircle2, deal: DollarSign, invoice: FileText, project: CalendarIcon, task: Clock,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-expo-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Unified view of deadlines, activities, and milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-card border-border text-foreground w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="activity">Activities</SelectItem>
              <SelectItem value="deal">Deals</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-card-foreground">
              <DialogHeader><DialogTitle>Add Event</DialogTitle></DialogHeader>
              <form onSubmit={createEvent} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Title</Label><Input required value={newEvent.title} onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))} className="bg-muted border-border" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" required value={newEvent.date} onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))} className="bg-muted border-border" /></div>
                  <div className="space-y-2"><Label>Time</Label><Input type="time" value={newEvent.time} onChange={(e) => setNewEvent(p => ({ ...p, time: e.target.value }))} className="bg-muted border-border" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newEvent.type} onValueChange={(v) => setNewEvent(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Description</Label><Input value={newEvent.description} onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))} className="bg-muted border-border" /></div>
                <Button type="submit" className="w-full">Create Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">{monthNames[month]} {year}</h2>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {dayNames.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, day) => {
              const dayNum = day + 1;
              const dayEvents = getEventsForDate(dayNum);
              const isToday = today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDate?.getDate() === dayNum && selectedDate?.getMonth() === month;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                  className={`min-h-[100px] border-b border-r border-border/50 p-1.5 cursor-pointer transition-colors ${isSelected ? "bg-expo-blue/10" : "hover:bg-accent/50"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1 ${isToday ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}>
                    {dayNum}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const Icon = typeIcons[event.type] || CheckCircle2;
                      return (
                        <div key={event.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate" style={{ backgroundColor: `${event.color}20`, color: event.color }}>
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1.5">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected date events */}
      {selectedDate && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-base">
              Events for {selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getEventsForDate(selectedDate.getDate()).map((event) => {
                const Icon = typeIcons[event.type] || CheckCircle2;
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: event.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground capitalize">{event.type}</Badge>
                    {event.status === "overdue" && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                );
              })}
              {getEventsForDate(selectedDate.getDate()).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No events for this date</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
