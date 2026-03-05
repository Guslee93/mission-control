import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TASKS_FILE = "/data/.openclaw/workspace/.mission-control/tasks.json";

function readTasks() {
  try {
    const data = readFileSync(TASKS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTasks(tasks: any[]) {
  writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  try {
    const tasks = readTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tasks = readTasks();

    const newTask = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString().split("T")[0],
    };

    tasks.push(newTask);
    writeTasks(tasks);

    return NextResponse.json({ task: newTask });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const tasks = readTasks();
    const index = tasks.findIndex((t: any) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...updates };
    writeTasks(tasks);

    return NextResponse.json({ task: tasks[index] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
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
        { error: "Task ID required" },
        { status: 400 }
      );
    }

    const tasks = readTasks();
    const filtered = tasks.filter((t: any) => t.id !== id);
    writeTasks(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
