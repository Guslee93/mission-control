import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PROJECTS_FILE = "/data/.openclaw/workspace/.mission-control/projects.json";

function readProjects() {
  try {
    const data = readFileSync(PROJECTS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeProjects(projects: any[]) {
  writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export async function GET() {
  try {
    const projects = readProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projects = readProjects();

    const newProject = {
      id: Date.now().toString(),
      ...body,
      tasksComplete: 0,
      tasksTotal: 0,
      progress: 0,
      updatedAgo: "just now",
    };

    projects.push(newProject);
    writeProjects(projects);

    return NextResponse.json({ project: newProject });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const projects = readProjects();
    const index = projects.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects[index] = { ...projects[index], ...updates, updatedAgo: "just now" };
    writeProjects(projects);

    return NextResponse.json({ project: projects[index] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID required" },
        { status: 400 }
      );
    }

    const projects = readProjects();
    const filtered = projects.filter((p: any) => p.id !== id);
    writeProjects(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
