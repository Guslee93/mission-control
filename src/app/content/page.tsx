"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Calendar, CheckCircle, Clock, AlertCircle, Loader2, Filter } from "lucide-react";

type ContentType = "blog" | "social" | "article" | "video" | "newsletter";

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: "draft" | "in-review" | "scheduled" | "published";
  assignee: string;
  dueDate: string;
  platform: string;
  content?: string;
  scheduledFor?: string;
  createdAt: string;
}

const contentTypes = [
  { id: "blog", label: "Blog Post", color: "#3b82f6" },
  { id: "social", label: "Social Media", color: "#ec4899" },
  { id: "article", label: "Article", color: "#8b5cf6" },
  { id: "video", label: "Video", color: "#ef4444" },
  { id: "newsletter", label: "Newsletter", color: "#f59e0b" },
];

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  "in-review": "#f59e0b",
  scheduled: "#3b82f6",
  published: "#22c55e",
};

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ContentType>("all");
  const [showNew, setShowNew] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", type: "blog" as ContentType, platform: "", dueDate: "" });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addContent() {
    if (!newItem.title.trim()) return;
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newItem, status: "draft", assignee: "Growth Hacker" }),
      });
      if (res.ok) {
        const data = await res.json();
        setContent([...content, data.item]);
        setNewItem({ title: "", type: "blog", platform: "", dueDate: "" });
        setShowNew(false);
      }
    } catch (error) {
      console.error("Failed to create content:", error);
    }
  }

  async function updateStatus(id: string, status: ContentItem["status"]) {
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setContent(content.map((c) => (c.id === id ? { ...c, status } : c)));
      }
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  }

  const filteredContent = filter === "all" ? content : content.filter((c) => c.type === filter);
  const draftCount = content.filter((c) => c.status === "draft").length;
  const scheduledCount = content.filter((c) => c.status === "scheduled").length;
  const publishedCount = content.filter((c) => c.status === "published").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Content</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {content.length} pieces • {draftCount} drafts • {scheduledCount} scheduled • {publishedCount} published
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> New Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {contentTypes.map((type) => {
          const count = content.filter((c) => c.type === type.id).length;
          return (
            <button
              key={type.id}
              onClick={() => setFilter(filter === type.id ? "all" : type.id as ContentType)}
              className="rounded-xl p-4 border transition-colors text-left"
              style={{
                background: filter === type.id ? `${type.color}20` : "var(--bg-card)",
                borderColor: filter === type.id ? type.color : "var(--border)",
              }}
            >
              <div className="text-2xl font-bold" style={{ color: type.color }}>{count}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{type.label}</div>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ background: contentTypes.find((t) => t.id === item.type)?.color + "20" }}
              >
                {item.type === "blog" && "📝"}
                {item.type === "social" && "📱"}
                {item.type === "article" && "📄"}
                {item.type === "video" && "🎥"}
                {item.type === "newsletter" && "📧"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.title}</div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{item.platform}</span>
                  <span>•</span>
                  <span>Due {item.dueDate}</span>
                  <span>•</span>
                  <span>{item.assignee}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-medium capitalize"
                  style={{ background: statusColors[item.status] + "20", color: statusColors[item.status] }}
                >
                  {item.status.replace("-", " ")}
                </span>
                {item.status === "draft" && (
                  <button
                    onClick={() => updateStatus(item.id, "in-review")}
                    className="px-2 py-1 rounded text-xs text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Submit
                  </button>
                )}
                {item.status === "in-review" && (
                  <button
                    onClick={() => updateStatus(item.id, "scheduled")}
                    className="px-2 py-1 rounded text-xs text-white"
                    style={{ background: "#22c55e" }}
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredContent.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              No content items found
            </div>
          )}
        </div>
      )}

      {/* New Content Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>New Content</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  {contentTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Platform"
                  value={newItem.platform}
                  onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <input
                type="date"
                value={newItem.dueDate}
                onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={addContent} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--accent)" }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
