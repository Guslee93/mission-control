"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Play, Pause, Circle, Loader2, Zap } from "lucide-react";

interface Agent {
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

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [spawning, setSpawning] = useState<string | null>(null);

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
    setSpawning(agentId);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, action: "spawn" }),
      });
      if (res.ok) {
        await fetchAgents();
      }
    } catch (error) {
      console.error("Failed to spawn agent:", error);
    } finally {
      setSpawning(null);
    }
  }

  const aiAgents = agents.filter(a => a.type === "agent");
  const humans = agents.filter(a => a.type === "human");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">AI Agent Team</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          {aiAgents.length} specialized agents ready to execute. Click "Spawn" to activate any agent for a task.
        </p>
      </div>

      {/* Humans */}
      {humans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-300 flex items-center gap-2">
            <Users className="w-5 h-5" /> Commander
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {humans.map(human => (
              <div key={human.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: human.color }}
                  >
                    {human.initial}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{human.name}</h3>
                    <p className="text-sm text-zinc-400">{human.role}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Agents Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-300 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> AI Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiAgents.map(agent => (
            <div 
              key={agent.id} 
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{agent.name}</h3>
                  <p className="text-sm text-zinc-400">{agent.role}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    agent.status === 'online' ? 'bg-green-500 animate-pulse' : 
                    agent.status === 'standby' ? 'bg-yellow-500' : 'bg-zinc-600'
                  }`} />
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-500 line-clamp-2">{agent.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-600">{agent.model || 'moonshot/kimi-k2.5'}</span>
                <button
                  onClick={() => spawnAgent(agent.id)}
                  disabled={spawning === agent.id || agent.status === 'online'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    agent.status === 'online' 
                      ? 'bg-green-500/20 text-green-400 cursor-default' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                  }`}
                >
                  {spawning === agent.id ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Spawning...</>
                  ) : agent.status === 'online' ? (
                    <><Circle className="w-3 h-3 fill-current" /> Active</>
                  ) : (
                    <><Play className="w-3 h-3" /> Spawn</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Agent CTA */}
      <div className="flex justify-center pt-8">
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          <span>Create New Agent</span>
        </button>
      </div>
    </div>
  );
}
