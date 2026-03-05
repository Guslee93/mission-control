import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const WORKSPACE_DIR = "/data/.openclaw/workspace";

interface ScheduledTask {
  id: string;
  title: string;
  time: string;
  color: string;
  recurring: boolean;
  type: "cron" | "heartbeat" | "manual";
}

// Parse heartbeat.md for scheduled checks
function parseHeartbeatSchedule(): ScheduledTask[] {
  const tasks: ScheduledTask[] = [];
  try {
    const hbPath = join(WORKSPACE_DIR, "HEARTBEAT.md");
    const content = readFileSync(hbPath, "utf8");

    // Check if there's actual content (not just comments)
    const hasTasks = content
      .split("\n")
      .some((line) => line.trim() && !line.trim().startsWith("#"));

    if (hasTasks) {
      tasks.push({
        id: "heartbeat-check",
        title: "Heartbeat Check",
        time: "Every 30 min",
        color: "#6366f1",
        recurring: true,
        type: "heartbeat",
      });
    }
  } catch {}
  return tasks;
}

// Get always running services
function getAlwaysRunning(): Array<{ label: string; detail: string }> {
  const alwaysRunning: Array<{ label: string; detail: string }> = [];

  // Check if heartbeat is configured
  try {
    const hbPath = join(WORKSPACE_DIR, "HEARTBEAT.md");
    const content = readFileSync(hbPath, "utf8");
    const hasTasks = content
      .split("\n")
      .some((line) => line.trim() && !line.trim().startsWith("#"));
    if (hasTasks) {
      alwaysRunning.push({ label: "Heartbeat Check", detail: "Every 30 min" });
    }
  } catch {}

  // Memory sync is always on
  alwaysRunning.push({ label: "Memory Sync", detail: "On change" });

  return alwaysRunning;
}

export async function GET() {
  try {
    // Generate week view with scheduled tasks
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const scheduledTasks: Record<string, ScheduledTask[]> = {};
    const heartbeatTasks = parseHeartbeatSchedule();

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = d.toISOString().split("T")[0];

      scheduledTasks[key] = [
        ...heartbeatTasks,
        { id: `${i}-morning`, title: "Morning Review", time: "8:00 AM", color: "#6366f1", recurring: true, type: "manual" },
        { id: `${i}-sync`, title: "Task Sync", time: "9:00 AM", color: "#22c55e", recurring: true, type: "manual" },
        { id: `${i}-wrap`, title: "Evening Wrap Up", time: "9:00 PM", color: "#f59e0b", recurring: true, type: "manual" },
      ];
    }

    // Check for daily briefing cron
    try {
      const memoryPath = join(WORKSPACE_DIR, "memory", "2026-03-04.md");
      const content = readFileSync(memoryPath, "utf8");
      if (content.includes("daily voice briefing")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const key = tomorrow.toISOString().split("T")[0];
        if (scheduledTasks[key]) {
          scheduledTasks[key].unshift({
            id: "daily-briefing",
            title: "Daily Morning Briefing",
            time: "7:00 AM",
            color: "#ef4444",
            recurring: true,
            type: "cron",
          });
        }
      }
    } catch {}

    return NextResponse.json({
      scheduledTasks,
      alwaysRunning: getAlwaysRunning(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}
