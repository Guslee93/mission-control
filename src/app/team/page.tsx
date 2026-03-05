"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Play, Pause, Circle, Loader2, Zap } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  initial: string;
  role: string;
  description: string;
  tags: string[];
  color: string;
  type: "human" | "agent";
  status: "online" | "standby" | "offline";
  device?: string;
  specialties?: string[];
  model?: string;
}

const mission = "Build a sharp, disciplined SaaS business — leveraging AI agents, systems, and strategy to compound health, wealth, craft, and network.";

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [spawning, setSpawning] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.agents || []);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setLoading(false);
    }
  }

  async function spawnAgent(agentId: string) {
    setSpawning(agentId);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, action: "spawn" }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state
        setTeam(team.map((t) => 
          t.id === agentId ? { ...t, status: "online" } : t
        ));
      } else {
        const error = await res.json();
        console.error("Failed to spawn agent:", error);
        alert("Failed to spawn agent. Check console for details.");
      }
    } catch (error) {
      console.error("Error spawning agent:", error);
      alert("Error spawning agent. Check console for details.");
    } finally {
      setSpawning(null);
    }
  }

  const onlineCount = team.filter((t) => t.status === "online").length;
  const standbyCount = team.filter((t) => t.status === "standby").length;
  const humanCount = team.filter((t) => t.type === "human").length;
  const agentCount = team.filter((t) => t.type === "agent").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Circle size={10} className="fill-current" style={{ color: "#22c55e" }} />;
      case "standby":
        return <Pause size={10} style={{ color: "#f59e0b" }} />;
      default:
        return <Circle size={10} style={{ color: "#71717a" }} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "standby":
        return "Standby";
      default:
        return "Offline";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Mission Statement */}
      <div
        className="rounded-xl p-6 text-center border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          &ldquo;{mission}&rdquo;
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Your SaaS Team</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {loading ? "—" : `${team.length} members`} • {loading ? "—" : `${humanCount} human`} • {loading ? "—" : `${agentCount} AI agents`} • {loading ? "—" : `${onlineCount} online`}
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white opacity-50 cursor-not-allowed"
          style={{ background: "var(--accent)" }}
          title="Coming soon"
        >
          <Plus size={16} /> Hire Agent
        </button>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="rounded-xl p-6 border transition-colors hover:border-opacity-50"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{ background: member.color }}
                >
                  {member.initial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {member.name}
                    </h3>
                    {member.type === "agent" && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: "#6366f120", color: "#6366f1" }}
                      >
                        AI Agent
                      </span>
                    )}
                    {member.type === "human" && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: "#22c55e20", color: "#22c55e" }}
                      >
                        Human
                      </span>
                    )}
                    {member.device && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px]"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                      >
                        {member.device}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: member.color }}>
                    {member.role}
                  </div>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {member.description}
                  </p>

                  {/* Specialties */}
                  {member.specialties && member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {member.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded text-[10px] capitalize"
                          style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                        >
                          {spec.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {member.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px]"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs" style={{ background: "var(--bg-tertiary)" }}>
                    {getStatusIcon(member.status)}
                    <span style={{ color: member.status === "online" ? "#22c55e" : member.status === "standby" ? "#f59e0b" : "var(--text-muted)" }}>
                      {getStatusText(member.status)}
                    </span>
                  </div>

                  {member.type === "agent" && member.status === "standby" && (
                    <button
                      onClick={() => spawnAgent(member.id)}
                      disabled={spawning === member.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--accent)" }}
                    >
                      {spawning === member.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Play size={12} />
                      )}
                      {spawning === member.id ? "Starting..." : "Spawn"}
                    </button>
                  )}

                  {member.type === "agent" && member.status === "online" && (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      <Zap size={12} style={{ color: "#22c55e" }} />
                      Active
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Guide */}
      <div className="rounded-xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-primary)" }}>
          How to Use Your AI Team
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>Spawn Agents</strong>
            <p className="mt-1">Click &ldquo;Spawn&rdquo; to activate an agent. Each runs as a separate OpenClaw session with specialized context.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>Assign Work</strong>
            <p className="mt-1">Create tasks and assign them to specific agents. They&apos;ll work in their own sessions and report back.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>Collaborate</strong>
            <p className="mt-1">Agents can message each other. Code Ninja can ask Design Guru for UI specs, etc.</p>
          </div>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>Review Output</strong>
            <p className="mt-1">Agents work in their own directories. Check their work before deploying to production.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
