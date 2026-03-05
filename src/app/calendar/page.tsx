"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Zap, Loader2 } from "lucide-react";

interface ScheduledTask {
  id: string;
  title: string;
  time: string;
  color: string;
  recurring: boolean;
  type: "cron" | "heartbeat" | "manual";
}

interface AlwaysRunning {
  label: string;
  detail: string;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "today">("week");
  const [currentDate] = useState(new Date());
  const [scheduledTasks, setScheduledTasks] = useState<Record<string, ScheduledTask[]>>({});
  const [alwaysRunning, setAlwaysRunning] = useState<AlwaysRunning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendar();
  }, []);

  async function fetchCalendar() {
    try {
      const res = await fetch("/api/calendar");
      if (res.ok) {
        const data = await res.json();
        setScheduledTasks(data.scheduledTasks || {});
        setAlwaysRunning(data.alwaysRunning || []);
      }
    } catch (error) {
      console.error("Failed to fetch calendar:", error);
    } finally {
      setLoading(false);
    }
  }

  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const today = new Date();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Scheduled Tasks</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Your automated routines and scheduled work</p>
      </div>

      {/* Always Running */}
      <div className="flex items-center gap-2">
        <Zap size={14} style={{ color: "var(--warning)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Always Running</span>
        <div className="flex gap-2 ml-3">
          {alwaysRunning.map((item) => (
            <span
              key={item.label}
              className="px-3 py-1.5 rounded-lg text-xs border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {item.label} • {item.detail}
            </span>
          ))}
          {alwaysRunning.length === 0 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>No services running</span>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
          <button
            onClick={() => setView("week")}
            className="px-3 py-1.5 rounded-md text-xs font-medium"
            style={{
              background: view === "week" ? "var(--accent)" : "transparent",
              color: view === "week" ? "white" : "var(--text-secondary)",
            }}
          >
            Week
          </button>
          <button
            onClick={() => setView("today")}
            className="px-3 py-1.5 rounded-md text-xs font-medium"
            style={{
              background: view === "today" ? "var(--accent)" : "transparent",
              color: view === "today" ? "white" : "var(--text-secondary)",
            }}
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button style={{ color: "var(--text-muted)" }}><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button style={{ color: "var(--text-muted)" }}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Week View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {weekDates.map((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const tasks = scheduledTasks[dateKey] || [];
            const isToday = date.toDateString() === today.toDateString();

            if (view === "today" && !isToday) {
              return null;
            }

            return (
              <div key={dateKey} className="space-y-2">
                <div className="text-center pb-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {daysOfWeek[date.getDay()]}
                  </div>
                  <div
                    className="text-lg font-semibold mt-0.5"
                    style={{ color: isToday ? "var(--accent)" : "var(--text-primary)" }}
                  >
                    {date.getDate()}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg px-2.5 py-2 text-xs border-l-2 cursor-pointer hover:opacity-80"
                      style={{
                        background: "var(--bg-card)",
                        borderLeftColor: task.color,
                      }}
                    >
                      <div className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{task.title}</div>
                      <div className="mt-0.5" style={{ color: "var(--text-muted)" }}>{task.time}</div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-4 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
