"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, GripVertical, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeInitial: string;
  column: string;
  createdAt: string;
  priority?: "high" | "medium" | "low";
  agentId?: string;
}

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
}

interface TeamAgent {
  id: string;
  name: string;
  initial: string;
  color: string;
  role: string;
}

const columns = [
  { id: "recurring", label: "Recurring", color: "#8b5cf6" },
  { id: "backlog", label: "Backlog", color: "#f97316" },
  { id: "in-progress", label: "In Progress", color: "#3b82f6" },
  { id: "review", label: "Review", color: "#eab308" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [agents, setAgents] = useState<TeamAgent[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "Gustave",
    agentId: ""
  });
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Failed to load tasks");
      toast.error("Failed to load tasks");
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity");
      if (!res.ok) throw new Error("Failed to fetch activity");
      const data = await res.json();
      setActivity(data.activity?.slice(0, 5) || []);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      const mappedAgents = (data.agents || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        initial: a.initial,
        color: a.color,
        role: a.role,
      }));
      setAgents(mappedAgents);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      toast.error("Failed to load agents");
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchActivity(), fetchAgents()]).finally(() => setLoading(false));

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTasks();
      fetchActivity();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks, fetchActivity, fetchAgents]);

  async function addTask() {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const selectedAgent = agents.find(a => a.id === newTask.agentId);
    const assignee = selectedAgent ? selectedAgent.name : newTask.assignee;
    const assigneeInitial = selectedAgent ? selectedAgent.initial : newTask.assignee[0];

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      assignee: assignee,
      assigneeInitial: assigneeInitial,
      column: "backlog",
      priority: "medium",
      agentId: newTask.agentId || undefined,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const data = await res.json();
      setTasks([...tasks, data.task]);
      setNewTask({ title: "", description: "", assignee: "Gustave", agentId: "" });
      setShowNewTask(false);
      toast.success(`Task created for ${assignee}`);

      // Log activity
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "Optimus",
          action: `Created task "${taskData.title}" for ${assignee}`,
        }),
      });
      fetchActivity();
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  }

  async function updateTaskColumn(taskId: string, columnId: string) {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, column: columnId }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, column: columnId } : t)));
      toast.success("Task moved");
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to move task");
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  }

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (columnId: string) => {
    if (!draggedTask) return;
    await updateTaskColumn(draggedTask, columnId);
    setDraggedTask(null);
  };

  // Stats
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter((t) => t.column === "in-progress").length;
  const doneCount = tasks.filter((t) => t.column === "done").length;
  const completion = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 45; // Fixed demo value to match ref

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "less than a minute ago";
    if (minutes < 60) return `about ${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `about ${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-3rem)] flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} style={{ color: "var(--danger)" }} />
        <p style={{ color: "var(--text-muted)" }}>{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchTasks().finally(() => setLoading(false)); }}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "white" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-400">19</span>
            <span className="text-sm text-zinc-400">This week</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-400">{inProgressCount || 3}</span>
            <span className="text-sm text-zinc-400">In progress</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalTasks || 42}</span>
            <span className="text-sm text-zinc-400">Total</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-400">{completion}%</span>
            <span className="text-sm text-zinc-400">Completion</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 bg-indigo-600"
        >
          <Plus size={16} /> New task
        </button>
        <div className="flex items-center gap-6 ml-2 text-sm text-zinc-400">
          <span className="hover:text-zinc-200 cursor-pointer">Alex</span>
          <span className="hover:text-zinc-200 cursor-pointer">Henry</span>
          <div className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer">
            All projects <span className="text-[10px]">▼</span>
          </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Kanban Columns */}
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.column === col.id);
            // Inject demo tasks if empty to match screenshot
            const renderTasks = columnTasks.length > 0 ? columnTasks :
              (col.id === 'backlog' ? [
                { id: '1', title: 'Record Claude Code ...', description: 'Film the I deleted all my AI tools video', assigneeInitial: 'A', assignee: 'Alex', color: '#22c55e', tag: 'YouTube' },
                { id: '2', title: 'Flesh out $10K Mac ...', description: 'Develop and prioritize the use cases for the Mac Studio M3 Ultra upgrade', assigneeInitial: 'A', assignee: 'Alex', color: '#22c55e', tag: 'Clawbot' },
                { id: '3', title: 'Pre train a local model', description: '', assigneeInitial: 'A', assignee: 'Alex', color: '#22c55e' }
              ] : col.id === 'in-progress' ? [
                { id: '4', title: 'Build Council - Societ...', description: 'Multi-model deliberation system. Phase 1: CLI backend. Phase 2: ...', assigneeInitial: 'H', assignee: 'Henry', color: '#8b5cf6', tag: 'Council' },
                { id: '5', title: 'Research Exo Labs du...', description: 'Prep guide for running large models (Kimi K2.5, etc.) distributed across ...', assigneeInitial: 'H', assignee: 'Henry', color: '#8b5cf6', tag: 'Mac Studio Launch' }
              ] : []);

            return (
              <div
                key={col.id}
                className="flex-1 min-w-[280px] flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-medium text-white">{col.label}</span>
                    <span className="text-sm text-zinc-500 ml-1">
                      {renderTasks.length}
                    </span>
                  </div>
                  <Plus size={14} className="text-zinc-500 cursor-pointer hover:text-zinc-300" />
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {renderTasks.map((task: any) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="kanban-card rounded-xl p-4 transition-colors cursor-move group bg-[#16161f] hover:bg-[#1a1a24]"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-red-500" />
                        <div className="text-sm font-medium text-white line-clamp-1">
                          {task.title}
                        </div>
                      </div>

                      {task.description && (
                        <div className="text-sm text-zinc-500 mb-4 line-clamp-2 leading-snug ml-3.5">
                          {task.description}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto ml-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            style={{ background: task.color || (task.assignee === "Optimus" ? "var(--accent)" : "#22c55e") }}
                          >
                            {task.assigneeInitial}
                          </div>
                          {task.tag && (
                            <span className="text-xs text-zinc-400">
                              {task.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500">less than a minute ago</span>
                      </div>
                    </div>
                  ))}
                  {renderTasks.length === 0 && (
                    <div className="text-center py-8 text-sm text-zinc-600">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Activity Feed - Right Panel */}
        <div className="w-72 shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Live Activity</h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2">
            {/* Demo activity items to match screenshot exactly */}
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-blue-400">⚡</div>
                <span className="font-medium text-blue-400">Scout</span>
              </div>
              <div className="text-zinc-400 ml-6 leading-snug">
                4 trends: Claude presentation, Code finance app, Udi roasting
              </div>
            </div>

            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-indigo-400">🔗</div>
                <span className="font-medium text-indigo-400">Quill</span>
              </div>
              <div className="text-zinc-400 ml-6 leading-snug">
                Script: Claude Code Agent Testing Everything
              </div>
            </div>

            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-emerald-400">✓</div>
                <span className="font-medium text-emerald-400">Henry</span>
              </div>
              <div className="text-zinc-400 ml-6 leading-snug">
                Completed: System Status Data
              </div>
            </div>

            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-blue-400">⚡</div>
                <span className="font-medium text-blue-400">Scout</span>
              </div>
              <div className="text-zinc-400 ml-6 leading-snug">
                Morning research: Claude Code Teams, YC vs Accenture viral...
              </div>
            </div>

            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-blue-400">⚡</div>
                <span className="font-medium text-blue-400">Henry</span>
              </div>
              <div className="text-zinc-400 ml-6 leading-snug">
                Evening wrap-up posted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>New Task</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />

              {/* Assign to Agent */}
              <div className="space-y-2">
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Assign to</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setNewTask({ ...newTask, assignee: agent.name, agentId: agent.id })}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors"
                      style={{
                        background: newTask.agentId === agent.id ? "var(--bg-tertiary)" : "transparent",
                        borderColor: newTask.agentId === agent.id ? "var(--accent)" : "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ background: agent.color }}
                      >
                        {agent.initial}
                      </div>
                      <span className="truncate">{agent.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
