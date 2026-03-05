"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, Users, Coffee, Presentation, Home, Plus } from "lucide-react";

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
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Demo Controls Toolbar */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-zinc-800 bg-[#16161f] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="text-sm font-medium text-white mr-4">Demo Controls</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-emerald-400 bg-[#0f291e] border border-emerald-900 transition-colors hover:bg-emerald-950"
          >
            <Home size={14} /> All Working
          </button>
          <button
            onClick={handleGather}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-blue-400 bg-[#0f1f3a] border border-blue-900 transition-colors hover:bg-blue-950"
          >
            <Users size={14} /> Gather
          </button>
          <button
            onClick={handleMeeting}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-orange-400 bg-[#2b1b0b] border border-orange-900 transition-colors hover:bg-orange-950"
          >
            <Presentation size={14} /> Run Meeting
          </button>
          <button
            onClick={handleWatercooler}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-cyan-400 bg-[#06282b] border border-cyan-900 transition-colors hover:bg-cyan-950"
          >
            <Coffee size={14} /> Watercooler
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Office Map Pane */}
        <div className="flex-1 flex flex-col bg-[#16161f] rounded-xl border border-zinc-800 overflow-hidden relative shadow-inner">
          {/* Start Chat Button overlay */}
          <div className="absolute top-4 left-4 z-20">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors">
              <Plus size={14} /> Start Chat
            </button>
          </div>

          <div
            className="mx-auto my-auto relative"
            style={{
              width: GRID_W * CELL,
              height: GRID_H * CELL,
            }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 z-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)',
                backgroundSize: `${CELL}px ${CELL}px`
              }}
            />

            {/* Furniture */}
            {furniture.map((f, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center justify-center pointer-events-none z-10"
                style={{
                  left: f.x * CELL,
                  top: f.y * CELL,
                  width: f.w * CELL,
                  height: f.h * CELL,
                }}
              >
                {f.type === "desk-cluster" && (
                  <div className="flex items-center justify-center gap-6">
                    <div className="w-12 h-10 bg-zinc-600 rounded-sm opacity-60"></div>
                    <div className="w-12 h-10 bg-zinc-600 rounded-sm opacity-60"></div>
                  </div>
                )}
                {f.type === "watercooler" && (
                  <div className="w-8 h-12 bg-blue-300 rounded-full opacity-60"></div>
                )}
                {f.type === "plant" && (
                  <div className="w-8 h-10 bg-green-500 rounded-lg opacity-70"></div>
                )}
                {f.type === "meeting" && (
                  <div className="w-24 h-16 bg-zinc-700 rounded-full opacity-60 border-4 border-zinc-600"></div>
                )}
              </div>
            ))}

            {/* Agents */}
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                className="absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-75 z-30"
                style={{
                  left: agent.x * CELL,
                  top: agent.y * CELL,
                  width: CELL,
                  height: CELL,
                  transform: selectedAgent === agent.id ? "scale(1.1)" : "scale(1)",
                }}
              >
                {/* Simplified Agent Sprite */}
                <div style={{ position: 'relative' }}>
                  <div
                    className="w-8 h-8 rounded-sm shadow-md flex items-center justify-center text-sm"
                    style={{ background: agent.color }}
                  >
                    <span className="scale-x-[-1] inline-block">👾</span>
                  </div>
                  <div className="absolute -right-2 top-0 mt-2 mr-2">
                    <div className="w-2 h-2 rounded-full bg-white opacity-40 shadow-sm animate-pulse"></div>
                  </div>
                </div>

                {/* Agent Name Tag */}
                <div className="flex items-center gap-1 mt-1 font-mono text-[10px] text-zinc-300 whitespace-nowrap bg-zinc-900/80 px-1.5 py-0.5 rounded-sm">
                  {agent.name}
                </div>

                {selectedAgent === agent.id && (
                  <div className="absolute -top-6 whitespace-nowrap bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none z-50 animate-bounce">
                    Working on {agent.machine || "Task"}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed - Right Panel */}
        <div className="w-72 shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <span className="text-indigo-400">⚡</span> Live Activity
            </h3>
            <span className="text-xs text-zinc-500">Last hour</span>
          </div>

          <div className="flex-1 bg-[#16161f] border border-zinc-800 rounded-xl p-4 overflow-y-auto">
            {loading ? (
              <div className="text-xs text-zinc-500">Loading...</div>
            ) : activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item, idx) => (
                  <div key={item.id} className="text-sm relative pl-4 border-l border-zinc-800 pb-2">
                    <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1" style={{ background: agents.find(a => a.name === item.agent)?.color || '#6366f1' }}></div>
                    <div className="flex items-center gap-2 mb-1 pl-2">
                      <span className="font-medium text-zinc-300">{item.agent}</span>
                      <span className="text-[10px] text-zinc-500 ml-auto">{formatTimestamp(item.timestamp)}</span>
                    </div>
                    <div className="text-zinc-500 text-xs pl-2 leading-snug">
                      {item.action}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-600 gap-2">
                <span className="text-2xl">📈</span>
                <span className="text-sm">No recent activity</span>
                <span className="text-xs">Events will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
