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

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 pt-8 flex flex-col items-center">
      {/* Top Banner section */}
      <div className="text-center max-w-2xl w-full flex flex-col items-center">
        { /* Top Pill Banner */}
        <div className="inline-block px-8 py-3 rounded-full mb-8 bg-[#0a183d] border border-blue-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <p className="text-blue-300 text-sm font-medium italic">
            &ldquo;An autonomous organization of AI agents that does work for me and produces value 24/7&rdquo;
          </p>
        </div>

        <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Meet the Team</h1>

        <p className="text-zinc-400 text-sm mb-4">
          9 AI agents across 3 machines, each with a real role and a real personality.
        </p>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-xl mx-auto">
          We wanted to see what happens when AI doesn&apos;t just answer questions — but actually runs a
          company. Research markets. Write content. Post on social media. Ship products. All without being told what to do.
        </p>
      </div>

      {/* Organizational Hierarchy */}
      <div className="w-full max-w-2xl space-y-8 relative">

        {/* Henry (Chief of Staff) */}
        <div className="w-full bg-[#111118] border border-indigo-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.05)] relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="flex gap-5">
            <div className="w-16 h-16 rounded-xl bg-[#1e2336] flex items-center justify-center text-3xl shadow-inner shrink-0 relative">
              🦉
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-0.5">Henry</h3>
              <div className="text-zinc-400 text-sm mb-3 font-medium">Chief of Staff</div>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4 max-w-sm">
                Coordinates, delegates, keeps the ship tight. The first point of contact between boss and machine.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Orchestration", "Clarity", "Delegation"].map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 bg-blue-950/40 text-blue-400 text-xs rounded-md border border-blue-900/40">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button className="absolute bottom-6 right-6 text-xs font-semibold text-zinc-600 hover:text-zinc-400 tracking-wider">
            ROLE CARD →
          </button>
        </div>

        {/* Divider / Department label */}
        <div className="flex items-center justify-center gap-4 relative py-2">
          <div className="h-px bg-zinc-800 flex-1"></div>
          <div className="text-xs font-semibold tracking-widest text-zinc-500 uppercase flex items-center gap-2">
            <span>🚩</span> OPERATIONS (Mac Studio 2)
          </div>
          <div className="h-px bg-zinc-800 flex-1"></div>

          {/* Vertical line connecting up to Henry */}
          <div className="absolute top-[-32px] left-1/2 w-px h-[39px] bg-zinc-800 -translate-x-1/2 z-0"></div>
          {/* Vertical line connecting down to grid */}
          <div className="absolute bottom-[-16px] left-1/2 w-px h-[16px] bg-zinc-800 -translate-x-1/2 z-0"></div>
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-2 gap-4">

          {/* Charlie */}
          <div className="bg-[#111118] border border-blue-500/30 rounded-2xl p-6 relative group hover:border-blue-500/50 transition-colors h-full flex flex-col">
            <div className="flex gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#162136] flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                🤖
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-0.5">Charlie</h3>
                <div className="text-zinc-400 text-xs font-medium">Infrastructure Engineer</div>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-5 flex-1">
              Infrastructure and automation specialist.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {["coding", "infrastructure", "automation"].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-950/40 text-blue-400 text-[10px] rounded border border-blue-900/40">
                  {tag}
                </span>
              ))}
            </div>
            <button className="text-xs font-semibold text-zinc-600 hover:text-zinc-400 tracking-wider self-end mt-auto">
              ROLE CARD →
            </button>
          </div>

          {/* Ralph */}
          <div className="bg-[#181410] border border-orange-500/30 rounded-2xl p-6 relative group hover:border-orange-500/50 transition-colors h-full flex flex-col">
            <div className="flex gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#261c14] flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                🔧
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-0.5">Ralph</h3>
                <div className="text-zinc-400 text-xs font-medium">Foreman / QA Manager</div>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-5 flex-1">
              Checks the work, signs off or sends it back. No-nonsense quality control.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {["Quality Assurance", "Monitoring", "Demo Recording"].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-orange-950/40 text-orange-400 text-[10px] rounded border border-orange-900/40">
                  {tag}
                </span>
              ))}
            </div>
            <button className="text-xs font-semibold text-zinc-600 hover:text-zinc-400 tracking-wider self-end mt-auto">
              ROLE CARD →
            </button>
          </div>

        </div>

        {/* Bottom Signal Divider */}
        <div className="flex items-center justify-center pt-16">
          <div className="text-[10px] font-mono tracking-widest text-[#22c55e] flex items-center gap-3">
            <span>↓ INPUT SIGNAL</span>
            <div className="w-32 h-px bg-zinc-800"></div>
            <span className="text-blue-500">OUTPUT ACTION ↓</span>
          </div>
        </div>

      </div>
    </div>
  );
}
