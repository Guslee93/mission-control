"use client";

import { useEffect, useState } from "react";
import { Bot, Play, Pause, Terminal, MessageSquare, Activity, Loader2 } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  initial: string;
  role: string;
  color: string;
  status: "online" | "standby" | "offline";
  type: "human" | "agent";
  model?: string;
  lastActive?: string;
  tasksCompleted: number;
  messages: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  }

  async function spawnAgent(agentId: string) {
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, action: "spawn" }),
      });
      if (res.ok) {
        setAgents(agents.map((a) => (a.id === agentId ? { ...a, status: "online" } : a)));
      }
    } catch (error) {
      console.error("Failed to spawn agent:", error);
    }
  }

  const onlineCount = agents.filter((a) => a.status === "online").length;
  const agentCount = agents.filter((a) => a.type === "agent").length;

  return (
    <div className="h-[calc(100vh-3rem)] flex">
      {/* Agent List */}
      <div className="w-80 shrink-0 border-r flex flex-col" style={{ borderColor: "var(--border)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Bot size={18} style={{ color: "var(--accent)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Agents</h2>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {onlineCount} online • {agentCount} total
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="w-full p-3 border-b text-left transition-colors flex items-center gap-3"
                style={{
                  background: selectedAgent?.id === agent.id ? "var(--bg-tertiary)" : "transparent",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: agent.color }}
                >
                  {agent.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {agent.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {agent.role}
                  </div>
                </div>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: agent.status === "online" ? "#22c55e" : agent.status === "standby" ? "#f59e0b" : "#6b7280",
                  }}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Agent Detail */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <>
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: selectedAgent.color }}
                  >
                    {selectedAgent.initial}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{selectedAgent.name}</h2>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{selectedAgent.role}</p>
                    {selectedAgent.model && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Model: {selectedAgent.model}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedAgent.status === "standby" && selectedAgent.type === "agent" && (
                    <button
                      onClick={() => spawnAgent(selectedAgent.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      <Play size={14} />
                      Spawn
                    </button>
                  )}
                  {selectedAgent.status === "online" && (
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                      <MessageSquare size={14} />
                      Message
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="rounded-lg p-3" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{selectedAgent.tasksCompleted}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Tasks Completed</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{selectedAgent.messages}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Messages</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="text-2xl font-bold capitalize" style={{ color: selectedAgent.status === "online" ? "#22c55e" : "var(--text-muted)" }}>
                    {selectedAgent.status}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>Status</div>
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div className="flex-1 p-6">
              <div className="rounded-xl border h-full flex flex-col" style={{ background: "#0d0d14", borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <Terminal size={14} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Agent Terminal</span>
                </div>
                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto" style={{ color: "var(--text-secondary)" }}>
                  <div style={{ color: "#22c55e" }}>$ initializing agent session...</div>
                  <div style={{ color: "var(--text-muted)" }}>Agent: {selectedAgent.name}</div>
                  <div style={{ color: "var(--text-muted)" }}>Status: {selectedAgent.status}</div>
                  <div style={{ color: "var(--text-muted)" }}>Ready for commands.</div>
                  <div className="mt-4 flex items-center gap-2">
                    <span style={{ color: "#22c55e" }}>➜</span>
                    <input
                      type="text"
                      placeholder="Type command..."
                      className="bg-transparent outline-none flex-1"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot size={48} style={{ color: "var(--text-muted)" }} className="mx-auto mb-4" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select an agent to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
