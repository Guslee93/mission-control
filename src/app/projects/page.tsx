"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Plus, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "active" | "planning" | "paused";
  progress: number;
  tasksComplete: number;
  tasksTotal: number;
  assignee: string;
  assigneeInitial: string;
  priority: "high" | "medium" | "low";
  updatedAgo: string;
}

const statusColors: Record<string, string> = {
  active: "#22c55e",
  planning: "#3b82f6",
  paused: "#f59e0b",
};

const priorityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    assignee: "Gustave",
    priority: "medium" as "high" | "medium" | "low",
    status: "planning" as "active" | "planning" | "paused",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addProject() {
    if (!newProject.title.trim()) return;

    const projectData = {
      ...newProject,
      assigneeInitial: newProject.assignee[0],
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects([...projects, data.project]);
        setNewProject({
          title: "",
          description: "",
          assignee: "Gustave",
          priority: "medium",
          status: "planning",
        });
        setShowNewProject(false);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }

  const activeCount = projects.filter((p) => p.status === "active").length;
  const planningCount = projects.filter((p) => p.status === "planning").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Projects</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {loading ? "—" : `${projects.length} total`} • {loading ? "—" : `${activeCount} active`} • {loading ? "—" : `${planningCount} planning`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Project Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl p-5 border transition-colors hover:border-opacity-50"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{project.title}</h3>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                  style={{
                    background: `${statusColors[project.status]}20`,
                    color: statusColors[project.status],
                  }}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                {project.description}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{project.progress}%</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {project.tasksComplete}/{project.tasksTotal}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                      background: statusColors[project.status],
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: project.assignee === "Optimus" ? "var(--accent)" : "#22c55e" }}
                  >
                    {project.assigneeInitial}
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{project.assignee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      background: `${priorityColors[project.priority]}20`,
                      color: priorityColors[project.priority],
                    }}
                  >
                    {project.priority}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{project.updatedAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban size={48} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No projects yet</p>
          <button
            onClick={() => setShowNewProject(true)}
            className="mt-2 text-sm text-blue-400 hover:underline"
          >
            Create your first project
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>New Project</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newProject.assignee}
                  onChange={(e) => setNewProject({ ...newProject, assignee: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="Gustave">Gustave</option>
                  <option value="Optimus">Optimus Prime</option>
                </select>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="high">High priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="low">Low priority</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowNewProject(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addProject}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
