"use client";

import { useEffect, useState } from "react";
import { Brain, Search, Star, Calendar, Loader2 } from "lucide-react";

interface MemoryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  size: string;
  wordCount: number;
}

interface LongTermMemory {
  title: string;
  wordCount: number;
  updatedAgo: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [longTermMemory, setLongTermMemory] = useState<LongTermMemory>({
    title: "Long-Term Memory",
    wordCount: 0,
    updatedAgo: "not loaded",
  });

  useEffect(() => {
    fetchMemories();
    fetchLongTermMemory();
  }, []);

  async function fetchMemories() {
    try {
      const res = await fetch("/api/memory");
      if (res.ok) {
        const data = await res.json();
        const memoriesData = data.memories || [];
        setMemories(memoriesData);
        if (memoriesData.length > 0) {
          setSelectedMemory(memoriesData[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLongTermMemory() {
    try {
      const res = await fetch("/api/docs");
      if (res.ok) {
        const data = await res.json();
        const memoryDoc = data.docs?.find((d: any) => d.filename === "MEMORY.md");
        if (memoryDoc) {
          setLongTermMemory({
            title: "Long-Term Memory",
            wordCount: memoryDoc.wordCount,
            updatedAgo: memoryDoc.createdAt,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch long-term memory:", error);
    }
  }

  const filteredMemories = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase())
  );

  // Group by month
  const grouped: Record<string, MemoryEntry[]> = {};
  filteredMemories.forEach((m) => {
    const monthLabel = new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!grouped[monthLabel]) grouped[monthLabel] = [];
    grouped[monthLabel].push(m);
  });

  return (
    <div className="h-[calc(100vh-3rem)] flex">
      {/* Left Panel - Memory List */}
      <div className="w-80 shrink-0 border-r flex flex-col" style={{ borderColor: "var(--border)" }}>
        {/* Search */}
        <div className="p-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)" }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search memory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Long-term Memory */}
        <div className="px-3 mb-2">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: "var(--bg-card)" }}
          >
            <Brain size={16} style={{ color: "var(--accent)" }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                {longTermMemory.title} <Star size={10} style={{ color: "var(--warning)" }} />
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {longTermMemory.wordCount} words • Updated {longTermMemory.updatedAgo}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Journal */}
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <Calendar size={12} />
            <span>DAILY JOURNAL</span>
            <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
              {loading ? "—" : memories.length} entries
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : (
            Object.entries(grouped).map(([month, monthMemories]) => (
              <div key={month}>
                <div className="text-[10px] font-medium mb-1.5 px-1" style={{ color: "var(--text-muted)" }}>
                  {month} ({monthMemories.length})
                </div>
                <div className="space-y-1">
                  {monthMemories.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemory(m)}
                      className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                      style={{
                        background: selectedMemory?.id === m.id ? "var(--bg-tertiary)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="text-[10px] mt-0.5 ml-5" style={{ color: "var(--text-muted)" }}>
                        {m.size} • {m.wordCount} words
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
          {!loading && memories.length === 0 && (
            <div className="text-center py-4 text-xs" style={{ color: "var(--text-muted)" }}>
              No memories yet
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Memory Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedMemory ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {selectedMemory.date} — {selectedMemory.title.split("—")[1]?.trim() || selectedMemory.title}
                </h1>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {new Date(selectedMemory.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  • {selectedMemory.size} • {selectedMemory.wordCount} words
                </p>
              </div>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {selectedMemory.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain size={32} style={{ color: "var(--text-muted)" }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {loading ? "Loading memories..." : "Select a memory to view"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
