"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Bell, Shield, Database, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface SystemStatus {
  id: string;
  metric: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  threshold: string;
  lastCheck: string;
}

export default function SystemPage() {
  const [statuses, setStatuses] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/monitoring");
      if (res.ok) {
        const data = await res.json();
        setStatuses(data.statuses || []);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    healthy: "#22c55e",
    warning: "#f59e0b",
    critical: "#ef4444",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings size={24} style={{ color: "var(--accent)" }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>System</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Configuration and system health</p>
        </div>
      </div>

      {/* Status Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="rounded-xl p-4 border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{status.metric}</span>
                {status.status === "healthy" && <CheckCircle size={16} style={{ color: statusColors.healthy }} />}
                {status.status === "warning" && <AlertTriangle size={16} style={{ color: statusColors.warning }} />}
                {status.status === "critical" && <XCircle size={16} style={{ color: statusColors.critical }} />}
              </div>
              <div className="text-2xl font-bold" style={{ color: statusColors[status.status] }}>{status.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Target: {status.threshold}</div>
              <div className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Last check: {new Date(status.lastCheck).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Sections */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} style={{ color: "var(--accent)" }} />
            <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>API Keys</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>ElevenLabs</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>Connected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Moonshot AI</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>Connected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>OpenRouter</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#6b728020", color: "#6b7280" }}>Not configured</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} style={{ color: "var(--accent)" }} />
            <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>Notifications</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Daily Briefing</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>7:00 AM</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Task Reminders</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>Enabled</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Agent Alerts</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>Enabled</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} style={{ color: "var(--accent)" }} />
            <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>Security</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Two-Factor Auth</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#6b728020", color: "#6b7280" }}>Disabled</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Session Timeout</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>30 min</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} style={{ color: "var(--accent)" }} />
            <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>Data</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Auto-Backup</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>Daily</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Retention</span>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#22c55e20", color: "#22c55e" }}>90 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
