import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Client, ClientTask } from "@/pages/admin-dashboard/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Plus,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Circle,
  User,
  Loader2,
} from "lucide-react";

interface ProjectManagerTabProps {
  clients: Client[];
}

const CATEGORIES: ClientTask["category"][] = [
  "strategy", "content", "production", "billing", "admin", "onboarding", "general", "other",
];

const PRIORITIES: ClientTask["priority"][] = ["high", "medium", "low"];

const CATEGORY_COLORS: Record<string, string> = {
  strategy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  content: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  production: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  billing: "bg-green-500/10 text-green-400 border-green-500/20",
  admin: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  onboarding: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  general: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  other: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ProjectManagerTab({ clients }: ProjectManagerTabProps) {
  const { profile } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"active" | "all" | "completed">("active");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "general" as ClientTask["category"],
    priority: "medium" as ClientTask["priority"],
    due_date: "",
    description: "",
  });
  const [savingTask, setSavingTask] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  const filteredClients = clients.filter((c) =>
    (c.client_name || "").toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.business_name || c.company_name || "").toLowerCase().includes(clientSearch.toLowerCase())
  );

  const fetchTasks = useCallback(async () => {
    if (!selectedClientId) return;
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from("client_tasks")
        .select("*")
        .eq("client_id", selectedClientId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTasks(data ?? []);
    } catch (err: any) {
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleToggleTask(task: ClientTask) {
    const newCompleted = !task.is_completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );
    const { error } = await supabase
      .from("client_tasks")
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
    if (error) {
      toast.error("Failed to update task");
      fetchTasks();
    }
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const { error } = await supabase.from("client_tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Failed to delete task");
      fetchTasks();
    }
  }

  async function handleAddTask() {
    if (!selectedClientId || !newTask.title.trim()) return;
    setSavingTask(true);
    try {
      const { error } = await supabase.from("client_tasks").insert({
        client_id: selectedClientId,
        title: newTask.title.trim(),
        category: newTask.category,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        description: newTask.description.trim() || null,
        is_completed: false,
        sort_order: tasks.length,
        created_by: profile?.id ?? null,
      });
      if (error) throw error;
      setNewTask({ title: "", category: "general", priority: "medium", due_date: "", description: "" });
      setShowAddForm(false);
      fetchTasks();
      toast.success("Task added");
    } catch (err: any) {
      toast.error("Failed to add task");
    } finally {
      setSavingTask(false);
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "active" && t.is_completed) return false;
    if (filterStatus === "completed" && !t.is_completed) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  const tasksByCategory = CATEGORIES.reduce<Record<string, ClientTask[]>>((acc, cat) => {
    const catTasks = filteredTasks.filter((t) => t.category === cat);
    if (catTasks.length > 0) acc[cat] = catTasks;
    return acc;
  }, {});

  const activeTasks = tasks.filter((t) => !t.is_completed).length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="flex h-[calc(100vh-220px)] gap-0 rounded-lg border overflow-hidden">
      {/* Sidebar - client list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r bg-muted/20">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Clients
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search clients..."
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => {
                setSelectedClientId(client.id);
                setFilterCategory("all");
                setFilterStatus("active");
                setShowAddForm(false);
              }}
              className={cn(
                "w-full text-left px-4 py-3 border-b transition-colors hover:bg-muted/50 flex items-center gap-3",
                selectedClientId === client.id && "bg-primary/10 border-l-2 border-l-primary"
              )}
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{client.client_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {client.business_name || client.company_name || client.client_email}
                </p>
              </div>
              {selectedClientId === client.id && (
                <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
          {filteredClients.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">No clients found</p>
          )}
        </div>
      </div>

      {/* Main area */}
      {!selectedClient ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a client to manage their tasks</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Client header */}
          <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold">{selectedClient.client_name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedClient.business_name || selectedClient.company_name}
                {" · "}
                <span className="text-green-400">{completedTasks} done</span>
                {" · "}
                <span className="text-yellow-400">{activeTasks} active</span>
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddForm((v) => !v)}
              className="rounded-full gap-2"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Task"}
            </Button>
          </div>

          {/* Add task form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b bg-muted/10 flex-shrink-0">
              <div className="space-y-3">
                <Input
                  placeholder="Task title *"
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  className="h-9"
                />
                <div className="flex gap-3 flex-wrap">
                  <Select
                    value={newTask.category}
                    onValueChange={(v) => setNewTask((p) => ({ ...p, category: v as ClientTask["category"] }))}
                  >
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v as ClientTask["priority"] }))}
                  >
                    <SelectTrigger className="h-8 text-xs w-28">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask((p) => ({ ...p, due_date: e.target.value }))}
                    className="h-8 text-xs w-36"
                  />
                </div>
                <Textarea
                  placeholder="Notes (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  className="text-sm resize-none h-16"
                />
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  disabled={savingTask || !newTask.title.trim()}
                  className="rounded-full"
                >
                  {savingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Task
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="px-6 py-3 border-b flex items-center gap-3 flex-shrink-0 flex-wrap">
            <div className="flex gap-1">
              {(["active", "all", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                    filterStatus === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilterCategory("all")}
                className={cn(
                  "px-3 py-1 text-xs rounded-full transition-colors",
                  filterCategory === "all"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                    filterCategory === cat
                      ? "bg-primary/20 text-primary"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {filterStatus === "active" ? "No active tasks" : "No tasks found"}
                </p>
                <p className="text-xs mt-1 opacity-70">Click "Add Task" to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(tasksByCategory).map(([cat, catTasks]) => (
                  <div key={cat}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] border", CATEGORY_COLORS[cat])}>
                        {cat}
                      </span>
                      <span className="opacity-50">{catTasks.length}</span>
                    </h3>
                    <div className="space-y-1">
                      {catTasks.map((task) => {
                        const overdue = isOverdue(task.due_date) && !task.is_completed;
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border transition-colors group",
                              task.is_completed
                                ? "opacity-50 bg-muted/5"
                                : overdue
                                ? "border-red-500/20 bg-red-500/5"
                                : "bg-muted/10 hover:bg-muted/20"
                            )}
                          >
                            <Checkbox
                              checked={task.is_completed}
                              onCheckedChange={() => handleToggleTask(task)}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm text-white",
                                  task.is_completed && "line-through text-muted-foreground"
                                )}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", PRIORITY_COLORS[task.priority])}>
                                  {task.priority}
                                </span>
                                {task.due_date && (
                                  <span
                                    className={cn(
                                      "text-[10px] flex items-center gap-1",
                                      overdue ? "text-red-400" : "text-muted-foreground"
                                    )}
                                  >
                                    {overdue && <AlertTriangle className="h-3 w-3" />}
                                    Due {formatDueDate(task.due_date)}
                                  </span>
                                )}
                                {task.is_completed && task.completed_at && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Circle className="h-2 w-2 fill-green-400 text-green-400" />
                                    Done {new Date(task.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 flex-shrink-0 mt-0.5"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
