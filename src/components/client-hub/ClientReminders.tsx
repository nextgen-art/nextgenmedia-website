import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Bell, ExternalLink, Loader2 } from "lucide-react";

interface ClientEvent {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  meeting_link: string | null;
}

const EVENT_BORDER_COLORS: Record<string, string> = {
  meeting: "border-l-[#2dabdf]",
  filming: "border-l-orange-400",
  invoice_due: "border-l-red-400",
  strategy_call: "border-l-purple-400",
  content_deadline: "border-l-pink-400",
  delivery: "border-l-green-400",
  other: "border-l-gray-400",
};

const EVENT_BG_COLORS: Record<string, string> = {
  meeting: "bg-[#2dabdf]/5",
  filming: "bg-orange-400/5",
  invoice_due: "bg-red-400/5",
  strategy_call: "bg-purple-400/5",
  content_deadline: "bg-pink-400/5",
  delivery: "bg-green-400/5",
  other: "bg-gray-400/5",
};

function getCountdown(eventDate: string): { label: string; color: string } {
  const today = new Date(new Date().toDateString());
  const event = new Date(eventDate + "T00:00:00");
  const diffMs = event.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "Today!", color: "text-red-400 font-bold" };
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d ago`, color: "text-muted-foreground" };
  if (diffDays <= 2) return { label: `In ${diffDays}d!`, color: "text-red-400 font-semibold" };
  if (diffDays <= 7) return { label: `In ${diffDays}d`, color: "text-yellow-400 font-medium" };
  return { label: `In ${diffDays}d`, color: "text-green-400" };
}

function formatEventType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

interface Props {
  clientId: string;
}

export default function ClientReminders({ clientId }: Props) {
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= todayStr);
  const past = events.filter((e) => e.event_date < todayStr).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No reminders yet</p>
        <p className="text-xs mt-1 opacity-70">Your team will add upcoming meetings and milestones here</p>
      </div>
    );
  }

  function EventCard({ event }: { event: ClientEvent }) {
    const countdown = getCountdown(event.event_date);
    const formattedDate = new Date(event.event_date + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "long", day: "numeric", year: "numeric",
    });

    return (
      <div
        className={cn(
          "border-l-4 pl-4 py-3 pr-4 rounded-r-lg border border-l-4",
          EVENT_BORDER_COLORS[event.event_type] ?? EVENT_BORDER_COLORS.other,
          EVENT_BG_COLORS[event.event_type] ?? EVENT_BG_COLORS.other
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{event.title}</p>
              <span className={cn("text-xs", countdown.color)}>{countdown.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{formatEventType(event.event_type)}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            {event.event_time && (
              <p className="text-xs text-muted-foreground">{event.event_time}</p>
            )}
            {event.location && (
              <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
            )}
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
          {event.meeting_link && (
            <a
              href={event.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Join <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Past
          </h3>
          <div className="space-y-3 opacity-60">
            {past.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}
