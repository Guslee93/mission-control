"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Star, TrendingUp, Filter } from "lucide-react";

type FeedbackType = "feature" | "bug" | "praise" | "criticism";

interface Feedback {
  id: string;
  type: FeedbackType;
  content: string;
  rating?: number;
  source: string;
  date: string;
  status: "new" | "reviewed" | "actioned" | "closed";
}

const feedbacks: Feedback[] = [
  { id: "1", type: "feature", content: "Would love to see mobile app version of Mission Control", rating: 4, source: "User Survey", date: "2026-03-04", status: "new" },
  { id: "2", type: "praise", content: "The voice briefing feature is incredible! Keep it up.", rating: 5, source: "Telegram", date: "2026-03-04", status: "reviewed" },
  { id: "3", type: "bug", content: "Office page lags when many agents are moving", rating: 3, source: "GitHub", date: "2026-03-03", status: "actioned" },
  { id: "4", type: "criticism", content: "Hard to find settings in current layout", rating: 2, source: "Email", date: "2026-03-02", status: "new" },
];

const typeColors: Record<string, string> = {
  feature: "#3b82f6",
  bug: "#ef4444",
  praise: "#22c55e",
  criticism: "#f59e0b",
};

const statusColors: Record<string, string> = {
  new: "#6b7280",
  reviewed: "#3b82f6",
  actioned: "#22c55e",
  closed: "#6b7280",
};

export default function FeedbackPage() {
  const [filter, setFilter] = useState<"all" | FeedbackType>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const filteredFeedback = filter === "all" ? feedbacks : feedbacks.filter((f) => f.type === filter);
  const avgRating = feedbacks.filter((f) => f.rating).reduce((acc, f) => acc + (f.rating || 0), 0) / feedbacks.filter((f) => f.rating).length;
  const nps = Math.round(((feedbacks.filter((f) => f.rating && f.rating >= 4).length / feedbacks.filter((f) => f.rating).length) - (feedbacks.filter((f) => f.rating && f.rating <= 2).length / feedbacks.filter((f) => f.rating).length)) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Feedback</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{feedbacks.length} responses • NPS: {nps}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1">
            <Star size={16} style={{ color: "#f59e0b" }} />
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{avgRating.toFixed(1)}</span>
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Avg Rating</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>{feedbacks.filter((f) => f.type === "praise").length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Praise</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-2xl font-bold" style={{ color: "#3b82f6" }}>{feedbacks.filter((f) => f.type === "feature").length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Feature Requests</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-2xl font-bold" style={{ color: "#ef4444" }}>{feedbacks.filter((f) => f.type === "bug").length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Bug Reports</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "feature", "bug", "praise", "criticism"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
            style={{
              background: filter === type ? (type === "all" ? "var(--accent)" : typeColors[type]) : "var(--bg-tertiary)",
              color: filter === type ? "white" : "var(--text-secondary)",
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-2">
        {filteredFeedback.map((feedback) => (
          <div
            key={feedback.id}
            onClick={() => setSelectedFeedback(feedback)}
            className="p-4 rounded-xl border cursor-pointer transition-colors hover:border-opacity-50"
            style={{ background: "var(--bg-card)", borderColor: selectedFeedback?.id === feedback.id ? "var(--accent)" : "var(--border)" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {feedback.type === "feature" && "💡"}
                  {feedback.type === "bug" && "🐛"}
                  {feedback.type === "praise" && "👏"}
                  {feedback.type === "criticism" && "💭"}
                </span>
                <div>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{feedback.content}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{feedback.source}</span>
                    <span>•</span>
                    <span>{feedback.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {feedback.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        style={{ color: i < feedback.rating! ? "#f59e0b" : "var(--text-muted)" }}
                        className={i < feedback.rating! ? "fill-current" : ""}
                      />
                    ))}
                  </div>
                )}
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                  style={{ background: statusColors[feedback.status] + "20", color: statusColors[feedback.status] }}
                >
                  {feedback.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
