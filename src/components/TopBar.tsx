"use client";

import { Search, Pause, Eye, RefreshCw } from "lucide-react";

export default function TopBar() {
    return (
        <div className="h-16 flex items-center justify-end px-6 sticky top-0 bg-transparent z-10 w-full backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border"
                    style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                        color: "var(--text-muted)"
                    }}
                >
                    <Search size={14} />
                    <span className="w-24">Search</span>
                    <span
                        className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                    >
                        ⌘K
                    </span>
                </div>

                {/* Divider */}
                <div className="h-4 w-px bg-[var(--border)] mx-1" />

                {/* Pause Button */}
                <button
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <Pause size={14} />
                    <span>Pause</span>
                </button>

                {/* Ping Henry Button */}
                <button
                    className="text-sm font-medium transition-colors hover:text-white"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Ping Henry
                </button>

                {/* Eye Icon */}
                <button
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-card)] hover:text-white"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <Eye size={16} />
                </button>

                {/* Refresh Icon */}
                <button
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-card)] hover:text-white"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <RefreshCw size={14} />
                </button>
            </div>
        </div>
    );
}
