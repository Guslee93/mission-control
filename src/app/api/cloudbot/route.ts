import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const DATA_DIR = "/data/.openclaw/workspace/.mission-control";
const CLOUDBOT_API_KEY = process.env.CLOUDBOT_API_KEY || "dev-key-change-in-production";

// Helper functions
function readJSON(file: string) {
  try {
    return JSON.parse(readFileSync(`${DATA_DIR}/${file}`, "utf8"));
  } catch {
    return [];
  }
}

function writeJSON(file: string, data: any) {
  writeFileSync(`${DATA_DIR}/${file}`, JSON.stringify(data, null, 2));
}

function verifyAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${CLOUDBOT_API_KEY}`;
}

export async function POST(req: NextRequest) {
  // Verify authentication
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    // ADD TASK
    if (action === "add_task") {
      const tasks = readJSON("tasks.json");
      const newTask = {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description || "",
        status: "todo",
        priority: data.priority || "medium",
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "cloudbot"
      };
      tasks.push(newTask);
      writeJSON("tasks.json", tasks);
      
      return NextResponse.json({ 
        success: true, 
        message: "Task created",
        task: newTask 
      });
    }

    // CREATE AGENT
    if (action === "create_agent") {
      const agents = readJSON("agents.json");
      
      // Check if agent already exists
      if (agents.find((a: any) => a.id === data.id)) {
        return NextResponse.json({ 
          error: "Agent already exists" 
        }, { status: 409 });
      }

      const newAgent = {
        id: data.id,
        name: data.name,
        initial: data.name.charAt(0).toUpperCase(),
        role: data.role,
        description: data.description || "",
        tags: data.tags || [],
        color: data.color || "#6366f1",
        type: "agent",
        status: "standby",
        specialties: data.specialties || [],
        model: data.model || "moonshot/kimi-k2.5"
      };
      
      agents.push(newAgent);
      writeJSON("agents.json", agents);

      // Create agent config files
      try {
        const agentDir = `/data/.openclaw/workspace/agents/${data.id}`;
        execSync(`mkdir -p ${agentDir}`);
        
        const soulContent = `# SOUL.md — ${data.name}\n\n## Identity\n${data.description || data.role}\n\n## Tags\n${data.tags?.join(", ") || "AI Agent"}\n`;
        
        writeFileSync(`${agentDir}/SOUL.md`, soulContent);
        writeFileSync(`${agentDir}/AGENTS.md`, `# ${data.name}\n\n${data.description || ""}\n`);
      } catch (e) {
        console.error("Failed to create agent config files:", e);
      }

      return NextResponse.json({ 
        success: true, 
        message: "Agent created",
        agent: newAgent 
      });
    }

    // UPDATE AGENT STATUS
    if (action === "update_agent_status") {
      const agents = readJSON("agents.json");
      const index = agents.findIndex((a: any) => a.id === data.agentId);
      
      if (index === -1) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      agents[index].status = data.status;
      agents[index].updatedAt = new Date().toISOString();
      writeJSON("agents.json", agents);

      return NextResponse.json({ 
        success: true, 
        message: "Agent status updated",
        agent: agents[index]
      });
    }

    // SPAWN AGENT (via OpenClaw)
    if (action === "spawn_agent") {
      try {
        execSync(
          `cd /data/.openclaw/workspace && openclaw sessions spawn --agent-id ${data.agentId} --mode session --label "${data.agentId}" --thinking "on" &`,
          { timeout: 5000 }
        );

        // Update status to online
        const agents = readJSON("agents.json");
        const index = agents.findIndex((a: any) => a.id === data.agentId);
        if (index !== -1) {
          agents[index].status = "online";
          writeJSON("agents.json", agents);
        }

        return NextResponse.json({ 
          success: true, 
          message: `Agent ${data.agentId} spawned successfully`
        });
      } catch (error) {
        return NextResponse.json({ 
          error: "Failed to spawn agent", 
          details: String(error) 
        }, { status: 500 });
      }
    }

    // UPDATE TASK STATUS
    if (action === "update_task") {
      const tasks = readJSON("tasks.json");
      const index = tasks.findIndex((t: any) => t.id === data.taskId);
      
      if (index === -1) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      Object.assign(tasks[index], data.updates, { updatedAt: new Date().toISOString() });
      writeJSON("tasks.json", tasks);

      return NextResponse.json({ 
        success: true, 
        message: "Task updated",
        task: tasks[index]
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error) {
    console.error("CloudBot control error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: String(error)
    }, { status: 500 });
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    service: "cloudbot-control",
    timestamp: new Date().toISOString()
  });
}
