import { NextResponse } from "next/server";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const MEMORY_DIR = "/data/.openclaw/workspace/memory";
const WORKSPACE_DIR = "/data/.openclaw/workspace";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    // Count memory files
    let memoryCount = 0;
    try {
      const files = readdirSync(MEMORY_DIR);
      memoryCount = files.filter((f) => f.endsWith(".md")).length;
    } catch {}

    // Count docs
    let docCount = 0;
    try {
      const files = readdirSync(WORKSPACE_DIR);
      docCount = files.filter((f) => f.endsWith(".md") && !f.startsWith("memory")).length;
    } catch {}

    // Count tasks
    let taskCount = 0;
    let inProgressCount = 0;
    try {
      const tasksPath = join(WORKSPACE_DIR, ".mission-control", "tasks.json");
      const tasksData = readFileSync(tasksPath, "utf8");
      const tasks = JSON.parse(tasksData);
      taskCount = tasks.length;
      inProgressCount = tasks.filter((t: any) => t.column === "in-progress").length;
    } catch {}

    // Count projects
    let projectCount = 0;
    try {
      const projectsPath = join(WORKSPACE_DIR, ".mission-control", "projects.json");
      const projectsData = readFileSync(projectsPath, "utf8");
      const projects = JSON.parse(projectsData);
      projectCount = projects.filter((p: any) => p.status === "active").length;
    } catch {}

    // Count agents
    let agentCount = 0;
    let onlineAgents = 0;
    try {
      const agentsPath = join(WORKSPACE_DIR, ".mission-control", "agents.json");
      const agentsData = readFileSync(agentsPath, "utf8");
      const agents = JSON.parse(agentsData);
      agentCount = agents.length;
      onlineAgents = agents.filter((a: any) => a.status === "online").length;
    } catch {}

    return NextResponse.json({
      tasks: { total: taskCount, inProgress: inProgressCount },
      projects: { active: projectCount },
      memories: { total: memoryCount },
      docs: { total: docCount },
      agents: { total: agentCount, online: onlineAgents },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500, headers: corsHeaders }
    );
  }
}
