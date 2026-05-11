import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink } from "lucide-react";

interface ClientEvent {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  is_all_day: boolean;
  location: string | null;
  meeting_link: string | null;
  is_visible_to_client: boolean;
}

const EVENT_COLORS: Record<string, string> = {
  meeting: "bg-[#2dabdf]/20 text-[#2dabdf] border-[#2dabdf]/30",
  filming: "bg-orange-400/20 text-orange-400 border-orange-400/30",
  invoice_due: "bg-red-400/20 text-red-400 border-red-400/30",
  strategy_call: "bg-purple-400/20 text-purple-400 border-purple-400/30",
  content_deadline: "bg-pink-400/20 text-pink-400 border-pink-400/30",
  delivery: "bg-green-400/20 text-green-400 border-green-400/30",
  other: "bg-gray-400/20 text-gray-400 border-gray-400/30",
};

const EVENT_DOT_COLORS: Record<string, string> = {
  meeting: "bg-[#2dabdf]",
  filming: "bg-orange-400",
  invoice_due: "bg-red-400",
  strategy_call: "bg-purple-400",
  content_deadline: "bg-pink-400",
  delivery: "bg-green-400",
  other: "bg-gray-400",
};

interface Props {
  clientId: string;
  relaUrl: string | null;
}

export default function ClientCalendar({ clientId, relaUrl }: Props) {
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"calendar" | "rella">(relaUrl ? "calendar" : "calendar");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("client_events")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_visible_to_client", true)
          .order("event_date", { ascending: true });
        if (error) throw error;
        setEvents(data ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [clientId]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function getEventsForDay(day: number): ClientEvent[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.event_date === dateStr);
  }

  function formatEventType(type: string): string {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  const selectedDayEvents = selectedDay
    ? events.filter((e) => e.event_date === selectedDay)
    : [];

  const upcomingEvents = events.filter((e) => {
    const d = new Date(e.event_date + "T00:00:00");
    return d >= new Date(today.toDateString());
  }).slice(0, 5);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {relaUrl && (
        <div className="flex gap-2">
          <Button
            variant={activeView === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("calendar")}
            className="rounded-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button
            variant={activeView === "rella" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("rella")}
            className="rounded-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Content Calendar (RELLA)
          </Button>
        </div>
      )}

      {activeView === "rella" && relaUrl ? (
        <div className="rounded-lg overflow-hidden border" style={{ height: "600px" }}>
          <iframe src={relaUrl} className="w-full h-full" title="Content Calendar" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Calendar grid */}
          <div className="rounded-lg border overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/20">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="font-semibold text-sm">
                {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 border-b">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (!day) return <div key={idx} className="border-r border-b h-20 bg-muted/5" />;
                const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = getEventsForDay(day);
                const isToday = dayStr === todayStr;
                const isSelected = dayStr === selectedDay;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(isSelected ? null : dayStr)}
                    className={cn(
                      "border-r border-b h-20 p-1.5 text-left transition-colors hover:bg-muted/20",
                      isToday && "bg-primary/5",
                      isSelected && "bg-primary/10 ring-1 ring-inset ring-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium w-6 h-6 inline-flex items-center justify-center rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className={cn(
                            "text-[10px] px-1 py-0.5 rounded truncate border",
                            EVENT_COLORS[e.event_type] ?? EVENT_COLORS.other
                          )}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-muted-foreground pl-1">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Selected day events */}
            {selectedDay && (
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-semibold mb-3">
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </h4>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No events this day</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map((e) => (
                      <div key={e.id} className={cn("p-3 rounded-lg border text-xs", EVENT_COLORS[e.event_type] ?? EVENT_COLORS.other)}>
                        <p className="font-medium">{e.title}</p>
                        <p className="opacity-70 mt-0.5">{formatEventType(e.event_type)}</p>
                        {e.event_time && <p className="mt-0.5">{e.event_time}</p>}
                        {e.location && <p className="mt-0.5">{e.location}</p>}
                        {e.meeting_link && (
                          <a href={e.meeting_link} target="_blank" rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 underline"
                          >
                            Join <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming */}
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-3">Upcoming</h4>
              {loading ? (
                <p className="text-xs text-muted-foreground">Loading...</p>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((e) => {
                    const isEventToday = e.event_date === todayStr;
                    const daysUntil = Math.ceil(
                      (new Date(e.event_date + "T00:00:00").getTime() - new Date(todayStr + "T00:00:00").getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={e.id} className="flex items-start gap-2 text-xs">
                        <div className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0", EVENT_DOT_COLORS[e.event_type] ?? EVENT_DOT_COLORS.other)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{e.title}</p>
                          <p className="text-muted-foreground">
                            {new Date(e.event_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" · "}
                            <span className={isEventToday ? "text-red-400 font-semibold" : ""}>
                              {isEventToday ? "Today!" : `In ${daysUntil}d`}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
