import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const AGENTS_FILE = "/data/.openclaw/workspace/.mission-control/agents.json";

function readAgents() {
  try {
    const data = readFileSync(AGENTS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeAgents(agents: any[]) {
  writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2));
}

export async function GET() {
  try {
    const agents = readAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, action } = body;

    if (!agentId || !action) {
      return NextResponse.json(
        { error: "Agent ID and action required" },
        { status: 400 }
      );
    }

    const agents = readAgents();
    const agentIndex = agents.findIndex((a: any) => a.id === agentId);

    if (agentIndex === -1) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    if (action === "spawn") {
      // Spawn the agent as an OpenClaw session
      try {
        const agent = agents[agentIndex];
        const soulPath = `/data/.openclaw/workspace/agents/${agent.id}/SOUL.md`;
        
        // Create the agent session using openclaw
        execSync(
          `cd /data/.openclaw/workspace && openclaw sessions spawn --agent-id ${agent.id} --mode session --label "${agent.name}" --thinking "on" &`,
          { 
            encoding: "utf8",
            timeout: 5000 
          }
        );

        // Update agent status
        agents[agentIndex].status = "online";
        writeAgents(agents);

        return NextResponse.json({ 
          success: true, 
          message: `${agent.name} spawned successfully`,
          agent: agents[agentIndex]
        });
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to spawn agent", details: String(error) },
          { status: 500 }
        );
      }
    }

    if (action === "update-status") {
      const { status } = body;
      if (!status) {
        return NextResponse.json(
          { error: "Status required" },
          { status: 400 }
        );
      }
      agents[agentIndex].status = status;
      writeAgents(agents);
      return NextResponse.json({ agent: agents[agentIndex] });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process agent action" },
      { status: 500 }
    );
  }
}
