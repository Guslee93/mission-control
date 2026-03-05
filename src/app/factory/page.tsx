"use client";

import { useState } from "react";
import { Factory, Play, Pause, RotateCcw, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface BatchJob {
  id: string;
  name: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  total: number;
  processed: number;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
}

const initialJobs: BatchJob[] = [
  { id: "1", name: "Sync Memory Files", status: "completed", progress: 100, total: 150, processed: 150, completedAt: "2026-03-04T23:00:00Z", logs: ["Starting sync...", "Found 150 files", "Processed 150/150", "Sync complete"] },
  { id: "2", name: "Content Generation", status: "running", progress: 45, total: 20, processed: 9, startedAt: "2026-03-05T00:00:00Z", logs: ["Starting batch...", "Generating blog posts", "9/20 completed"] },
  { id: "3", name: "Agent Health Check", status: "queued", progress: 0, total: 11, processed: 0, logs: [] },
];

export default function FactoryPage() {
  const [jobs, setJobs] = useState<BatchJob[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null);

  const runJob = (id: string) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status: "running", startedAt: new Date().toISOString() } : j)));
  };

  const pauseJob = (id: string) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status: "queued" } : j)));
  };

  const restartJob = (id: string) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status: "queued", progress: 0, processed: 0, logs: [] } : j)));
  };

  const statusColors: Record<string, string> = {
    queued: "#6b7280",
    running: "#3b82f6",
    completed: "#22c55e",
    failed: "#ef4444",
  };

  const runningCount = jobs.filter((j) => j.status === "running").length;
  const queuedCount = jobs.filter((j) => j.status === "queued").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Factory size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Factory</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{runningCount} running • {queuedCount} queued • {completedCount} completed</p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className="p-4 rounded-xl border cursor-pointer transition-colors hover:border-opacity-50"
            style={{ background: "var(--bg-card)", borderColor: selectedJob?.id === job.id ? "var(--accent)" : "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {job.status === "running" && "⚙️"}
                  {job.status === "queued" && "⏳"}
                  {job.status === "completed" && "✅"}
                  {job.status === "failed" && "❌"}
                </span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{job.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-medium capitalize"
                  style={{ background: statusColors[job.status] + "20", color: statusColors[job.status] }}
                >
                  {job.status}
                </span>
                {job.status === "queued" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); runJob(job.id); }}
                    className="p-1.5 rounded-lg text-white"
                    style={{ background: "#22c55e" }}
                  >
                    <Play size={14} />
                  </button>
                )}
                {job.status === "running" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); pauseJob(job.id); }}
                    className="p-1.5 rounded-lg text-white"
                    style={{ background: "#f59e0b" }}
                  >
                    <Pause size={14} />
                  </button>
                )}
                {(job.status === "completed" || job.status === "failed") && (
                  <button
                    onClick={(e) => { e.stopPropagation(); restartJob(job.id); }}
                    className="p-1.5 rounded-lg text-white"
                    style={{ background: "#3b82f6" }}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${job.progress}%`, background: statusColors[job.status] }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {job.processed}/{job.total}
              </span>
            </div>

            {job.status === "running" && (
              <div className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Started: {new Date(job.startedAt!).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Job Detail */}
      {selectedJob && (
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h3 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>Job Logs: {selectedJob.name}</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
            {selectedJob.logs.length === 0 && (
              <span style={{ color: "var(--text-muted)" }}>No logs yet...</span>
            )}
            {selectedJob.logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span style={{ color: "var(--text-muted)" }}>[{new Date().toLocaleTimeString()}]</span>
                <span style={{ color: "var(--text-secondary)" }}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
