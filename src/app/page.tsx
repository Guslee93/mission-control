"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckSquare,
  Calendar,
  FolderKanban,
  Brain,
  FileText,
  Users,
  Building2,
  TrendingUp,
  Loader2,
  Bot,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Stats {
  tasks: { total: number; inProgress: number };
  projects: { active: number };
  memories: { total: number };
  docs: { total: number };
  agents: { total: number; online: number };
}

const quickStats = [
  { label: "Tasks", key: "tasksInProgress", sub: "In progress", icon: CheckSquare, href: "/tasks", color: "#6366f1" },
  { label: "Projects", key: "projectsActive", sub: "Active", icon: FolderKanban, href: "/projects", color: "#22c55e" },
  { label: "Agents", key: "agentsTotal", sub: "Total team", icon: Bot, href: "/team", color: "#f59e0b" },
  { label: "Docs", key: "docsTotal", sub: "Created", icon: FileText, href: "/docs", color: "#3b82f6" },
];

const tools = [
  { label: "Tasks", desc: "Kanban board for task management", icon: CheckSquare, href: "/tasks" },
  { label: "Calendar", desc: "Scheduled tasks and cron jobs", icon: Calendar, href: "/calendar" },
  { label: "Projects", desc: "Track major projects and progress", icon: FolderKanban, href: "/projects" },
  { label: "Memory", desc: "Browse memories by day", icon: Brain, href: "/memory" },
  { label: "Docs", desc: "All documents, searchable", icon: FileText, href: "/docs" },
  { label: "Team", desc: "Agents, roles, and mission", icon: Users, href: "/team" },
  { label: "Office", desc: "Pixel art agent visualization", icon: Building2, href: "/office" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getStatValue = (key: string) => {
    if (!stats) return "—";
    switch (key) {
      case "tasksInProgress":
        return stats.tasks.inProgress.toString();
      case "projectsActive":
        return stats.projects.active.toString();
      case "agentsTotal":
        return stats.agents?.total?.toString() || "0";
      case "docsTotal":
        return stats.docs.total.toString();
      default:
        return "0";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Mission Control 🔥
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Welcome back, Gustave. Here&apos;s your command center.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl p-4 border transition-all hover:scale-[1.02] hover:border-opacity-50"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} style={{ color: stat.color }} />
              <TrendingUp size={14} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              ) : (
                <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {getStatValue(stat.key)}
                </div>
              )}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>Tools</h2>
        <div className="grid grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.label}
              href={tool.href}
              className="rounded-xl p-5 border transition-all hover:scale-[1.02] hover:border-opacity-50"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <tool.icon size={20} style={{ color: "var(--accent)" }} className="mb-3" />
              <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{tool.label}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{tool.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
        <div className="flex gap-2">
          <Link
            href="/tasks?new=true"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Create Task
          </Link>
          <Link
            href="/team"
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Spawn Agent
          </Link>
          <Link
            href="/office"
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            View Office
          </Link>
        </div>
      </div>
    </div>
  );
}
