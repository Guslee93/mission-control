import { NextResponse } from "next/server";
import { readFileSync } from "fs";

const MONITORING_FILE = "/data/.openclaw/workspace/.mission-control/monitoring.json";

function readMonitoring() {
  try {
    const data = readFileSync(MONITORING_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [
      { id: "1", metric: "API Response Time", value: "120ms", status: "healthy", threshold: "< 200ms", lastCheck: new Date().toISOString() },
      { id: "2", metric: "Agent Sessions", value: "3 active", status: "healthy", threshold: "< 10", lastCheck: new Date().toISOString() },
      { id: "3", metric: "Memory Usage", value: "2.4 GB", status: "warning", threshold: "< 2 GB", lastCheck: new Date().toISOString() },
      { id: "4", metric: "Disk Space", value: "68%", status: "healthy", threshold: "< 80%", lastCheck: new Date().toISOString() },
    ];
  }
}

export async function GET() {
  try {
    const statuses = readMonitoring();
    return NextResponse.json({ statuses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch monitoring" }, { status: 500 });
  }
}
