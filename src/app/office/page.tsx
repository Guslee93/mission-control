"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, Users, Coffee, Presentation, Home } from "lucide-react";

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
}

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  status: "working" | "idle" | "break" | "meeting";
  targetX?: number;
  targetY?: number;
  machine?: string;
}

const GRID_W = 16;
const GRID_H = 10;
const CELL = 48;

// Initial agents data
const initialAgents: Agent[] = [
  { id: "optimus", name: "Optimus", emoji: "🤖", color: "#6366f1", x: 2, y: 2, status: "working", machine: "Mac Studio 1" },
  { id: "code-ninja", name: "Code Ninja", emoji: "👨‍💻", color: "#8b5cf6", x: 5, y: 2, status: "working", machine: "Mac Studio 1" },
  { id: "biz-strategist", name: "Biz", emoji: "📊", color: "#f59e0b", x: 8, y: 2, status: "working", machine: "Mac Studio 2" },
  { id: "growth-hacker", name: "Growth", emoji: "📈", color: "#ec4899", x: 11, y: 2, status: "working", machine: "Mac Studio 2" },
  { id: "gustave", name: "Gustave", emoji: "👨🏿‍💼", color: "#22c55e", x: 2, y: 6, status: "working", machine: "Mac Studio 1" },
  { id: "health-coach", name: "Health", emoji: "💪", color: "#ef4444", x: 14, y: 5, status: "idle" },
];

// Office layout
const furniture = [
  // Mac Studio 1 - Left side
  { x: 1, y: 1, w: 4, h: 3, type: "desk-cluster", label: "Mac Studio 1", color: "#2a2a3e" },
  // Mac Studio 2 - Right side  
  { x: 7, y: 1, w: 4, h: 3, type: "desk-cluster", label: "Mac Studio 2", color: "#2a2a3e" },
  // Water cooler area
  { x: 13, y: 3, w: 2, h: 2, type: "watercooler", label: "Watercooler", color: "#3b82f6" },
  // Meeting area
  { x: 6, y: 6, w: 4, h: 3, type: "meeting", label: "Meeting Area", color: "#1a1a2e" },
  // Plants
  { x: 0, y: 0, w: 1, h: 1, type: "plant", label: "", color: "#22c55e" },
  { x: 15, y: 0, w: 1, h: 1, type: "plant", label: "", color: "#22c55e" },
  { x: 0, y: 9, w: 1, h: 1, type: "plant", label: "", color: "#22c55e" },
  { x: 15, y: 9, w: 1, h: 1, type: "plant", label: "", color: "#22c55e" },
];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState<"normal" | "gather" | "meeting" | "watercooler">("normal");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // Agent movement animation
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.targetX !== undefined && agent.targetY !== undefined) {
            const dx = agent.targetX - agent.x;
            const dy = agent.targetY - agent.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.5) {
              return { ...agent, x: agent.targetX, y: agent.targetY, targetX: undefined, targetY: undefined };
            }
            
            const speed = 0.3;
            return {
              ...agent,
              x: agent.x + (dx / dist) * speed,
              y: agent.y + (dy / dist) * speed,
            };
          }
          return agent;
        })
      );
    }, 50);
    return () => clearInterval(moveInterval);
  }, []);

  async function fetchActivity() {
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setActivity(data.activity?.slice(0, 8) || []);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setLoading(false);
    }
  }

  const moveAgent = useCallback((agentId: string, targetX: number, targetY: number, status?: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, targetX, targetY, status: (status as any) || a.status }
          : a
      )
    );
  }, []);

  const handleGather = () => {
    setDemoMode("gather");
    // Move all agents to center
    agents.forEach((agent, i) => {
      setTimeout(() => {
        moveAgent(agent.id, 7 + (i % 3), 4 + Math.floor(i / 3), "idle");
      }, i * 200);
    });
    logActivity("Optimus", "Called all agents to gather");
  };

  const handleMeeting = () => {
    setDemoMode("meeting");
    // Move agents to meeting area
    agents.forEach((agent, i) => {
      setTimeout(() => {
        moveAgent(agent.id, 6 + (i % 4), 6 + Math.floor(i / 4), "meeting");
      }, i * 200);
    });
    logActivity("Optimus", "Started team meeting");
  };

  const handleWatercooler = () => {
    setDemoMode("watercooler");
    // Move agents near watercooler
    agents.forEach((agent, i) => {
      setTimeout(() => {
        moveAgent(agent.id, 12 + (i % 3), 2 + Math.floor(i / 3), "break");
      }, i * 200);
    });
    logActivity("Optimus", "Watercooler chat initiated");
  };

  const handleReset = () => {
    setDemoMode("normal");
    // Return agents to their desks
    const homePositions = [
      { x: 2, y: 2 }, { x: 5, y: 2 }, { x: 8, y: 2 },
      { x: 11, y: 2 }, { x: 2, y: 6 }, { x: 14, y: 5 }
    ];
    agents.forEach((agent, i) => {
      const home = homePositions[i] || { x: 2, y: 2 };
      moveAgent(agent.id, home.x, home.y, "working");
    });
    logActivity("Optimus", "Agents returned to workstations");
  };

  const logActivity = async (agent: string, action: string) => {
    try {
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, action }),
      });
      fetchActivity();
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working": return "💻";
      case "meeting": return "🗣️";
      case "break": return "☕";
      case "idle": return "💤";
      default: return "💻";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>The Office</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {agents.length} agents • {agents.filter(a => a.status === "working").length} working
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: "var(--bg-card)", color: "var(--success)" }}
          >
            <Zap size={12} />
            Live
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <span className="text-xs font-medium mr-2" style={{ color: "var(--text-muted)" }}>Demo Controls:</span>
        <button
          onClick={handleGather}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            demoMode === "gather" ? "bg-blue-600 text-white" : ""
          }`}
          style={demoMode !== "gather" ? { background: "var(--bg-tertiary)", color: "var(--text-primary)" } : {}}
        >
          <Users size={12} />
          Gather
        </button>
        <button
          onClick={handleMeeting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            demoMode === "meeting" ? "bg-purple-600 text-white" : ""
          }`}
          style={demoMode !== "meeting" ? { background: "var(--bg-tertiary)", color: "var(--text-primary)" } : {}}
        >
          <Presentation size={12} />
          Run Meeting
        </button>
        <button
          onClick={handleWatercooler}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            demoMode === "watercooler" ? "bg-cyan-600 text-white" : ""
          }`}
          style={demoMode !== "watercooler" ? { background: "var(--bg-tertiary)", color: "var(--text-primary)" } : {}}
        >
          <Coffee size={12} />
          Watercooler
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-auto"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
        >
          <Home size={12} />
          Reset
        </button>
      </div>

      {/* Office Grid */}
      <div
        className="rounded-xl border overflow-hidden relative mx-auto"
        style={{
          background: "linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%)",
          borderColor: "var(--border)",
          width: GRID_W * CELL + 2,
          height: GRID_H * CELL + 2,
        }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.03 }}>
          {Array.from({ length: GRID_W + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={GRID_H * CELL} stroke="white" strokeWidth={0.5} />
          ))}
          {Array.from({ length: GRID_H + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * CELL} x2={GRID_W * CELL} y2={i * CELL} stroke="white" strokeWidth={0.5} />
          ))}
        </svg>

        {/* Furniture */}
        {furniture.map((f, i) => (
          <div
            key={i}
            className="absolute rounded-lg flex flex-col items-center justify-center text-[9px] pointer-events-none"
            style={{
              left: f.x * CELL + 2,
              top: f.y * CELL + 2,
              width: f.w * CELL - 4,
              height: f.h * CELL - 4,
              background: `${f.color}40`,
              border: `1px solid ${f.color}60`,
              color: "#888",
            }}
          >
            {f.type === "watercooler" && <span className="text-lg">🚰</span>}
            {f.type === "plant" && <span className="text-lg">🌿</span>}
            {f.type === "meeting" && <span className="text-lg">🗂️</span>}
            {f.label && <span className="mt-1 font-medium">{f.label}</span>}
          </div>
        ))}

        {/* Agents */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            className="absolute flex flex-col items-center cursor-pointer transition-all duration-75"
            style={{
              left: agent.x * CELL,
              top: agent.y * CELL,
              width: CELL,
              height: CELL,
              transform: selectedAgent === agent.id ? "scale(1.2)" : "scale(1)",
              zIndex: selectedAgent === agent.id ? 10 : 1,
            }}
          >
            <div className="text-2xl filter drop-shadow-lg">{agent.emoji}</div>
            <div
              className="absolute -bottom-1 px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap"
              style={{
                background: agent.color,
                color: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {agent.name}
            </div>
            <div className="absolute -top-1 -right-1 text-xs">
              {getStatusIcon(agent.status)}
            </div>
            {selectedAgent === agent.id && agent.machine && (
              <div
                className="absolute -top-6 px-2 py-0.5 rounded text-[8px] whitespace-nowrap"
                style={{ background: "#333", color: "#aaa" }}
              >
                {agent.machine}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Agent Status Bar */}
      <div className="grid grid-cols-6 gap-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            className="rounded-xl p-2 border cursor-pointer transition-colors hover:border-opacity-50"
            style={{
              background: "var(--bg-card)",
              borderColor: selectedAgent === agent.id ? agent.color : "var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{agent.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {agent.name}
                </div>
                <div className="text-[9px] capitalize truncate" style={{ color: agent.status === "working" ? "#22c55e" : "var(--text-muted)" }}>
                  {agent.status}
                </div>
              </div>
            </div>
            {agent.machine && (
              <div className="text-[8px] mt-1 truncate" style={{ color: "var(--text-muted)" }}>
                {agent.machine}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          <Zap size={14} className="inline mr-1" style={{ color: "var(--warning)" }} />
          Live Activity
        </h3>
        {loading ? (
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Loading...</div>
        ) : activity.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  {agents.find(a => a.name === item.agent)?.emoji || item.agent[0]}
                </div>
                <div className="flex-1">
                  <span style={{ color: "var(--text-primary)" }}>{item.agent}</span>
                  <span style={{ color: "var(--text-muted)" }}> — {item.action}</span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatTimestamp(item.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
