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
  { id: "backlog", label: "Backlog", color: "#f59e0b" },
  { id: "in-progress", label: "In Progress", color: "#3b82f6" },
  { id: "review", label: "Review", color: "#f97316" },
  { id: "done", label: "Done", color: "#22c55e" },
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
  const completion = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{totalTasks}</span>
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>Total tasks</span>
          </div>
          <div>
            <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{inProgressCount}</span>
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>In progress</span>
          </div>
          <div>
            <span className="text-3xl font-bold" style={{ color: "var(--accent)" }}>{completion}%</span>
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>Done</span>
          </div>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.column === col.id);
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[240px] flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{col.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: "var(--text-muted)", background: "var(--bg-tertiary)" }}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="kanban-card rounded-lg p-3 border transition-colors cursor-move group"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {task.title}
                        </div>
                        <div className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                          {task.description}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ background: task.assignee === "Optimus" || task.assignee === "Optimus Prime" ? "var(--accent)" : 
                                agents.find(a => a.name === task.assignee)?.color || "#22c55e" }}
                            >
                              {task.assigneeInitial}
                            </div>
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            <Clock size={10} />
                            {task.createdAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Activity Feed */}
        <div className="w-64 shrink-0 border-l pl-4" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Live Activity</h3>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ background: "var(--accent)" }}>
                    {item.agent[0]}
                  </div>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{item.agent}</span>
                </div>
                <div className="ml-5.5 mt-0.5" style={{ color: "var(--text-muted)" }}>{item.action}</div>
                <div className="ml-5.5 text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{formatTimestamp(item.timestamp)}</div>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>No recent activity</div>
            )}
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
