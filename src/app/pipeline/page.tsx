"use client";

import { useState } from "react";
import { GitBranch, ArrowRight, CheckCircle, XCircle, Clock, Play } from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  status: "idle" | "running" | "completed" | "failed";
  duration?: string;
  output?: string;
}

interface Pipeline {
  id: string;
  name: string;
  trigger: string;
  status: "idle" | "running" | "completed" | "failed";
  stages: PipelineStage[];
  lastRun?: string;
}

const pipelines: Pipeline[] = [
  {
    id: "1",
    name: "Deploy Mission Control",
    trigger: "Manual",
    status: "completed",
    lastRun: "2026-03-04T23:50:00Z",
    stages: [
      { id: "s1", name: "Build", status: "completed", duration: "15s", output: "Build successful" },
      { id: "s2", name: "Test", status: "completed", duration: "5s", output: "All tests passed" },
      { id: "s3", name: "Deploy", status: "completed", duration: "35s", output: "Deployed to Vercel" },
    ],
  },
  {
    id: "2",
    name: "Content Publish Flow",
    trigger: "On Schedule",
    status: "idle",
    stages: [
      { id: "s1", name: "Draft", status: "completed" },
      { id: "s2", name: "Review", status: "completed" },
      { id: "s3", name: "Schedule", status: "idle" },
      { id: "s4", name: "Publish", status: "idle" },
    ],
  },
  {
    id: "3",
    name: "Daily Briefing",
    trigger: "Cron (7:00 AM)",
    status: "idle",
    stages: [
      { id: "s1", name: "Fetch News", status: "idle" },
      { id: "s2", name: "Generate TTS", status: "idle" },
      { id: "s3", name: "Send Voice", status: "idle" },
    ],
  },
];

export default function PipelinePage() {
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline>(pipelines[0]);

  const statusColors: Record<string, string> = {
    idle: "#6b7280",
    running: "#3b82f6",
    completed: "#22c55e",
    failed: "#ef4444",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GitBranch size={24} style={{ color: "var(--accent)" }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Pipeline</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{pipelines.length} pipelines configured</p>
        </div>
      </div>

      {/* Pipeline List */}
      <div className="grid grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <button
            key={pipeline.id}
            onClick={() => setSelectedPipeline(pipeline)}
            className="rounded-xl p-4 border text-left transition-colors"
            style={{
              background: selectedPipeline.id === pipeline.id ? "var(--bg-tertiary)" : "var(--bg-card)",
              borderColor: selectedPipeline.id === pipeline.id ? "var(--accent)" : "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{pipeline.name}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: statusColors[pipeline.status] }}
              />
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Trigger: {pipeline.trigger}</div>
            {pipeline.lastRun && (
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Last run: {new Date(pipeline.lastRun).toLocaleTimeString()}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Pipeline Visual */}
      <div className="rounded-xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedPipeline.name}</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Trigger: {selectedPipeline.trigger}</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            <Play size={14} />
            Run Pipeline
          </button>
        </div>

        {/* Stages */}
        <div className="flex items-center gap-2">
          {selectedPipeline.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-2">
              <div
                className="flex flex-col items-center p-3 rounded-lg border min-w-[100px]"
                style={{
                  background: stage.status === "completed" ? "#22c55e10" : stage.status === "running" ? "#3b82f610" : "var(--bg-tertiary)",
                  borderColor: statusColors[stage.status],
                }}
              >
                <span className="text-lg">
                  {stage.status === "completed" && <CheckCircle size={20} style={{ color: "#22c55e" }} />}
                  {stage.status === "failed" && <XCircle size={20} style={{ color: "#ef4444" }} />}
                  {stage.status === "running" && <Clock size={20} style={{ color: "#3b82f6" }} />}
                  {stage.status === "idle" && <div className="w-5 h-5 rounded-full" style={{ background: "#6b7280" }} />}
                </span>
                <span className="text-xs font-medium mt-1" style={{ color: "var(--text-primary)" }}>{stage.name}</span>
                {stage.duration && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{stage.duration}</span>
                )}
              </div>
              {index < selectedPipeline.stages.length - 1 && (
                <ArrowRight size={20} style={{ color: "var(--text-muted)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Stage Output */}
        {selectedPipeline.stages.some((s) => s.output) && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Stage Outputs</h4>
            <div className="space-y-2">
              {selectedPipeline.stages.filter((s) => s.output).map((stage) => (
                <div key={stage.id} className="p-3 rounded-lg font-mono text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--text-muted)" }}>[{stage.name}]</span> {stage.output}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
