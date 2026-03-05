"use client"

import { useState } from "react";
import { Search, FileText, FolderOpen, MoreVertical, Plus, ChevronRight, Hash } from "lucide-react";

export default function DocsPage() {
  const [activeCategory, setActiveCategory] = useState("Internal Tools");

  const categories = [
    { id: "Getting Started", count: 3 },
    { id: "Internal Tools", count: 12 },
    { id: "Client Projects", count: 8 },
    { id: "SOPs", count: 24 },
  ];

  const docs = [
    {
      id: 1,
      name: "Code Agent - Master Prompt",
      type: "Markdown",
      updatedAt: "2 hours ago",
      author: "Scout"
    },
    {
      id: 2,
      name: "Project Organization Structure",
      type: "Markdown",
      updatedAt: "1 day ago",
      author: "Henry"
    },
    {
      id: 3,
      name: "Agent API Endpoints",
      type: "PDF",
      updatedAt: "3 days ago",
      author: "Charlie"
    },
    {
      id: 4,
      name: "Deployment Checklist",
      type: "Markdown",
      updatedAt: "1 week ago",
      author: "Ralph"
    }
  ];

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Documentation</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Knowledge base, SOPs, and project files centralized for agents.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 bg-indigo-600">
          <Plus size={16} /> Create Doc
        </button>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* Left Sidebar - Categories */}
        <div className="w-64 shrink-0 flex flex-col">
          <div className="mb-6 border border-zinc-800 bg-[#16161f] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id
                      ? "bg-indigo-500/10 text-indigo-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash size={14} className={activeCategory === cat.id ? "text-indigo-400" : "text-zinc-500"} />
                    {cat.id}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-800 text-zinc-500"
                    }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#16161f] rounded-xl p-4 flex-1">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Recent Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["prompting", "architecture", "setup", "planning", "cli", "onboarding"].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800/80 text-zinc-400 text-[10px] rounded-md border border-zinc-700/50 hover:bg-zinc-700 cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area - File Explorer */}
        <div className="flex-1 flex flex-col bg-[#16161f] rounded-xl border border-zinc-800 overflow-hidden">
          {/* Top Bar with Search */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111118]">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="hover:text-zinc-200 cursor-pointer transition-colors">Categories</span>
              <ChevronRight size={14} className="text-zinc-600" />
              <span className="text-zinc-200 font-medium">{activeCategory}</span>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={`Search in ${activeCategory}...`}
                className="w-64 bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800 bg-[#16161f] text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Last Updated</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800/50 items-center hover:bg-[#1a1a24] transition-colors cursor-pointer group"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${doc.type === 'PDF' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {doc.type === 'PDF' ? <FileText size={16} /> : <FileText size={16} />}
                  </div>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                    {doc.name}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] rounded-md">
                    {doc.type}
                  </span>
                </div>
                <div className="col-span-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">{doc.updatedAt}</span>
                    <span className="text-xs text-zinc-500">by</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50">
                      <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">
                        {doc.author.charAt(0)}
                      </div>
                      <span className="text-xs text-zinc-300 pr-1">{doc.author}</span>
                    </div>
                  </div>
                  <button className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
