"use client";

import { useEffect, useState } from "react";
import { Radar, Activity, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  source: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function RadarPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "1", title: "Memory Usage High", severity: "warning", source: "System Monitor", message: "Memory usage at 2.4GB, approaching 2GB threshold", timestamp: "2026-03-05T00:00:00Z", acknowledged: false },
    { id: "2", title: "Agent Spawned", severity: "info", source: "Agent System", message: "Code Ninja agent session started successfully", timestamp: "2026-03-04T23:30:00Z", acknowledged: true },
    { id: "3", title: "Task Completed", severity: "info", source: "Task System", message: "Mission Control deployment completed", timestamp: "2026-03-04T23:00:00Z", acknowledged: true },
  ]);
  const [loading, setLoading] = useState(false);

  const severityColors = {
    info: "#3b82f6",
    warning: "#f59e0b",
    critical: "#ef4444",
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radar size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Radar</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{unacknowledgedCount} active alerts</p>
          </div>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-3xl font-bold" style={{ color: "#3b82f6" }}>{alerts.filter((a) => a.severity === "info").length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Info</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-3xl font-bold" style={{ color: "#f59e0b" }}>{alerts.filter((a) => a.severity === "warning").length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Warnings</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-3xl font-bold" style={{ color: "#ef4444" }}>{alerts.filter((a) => a.severity === "critical").length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Critical</div>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{
                background: alert.acknowledged ? "var(--bg-card)" : `${severityColors[alert.severity]}10`,
                borderColor: alert.acknowledged ? "var(--border)" : severityColors[alert.severity],
                opacity: alert.acknowledged ? 0.7 : 1,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: severityColors[alert.severity] + "20" }}
              >
                {alert.severity === "info" && <Activity size={20} style={{ color: severityColors.info }} />}
                {alert.severity === "warning" && <AlertTriangle size={20} style={{ color: severityColors.warning }} />}
                {alert.severity === "critical" && <AlertTriangle size={20} style={{ color: severityColors.critical }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{alert.title}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                    style={{ background: severityColors[alert.severity] + "20", color: severityColors[alert.severity] }}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{alert.message}</p>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{alert.source}</span>
                  <span>•</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                >
                  <CheckCircle size={12} />
                  Ack
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
