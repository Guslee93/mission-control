import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";

const ACTIVITY_FILE = "/data/.openclaw/workspace/.mission-control/activity.json";

function readActivity() {
  try {
    const data = readFileSync(ACTIVITY_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeActivity(activity: any[]) {
  writeFileSync(ACTIVITY_FILE, JSON.stringify(activity, null, 2));
}

export async function GET() {
  try {
    const activity = readActivity();
    // Sort by timestamp descending
    activity.sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json({ activity });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const activity = readActivity();

    const newEvent = {
      id: Date.now().toString(),
      ...body,
      timestamp: new Date().toISOString(),
    };

    activity.unshift(newEvent);
    // Keep only last 100 events
    writeActivity(activity.slice(0, 100));

    return NextResponse.json({ event: newEvent });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
