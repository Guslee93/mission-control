"use client";

import { useEffect, useState } from "react";
import { FileText, Search, SortAsc, Loader2 } from "lucide-react";

interface Doc {
  id: string;
  filename: string;
  category: string;
  content: string;
  size: string;
  wordCount: number;
  createdAt: string;
}

const categories = ["All", "Config", "Docs", "Journal", "Notes", "Other"];
const fileTypes = [".md", ".html", ".json", ".txt"];

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    try {
      const res = await fetch("/api/docs");
      if (res.ok) {
        const data = await res.json();
        const docsData = data.docs || [];
        setDocs(docsData);
        if (docsData.length > 0) {
          setSelectedDoc(docsData[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch docs:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.filename.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-[calc(100vh-3rem)] flex">
      {/* Left Panel */}
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
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Category Tags */}
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-2.5 py-1 rounded text-[10px] font-medium transition-colors"
              style={{
                background: selectedCategory === cat ? "var(--accent)" : "var(--bg-tertiary)",
                color: selectedCategory === cat ? "white" : "var(--text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* File Type Filter */}
        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
          {fileTypes.map((ft) => (
            <span
              key={ft}
              className="px-2 py-0.5 rounded text-[10px]"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
            >
              {ft}
            </span>
          ))}
          <button className="ml-auto" style={{ color: "var(--text-muted)" }}>
            <SortAsc size={14} />
          </button>
        </div>

        {/* Doc List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:opacity-80"
                style={{
                  background: selectedDoc?.id === doc.id ? "var(--bg-tertiary)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: "var(--accent)" }} />
                  <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {doc.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-5">
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px]"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                  >
                    {doc.category}
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {doc.wordCount} words
                  </span>
                </div>
              </button>
            ))
          )}
          {!loading && filteredDocs.length === 0 && (
            <div className="text-center py-4 text-xs" style={{ color: "var(--text-muted)" }}>
              No documents found
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedDoc ? (
          <div>
            <div className="mb-6">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {selectedDoc.filename}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedDoc.size}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedDoc.wordCount} words</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px]"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  {selectedDoc.category}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Updated {selectedDoc.createdAt}</span>
              </div>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
              {selectedDoc.content}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText size={32} style={{ color: "var(--text-muted)" }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {loading ? "Loading documents..." : "Select a document to view"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
