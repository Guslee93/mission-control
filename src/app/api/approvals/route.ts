import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";

const APPROVALS_FILE = "/data/.openclaw/workspace/.mission-control/approvals.json";

function readApprovals() {
  try {
    const data = readFileSync(APPROVALS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeApprovals(approvals: any[]) {
  writeFileSync(APPROVALS_FILE, JSON.stringify(approvals, null, 2));
}

export async function GET() {
  try {
    const approvals = readApprovals();
    return NextResponse.json({ approvals });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, comment } = body;
    const approvals = readApprovals();
    const index = approvals.findIndex((a: any) => a.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    approvals[index] = { ...approvals[index], status, comment, reviewedAt: new Date().toISOString() };
    writeApprovals(approvals);
    return NextResponse.json({ approval: approvals[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update approval" }, { status: 500 });
  }
}
