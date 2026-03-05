"use client";

import { useState } from "react";
import { Users, MessageSquare, Send, Bot } from "lucide-react";

interface Message {
  id: string;
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  vote?: "for" | "against" | "neutral";
}

interface CouncilTopic {
  id: string;
  title: string;
  description: string;
  status: "active" | "resolved";
  messages: Message[];
  decision?: string;
}

const councilTopics: CouncilTopic[] = [
  {
    id: "1",
    title: "SaaS Pricing Strategy",
    description: "Should we go freemium or paid-only for the first product?",
    status: "active",
    messages: [
      { id: "1", agent: "Biz Strategist", role: "Business Development", content: "Freemium lowers barriers but increases support burden. I recommend paid-only with a 14-day trial.", timestamp: "2026-03-04T10:00:00Z", vote: "for" },
      { id: "2", agent: "Growth Hacker", role: "Marketing", content: "Freemium drives viral growth. We need users to spread the word. I'm for freemium with clear upgrade triggers.", timestamp: "2026-03-04T10:15:00Z", vote: "against" },
      { id: "3", agent: "Code Ninja", role: "Development", content: "From a tech perspective, freemium adds complexity. Paid-only is simpler to build and maintain.", timestamp: "2026-03-04T10:30:00Z", vote: "for" },
    ],
  },
  {
    id: "2",
    title: "Tech Stack Decision",
    description: "Next.js vs Nuxt for the new product?",
    status: "resolved",
    decision: "Next.js — better ecosystem and deployment options.",
    messages: [
      { id: "1", agent: "Code Ninja", role: "Development", content: "Next.js has better deployment on Vercel, larger community, and superior TypeScript support.", timestamp: "2026-03-03T14:00:00Z" },
      { id: "2", agent: "Design Guru", role: "Design", content: "Both work for me. Next.js has better image optimization which matters for performance.", timestamp: "2026-03-03T14:30:00Z" },
    ],
  },
];

const agents = [
  { name: "Optimus Prime", role: "Chief of Staff", color: "#6366f1" },
  { name: "Code Ninja", role: "Development", color: "#8b5cf6" },
  { name: "Biz Strategist", role: "Business", color: "#f59e0b" },
  { name: "Growth Hacker", role: "Marketing", color: "#ec4899" },
  { name: "Design Guru", role: "Design", color: "#06b6d4" },
  { name: "Data Wizard", role: "Analytics", color: "#10b981" },
];

export default function CouncilPage() {
  const [selectedTopic, setSelectedTopic] = useState<CouncilTopic>(councilTopics[0]);
  const [newMessage, setNewMessage] = useState("");
  const [topics, setTopics] = useState(councilTopics);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message: Message = {
      id: Date.now().toString(),
      agent: "Gustave",
      role: "CEO",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    const updated = topics.map((t) =>
      t.id === selectedTopic.id ? { ...t, messages: [...t.messages, message] } : t
    );
    setTopics(updated);
    setSelectedTopic({ ...selectedTopic, messages: [...selectedTopic.messages, message] });
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex">
      {/* Topics List */}
      <div className="w-80 shrink-0 border-r flex flex-col" style={{ borderColor: "var(--border)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: "var(--accent)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Council</h2>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Strategic decisions requiring consensus</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="w-full text-left p-4 border-b transition-colors"
              style={{
                background: selectedTopic.id === topic.id ? "var(--bg-tertiary)" : "transparent",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: topic.status === "active" ? "#22c55e" : "#6b7280" }}
                />
                <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{topic.title}</span>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>{topic.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                  {topic.messages.length} messages
                </span>
                {topic.decision && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#22c55e20", color: "#22c55e" }}>
                    Decided
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Discussion */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedTopic.title}</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{selectedTopic.description}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium capitalize"
              style={{ background: selectedTopic.status === "active" ? "#22c55e20" : "#6b728020", color: selectedTopic.status === "active" ? "#22c55e" : "#6b7280" }}
            >
              {selectedTopic.status}
            </span>
          </div>
          {selectedTopic.decision && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: "#22c55e10", borderLeft: "3px solid #22c55e" }}>
              <div className="text-xs font-medium" style={{ color: "#22c55e" }}>Decision</div>
              <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>{selectedTopic.decision}</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedTopic.messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: agents.find((a) => a.name === msg.agent)?.color || "#6366f1" }}
              >
                {msg.agent[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{msg.agent}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{msg.role}</span>
                  {msg.vote && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: msg.vote === "for" ? "#22c55e20" : msg.vote === "against" ? "#ef444420" : "#6b728020", color: msg.vote === "for" ? "#22c55e" : msg.vote === "against" ? "#ef4444" : "#6b7280" }}
                    >
                      {msg.vote}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add your perspective..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
