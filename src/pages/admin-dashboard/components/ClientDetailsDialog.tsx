import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Loader2,
  Plus,
  CheckSquare,
  Trash2,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Client, ClientTask, ClientEvent } from "../types";
import { formatDate, formatDateForInput } from "../utils";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClient: Client | null;
  clientDetailsForm: Partial<Client>;
  onFieldChange: (field: keyof Client, value: any) => void;
  onDateChange: (field: keyof Client, date: Date | undefined) => void;
  onCopy: (text: string, label: string) => void;
  onQuickAction: (action: "email" | "call" | "viewHub") => void;
  getStatusColor: (status: string) => string;
  hasClientChanges: boolean;
  onSaveClientDetails: () => void;
  savingClientDetails: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  strategy: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  content: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  production: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  billing: "bg-green-500/20 text-green-300 border-green-500/30",
  admin: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  onboarding: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  general: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  other: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-300 border-green-500/30",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "border-l-[#2dabdf]",
  filming: "border-l-orange-400",
  invoice_due: "border-l-red-400",
  strategy_call: "border-l-purple-400",
  content_deadline: "border-l-pink-400",
  delivery: "border-l-green-400",
  other: "border-l-gray-400",
};

const EVENT_PILL_COLORS: Record<string, string> = {
  meeting: "bg-[#2dabdf]/20 text-[#2dabdf]",
  filming: "bg-orange-500/20 text-orange-300",
  invoice_due: "bg-red-500/20 text-red-300",
  strategy_call: "bg-purple-500/20 text-purple-300",
  content_deadline: "bg-pink-500/20 text-pink-300",
  delivery: "bg-green-500/20 text-green-300",
  other: "bg-gray-500/20 text-gray-300",
};

function fmtDate(ds: string | null) {
  if (!ds) return "—";
  const d = new Date(ds.includes("T") ? ds : ds + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(ts: string | null) {
  if (!ts) return "";
  const [h, m] = ts.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function countdownLabel(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d ago`, cls: "text-muted-foreground" };
  if (diff === 0) return { label: "Today!", cls: "text-red-400 font-bold" };
  if (diff <= 2) return { label: `In ${diff}d!`, cls: "text-red-400 font-semibold" };
  if (diff <= 7) return { label: `In ${diff}d`, cls: "text-yellow-400 font-semibold" };
  return { label: `In ${diff}d`, cls: "text-green-400" };
}

// ── Project Manager panel ─────────────────────────────────────────────────────
function ProjectManagerPanel({ clientId, userId }: { clientId: string; userId: string }) {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ClientTask["category"]>("general");
  const [newPriority, setNewPriority] = useState<ClientTask["priority"]>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTasks(); }, [clientId]);

  async function loadTasks() {
    setLoading(true);
    const { data } = await supabase
      .from("client_tasks")
      .select("*")
      .eq("client_id", clientId)
      .order("sort_order")
      .order("created_at");
    setTasks(data || []);
    setLoading(false);
  }

  async function toggleTask(id: string, checked: boolean) {
    await supabase.from("client_tasks").update({ is_completed: checked }).eq("id", id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: checked } : t)));
  }

  async function deleteTask(id: string) {
    await supabase.from("client_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  }

  async function addTask() {
    if (!newTitle.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from("client_tasks")
      .insert({
        client_id: clientId,
        title: newTitle.trim(),
        category: newCategory,
        priority: newPriority,
        due_date: newDueDate || null,
        description: newDesc.trim() || null,
        created_by: userId,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error("Failed to add task"); return; }
    setTasks((prev) => [...prev, data]);
    setNewTitle(""); setNewDesc(""); setNewDueDate("");
    setShowForm(false);
    toast.success("Task added");
  }

  const visibleTasks = tasks.filter((t) => {
    if (filterCat && t.category !== filterCat) return false;
    if (filterStatus === "active") return !t.is_completed;
    if (filterStatus === "done") return t.is_completed;
    return true;
  });

  const categories = [...new Set(visibleTasks.map((t) => t.category))];

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md border bg-background"
        >
          <option value="">All Categories</option>
          {["strategy","content","production","billing","admin","onboarding","general","other"].map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md border bg-background"
        >
          <option value="active">Active</option>
          <option value="all">All</option>
          <option value="done">Completed</option>
        </select>
      </div>

      {/* add form */}
      {showForm && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Task title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ClientTask["category"])}
                className="flex-1 min-w-[140px] text-sm px-3 py-1.5 rounded-md border bg-background"
              >
                {["general","strategy","content","production","billing","admin","onboarding","other"].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as ClientTask["priority"])}
                className="flex-1 min-w-[120px] text-sm px-3 py-1.5 rounded-md border bg-background"
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="flex-1 min-w-[140px] text-sm"
              />
            </div>
            <Textarea
              placeholder="Description (optional)…"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addTask} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Task"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* tasks */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : visibleTasks.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No tasks yet. Add one above.</p>
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}{" "}
              <span className="opacity-50">({visibleTasks.filter((t) => t.category === cat).length})</span>
            </p>
            <div className="space-y-2">
              {visibleTasks.filter((t) => t.category === cat).map((task) => {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const due = task.due_date ? new Date(task.due_date + "T00:00:00") : null;
                const overdue = due && due < today && !task.is_completed;
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      task.is_completed ? "opacity-50 bg-muted/20" : "bg-card hover:bg-muted/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#2dabdf] cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", task.is_completed && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge className={cn("text-xs border", CATEGORY_COLORS[task.category])}>
                          {task.category}
                        </Badge>
                        <Badge className={cn("text-xs border", PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </Badge>
                        {due && (
                          <span className={cn("text-xs", overdue ? "text-red-400" : "text-muted-foreground")}>
                            {overdue ? "⚠ " : ""}Due {fmtDate(task.due_date)}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Calendar panel ────────────────────────────────────────────────────────────
function CalendarPanel({ clientId, userId, relaLink }: { clientId: string; userId: string; relaLink?: string | null }) {
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventType, setNewEventType] = useState<ClientEvent["event_type"]>("meeting");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVisible, setNewVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEvents(); }, [clientId]);

  async function loadEvents() {
    const { data } = await supabase
      .from("client_events")
      .select("*")
      .eq("client_id", clientId)
      .order("event_date");
    setEvents(data || []);
  }

  async function addEvent() {
    if (!newTitle.trim() || !newDate) { toast.error("Title and date are required"); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from("client_events")
      .insert({
        client_id: clientId,
        event_type: newEventType,
        title: newTitle.trim(),
        event_date: newDate,
        event_time: newTime || null,
        meeting_link: newLink.trim() || null,
        description: newDesc.trim() || null,
        is_visible_to_client: newVisible,
        created_by: userId,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error("Failed to add event"); return; }
    setEvents((prev) => [...prev, data].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    setNewTitle(""); setNewTime(""); setNewLink(""); setNewDesc("");
    setShowAddForm(false);
    toast.success("Event added");
  }

  async function deleteEvent(id: string) {
    await supabase.from("client_events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success("Event removed");
  }

  function changeMonth(dir: number) {
    if (dir === 0) { setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth()); return; }
    let m = calMonth + dir, y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setCalMonth(m); setCalYear(y);
  }

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: { day: number; month: number; year: number; off: boolean }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) cells.push({ day: daysInPrev - firstDay + i + 1, month: calMonth === 0 ? 11 : calMonth - 1, year: calMonth === 0 ? calYear - 1 : calYear, off: true });
    else if (i >= firstDay + daysInMonth) cells.push({ day: i - firstDay - daysInMonth + 1, month: calMonth === 11 ? 0 : calMonth + 1, year: calMonth === 11 ? calYear + 1 : calYear, off: true });
    else cells.push({ day: i - firstDay + 1, month: calMonth, year: calYear, off: false });
  }

  const todayStr = today.toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.event_date >= todayStr).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Add event */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as ClientEvent["event_type"])}
                className="flex-1 min-w-[140px] text-sm px-3 py-1.5 rounded-md border bg-background"
              >
                {["meeting","filming","invoice_due","strategy_call","content_deadline","delivery","other"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 min-w-[140px] text-sm"
              />
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 min-w-[100px] text-sm"
              />
            </div>
            <Input placeholder="Title…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input placeholder="Link (Zoom, Calendly, etc.)" value={newLink} onChange={(e) => setNewLink(e.target.value)} />
            <Textarea placeholder="Notes (optional)…" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} className="resize-none" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ev-visible" checked={newVisible} onChange={(e) => setNewVisible(e.target.checked)} className="accent-[#2dabdf]" />
              <label htmlFor="ev-visible" className="text-sm">Visible to client</label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addEvent} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Event"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        {/* Calendar grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base">{MONTH_NAMES[calMonth]} {calYear}</h3>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => changeMonth(0)}>Today</Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-muted/30">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}`;
                const isToday = !cell.off && cell.day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                const dayEvts = events.filter((e) => e.event_date === dateStr);
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[72px] border-r border-b p-1.5",
                      cell.off && "opacity-30",
                      "last:border-r-0"
                    )}
                  >
                    <div className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                      isToday ? "bg-[#2dabdf] text-white" : "text-muted-foreground"
                    )}>
                      {cell.day}
                    </div>
                    {dayEvts.map((e) => (
                      <div
                        key={e.id}
                        className={cn("text-[10px] font-semibold px-1 py-0.5 rounded mb-0.5 truncate", EVENT_PILL_COLORS[e.event_type])}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upcoming</p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : upcoming.map((e) => {
            const { label, cls } = countdownLabel(e.event_date);
            return (
              <div key={e.id} className={cn("p-3 rounded-lg border-l-4 bg-card border", EVENT_TYPE_COLORS[e.event_type])}>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{e.event_type.replace(/_/g," ")}</p>
                    <p className="text-sm font-semibold truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(e.event_date)}{e.event_time ? " · " + fmtTime(e.event_time) : ""}</p>
                    <p className={cn("text-xs mt-1", cls)}>{label}</p>
                    {e.meeting_link && (
                      <a href={e.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2dabdf] hover:underline">Join ↗</a>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => deleteEvent(e.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Calendar embed */}
      {relaLink && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content Calendar</p>
          <div className="border rounded-lg overflow-hidden">
            <iframe src={relaLink} className="w-full h-[420px]" title="Content Calendar" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reminders panel ───────────────────────────────────────────────────────────
function RemindersPanel({ clientId }: { clientId: string }) {
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("client_events")
      .select("*")
      .eq("client_id", clientId)
      .order("event_date")
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, [clientId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = events.filter((e) => e.event_date >= todayStr);
  const past = events.filter((e) => e.event_date < todayStr).reverse();

  const ReminderCard = ({ e }: { e: ClientEvent }) => {
    const { label, cls } = countdownLabel(e.event_date);
    return (
      <div className={cn("p-4 rounded-lg border-l-4 bg-card border", EVENT_TYPE_COLORS[e.event_type])}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{e.event_type.replace(/_/g," ")}</p>
        <p className="font-semibold">{e.title}</p>
        <p className="text-sm text-muted-foreground">{fmtDate(e.event_date)}{e.event_time ? " · " + fmtTime(e.event_time) : ""}</p>
        <p className={cn("text-sm font-semibold mt-1", cls)}>{label}</p>
        {e.meeting_link && (
          <a href={e.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2dabdf] hover:underline mt-1 inline-block">Join / Open ↗</a>
        )}
        {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
      </div>
    );
  };

  if (events.length === 0) return (
    <div className="text-center py-10 text-muted-foreground">
      <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p>No events yet. Add one in the Calendar tab.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Upcoming</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map((e) => <ReminderCard key={e.id} e={e} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Past</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
            {past.map((e) => <ReminderCard key={e.id} e={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export const ClientDetailsDialog = ({
  open,
  onOpenChange,
  selectedClient,
  clientDetailsForm,
  onFieldChange,
  onDateChange,
  onCopy,
  onQuickAction,
  getStatusColor,
  hasClientChanges,
  onSaveClientDetails,
  savingClientDetails,
}: ClientDetailsDialogProps) => {
  const { profile } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] w-[96vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {selectedClient && (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-5 pb-0 flex-shrink-0 border-b">
              <div className="flex items-center gap-4 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2dabdf]/10 flex-shrink-0">
                  <span className="text-xl font-bold text-[#2dabdf]">
                    {selectedClient.client_name?.[0]?.toUpperCase() || selectedClient.client_email[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-bold">
                    {selectedClient.client_name || "No Name"}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {selectedClient.business_name || selectedClient.company_name || selectedClient.client_email}
                  </DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedClient.status && (
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {selectedClient.status.replace(/_/g," ").toUpperCase()}
                      </Badge>
                    )}
                    {selectedClient.package_name && (
                      <Badge variant="outline">📦 {selectedClient.package_name}</Badge>
                    )}
                    {selectedClient.total_investment && (
                      <Badge variant="outline">💰 {selectedClient.total_investment}/mo</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => onQuickAction("email")}>
                    <Mail className="h-4 w-4 mr-1" /> Email
                  </Button>
                  {selectedClient.phone_number && (
                    <Button variant="outline" size="sm" onClick={() => onQuickAction("call")}>
                      <Phone className="h-4 w-4 mr-1" /> Call
                    </Button>
                  )}
                  {selectedClient.auth_user_id && (
                    <Button variant="outline" size="sm" onClick={() => onQuickAction("viewHub")}>
                      <ExternalLink className="h-4 w-4 mr-1" /> Hub
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Tabbed body */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="px-6 py-0 h-10 rounded-none border-b bg-transparent justify-start gap-1 flex-shrink-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2dabdf] data-[state=active]:bg-transparent">Overview</TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2dabdf] data-[state=active]:bg-transparent">Project Manager</TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2dabdf] data-[state=active]:bg-transparent">Calendar</TabsTrigger>
                <TabsTrigger value="reminders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#2dabdf] data-[state=active]:bg-transparent">Reminders</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="flex-1 overflow-y-auto px-6 py-5 space-y-5 mt-0">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-1.5"><Label className="text-xs">Client ID</Label><Input value={selectedClient.client_id} disabled className="font-mono text-sm" /></div>
                      <div className="grid gap-1.5"><Label className="text-xs">Email</Label>
                        <div className="flex gap-2">
                          <Input value={selectedClient.client_email} disabled className="text-sm" />
                          <Button variant="outline" size="sm" className="px-2" onClick={() => onCopy(selectedClient.client_email,"Email")}><Copy className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      {selectedClient.phone_number && (
                        <div className="grid gap-1.5"><Label className="text-xs">Phone</Label>
                          <div className="flex gap-2">
                            <Input value={selectedClient.phone_number} disabled className="text-sm" />
                            <Button variant="outline" size="sm" className="px-2" onClick={() => onCopy(selectedClient.phone_number||"","Phone")}><Copy className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Package & Billing</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-1.5"><Label className="text-xs">Package</Label><Input value={clientDetailsForm.package_name||""} onChange={(e)=>onFieldChange("package_name",e.target.value)} placeholder="Package name" className="text-sm" /></div>
                      <div className="grid gap-1.5"><Label className="text-xs">Budget / Investment</Label><Input value={clientDetailsForm.budget||""} onChange={(e)=>onFieldChange("budget",e.target.value)} placeholder="e.g. $2,500/mo" className="text-sm" /></div>
                      <div className="grid gap-1.5"><Label className="text-xs">Status</Label>
                        <select value={clientDetailsForm.status||""} onChange={(e)=>onFieldChange("status",e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm">
                          {["new","proposal_sent","pending_approval","approved","rejected","contract_sent","contract_signed","active","completed"].map((s)=>(
                            <option key={s} value={s}>{s.replace(/_/g," ")}</option>
                          ))}
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Links */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resource Links</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      ["Dropbox Link","dropbox_link"],
                      ["Content Calendar URL","rela_link"],
                      ["Strategy Call Link","strategy_call_link"],
                      ["Filming Date Link","filming_date_link"],
                    ] as [string, keyof Client][]).map(([label, field]) => (
                      <div key={field} className="grid gap-1.5">
                        <Label className="text-xs">{label}</Label>
                        <div className="flex gap-2">
                          <Input value={(clientDetailsForm[field] as string)||""} onChange={(e)=>onFieldChange(field,e.target.value)} placeholder="https://…" className="text-sm" />
                          {clientDetailsForm[field] && (
                            <>
                              <Button variant="outline" size="sm" className="px-2" onClick={()=>onCopy((clientDetailsForm[field] as string)||"",label)}><Copy className="h-3.5 w-3.5" /></Button>
                              <Button variant="outline" size="sm" className="px-2" onClick={()=>window.open((clientDetailsForm[field] as string)||"","_blank")}><ExternalLink className="h-3.5 w-3.5" /></Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Timeline</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      ["Proposal Sent","proposal_sent_date"],
                      ["Proposal Approved","proposal_approved_date"],
                      ["Contract Sent","contract_sent_date"],
                      ["Contract Signed","contract_signed_date"],
                      ["Onboarding Started","onboarding_started_date"],
                    ] as [string, keyof Client][]).map(([label, field]) => {
                      const selectedDate = formatDateForInput(clientDetailsForm[field] as string | null || null);
                      return (
                        <div key={field} className="grid gap-1.5">
                          <Label className="text-xs">{label}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("justify-start text-left font-normal text-sm", !selectedDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate,"PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={selectedDate} onSelect={(d)=>onDateChange(field,d||undefined)} initialFocus />
                              <div className="p-2 border-t"><Button variant="ghost" size="sm" className="w-full" onClick={()=>onDateChange(field,undefined)}>Clear Date</Button></div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meeting Notes</CardTitle></CardHeader>
                    <CardContent><Textarea value={clientDetailsForm.meeting_notes||""} onChange={(e)=>onFieldChange("meeting_notes",e.target.value)} placeholder="Meeting notes…" rows={6} className="resize-none text-sm" /></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Admin Notes</CardTitle></CardHeader>
                    <CardContent><Textarea value={clientDetailsForm.notes||""} onChange={(e)=>onFieldChange("notes",e.target.value)} placeholder="Internal notes…" rows={6} className="resize-none text-sm" /></CardContent>
                  </Card>
                </div>

                {/* Save bar */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={()=>onOpenChange(false)} disabled={savingClientDetails}>Cancel</Button>
                  <Button onClick={onSaveClientDetails} disabled={!hasClientChanges||savingClientDetails}>
                    {savingClientDetails ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>

              {/* Project Manager */}
              <TabsContent value="tasks" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
                <ProjectManagerPanel clientId={selectedClient.id} userId={profile?.id || ""} />
              </TabsContent>

              {/* Calendar */}
              <TabsContent value="calendar" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
                <CalendarPanel clientId={selectedClient.id} userId={profile?.id || ""} relaLink={selectedClient.rela_link} />
              </TabsContent>

              {/* Reminders */}
              <TabsContent value="reminders" className="flex-1 overflow-y-auto px-6 py-5 mt-0">
                <RemindersPanel clientId={selectedClient.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
