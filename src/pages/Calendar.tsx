import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Video,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: number;
  title: string;
  type: "meeting" | "call" | "task" | "reminder";
  date: number;
  startTime: string;
  endTime: string;
  contact?: string;
  company?: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

const events: CalendarEvent[] = [
  {
    id: 1,
    title: "Discovery Call - TechStart",
    type: "call",
    date: 10,
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    contact: "James Wilson",
    company: "TechStart Inc",
    description: "Initial qualification call",
  },
  {
    id: 2,
    title: "QBR - MegaCorp",
    type: "meeting",
    date: 10,
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    contact: "Robert Taylor",
    company: "MegaCorp Industries",
    location: "Conference Room A",
    attendees: ["John Doe", "Sarah Chen"],
  },
  {
    id: 3,
    title: "Follow-up Email - Acme",
    type: "task",
    date: 11,
    startTime: "9:00 AM",
    endTime: "9:30 AM",
    contact: "Sarah Chen",
    company: "Acme Corporation",
    description: "Send revised proposal",
  },
  {
    id: 4,
    title: "Demo - Global Systems",
    type: "meeting",
    date: 12,
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    contact: "Maria Garcia",
    company: "Global Systems",
    location: "Zoom",
    attendees: ["John Doe", "Mike Ross"],
  },
  {
    id: 5,
    title: "Contract Review",
    type: "task",
    date: 12,
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    description: "Review DataFlow contract terms",
  },
  {
    id: 6,
    title: "Team Standup",
    type: "meeting",
    date: 13,
    startTime: "9:30 AM",
    endTime: "10:00 AM",
    location: "Google Meet",
    attendees: ["Sales Team"],
  },
  {
    id: 7,
    title: "Call - Apex Solutions",
    type: "call",
    date: 14,
    startTime: "1:00 PM",
    endTime: "1:30 PM",
    contact: "David Kim",
    company: "Apex Solutions",
  },
  {
    id: 8,
    title: "Proposal Deadline",
    type: "reminder",
    date: 15,
    startTime: "5:00 PM",
    endTime: "5:00 PM",
    company: "Acme Corporation",
    description: "Submit final proposal",
  },
];

const typeIcons: Record<string, React.ElementType> = {
  meeting: Video,
  call: Phone,
  task: Mail,
  reminder: Clock,
};

const typeColors: Record<string, string> = {
  meeting: "#6452db",
  call: "#5683da",
  task: "#ff8964",
  reminder: "#f0ad4e",
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1));
  const [selectedDate, setSelectedDate] = useState<number | null>(10);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (date: number) =>
    events.filter((e) => e.date === date);

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Calendar
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Schedule and manage your events
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#6452db] text-white hover:bg-[#6452db]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18191b] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Event Title</Label>
                <Input
                  placeholder="Meeting title..."
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Type</Label>
                  <Select>
                    <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2126] border-white/10 text-white">
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Date</Label>
                  <Input
                    type="date"
                    className="bg-[#0b0d10] border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Start Time</Label>
                  <Input
                    type="time"
                    className="bg-[#0b0d10] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">End Time</Label>
                  <Input
                    type="time"
                    className="bg-[#0b0d10] border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Location</Label>
                <Input
                  placeholder="Conference room, Zoom link, etc."
                  className="bg-[#0b0d10] border-white/10 text-white"
                />
              </div>
              <Button className="w-full bg-[#6452db] text-white hover:bg-[#6452db]/90">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 bg-[#18191b] border-white/10">
          <CardContent className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {monthName} {year}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMonth}
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMonth}
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-white/40 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isSelected = day === selectedDate;
                const isToday = day === 10;

                return (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    className={`min-h-[80px] p-2 rounded-lg border transition-colors text-left ${
                      isSelected
                        ? "border-[#6452db] bg-[#6452db]/10"
                        : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                    } ${!day ? "invisible" : ""}`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm font-medium ${
                              isToday
                                ? "text-[#ff8964]"
                                : isSelected
                                ? "text-white"
                                : "text-white/70"
                            }`}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff8964]" />
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-[10px] truncate px-1.5 py-0.5 rounded text-white/80"
                              style={{
                                backgroundColor: `${typeColors[event.type]}20`,
                              }}
                            >
                              {event.startTime} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-white/40 px-1.5">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card className="bg-[#18191b] border-white/10">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              {selectedDate
                ? `${monthName} ${selectedDate}, ${year}`
                : "Select a date"}
            </h3>
            <div className="space-y-3">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => {
                  const Icon = typeIcons[event.type];
                  const color = typeColors[event.type];
                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-[#0b0d10] border border-white/5"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.contact && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                              <User className="w-3 h-3" />
                              {event.contact} · {event.company}
                            </div>
                          )}
                          {event.attendees && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="flex -space-x-1.5">
                                {event.attendees.map((attendee, i) => (
                                  <Avatar
                                    key={i}
                                    className="w-5 h-5 border border-[#0b0d10]"
                                  >
                                    <AvatarFallback className="bg-[#6452db] text-white text-[8px]">
                                      {attendee
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5 -mt-1 -mr-1"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/40">No events scheduled</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}