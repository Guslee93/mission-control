import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";

const CONTENT_FILE = "/data/.openclaw/workspace/.mission-control/content.json";

function readContent() {
  try {
    const data = readFileSync(CONTENT_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeContent(content: any[]) {
  writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));
}

export async function GET() {
  try {
    const content = readContent();
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = readContent();
    const newItem = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString().split("T")[0] };
    content.push(newItem);
    writeContent(content);
    return NextResponse.json({ item: newItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const content = readContent();
    const index = content.findIndex((c: any) => c.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    content[index] = { ...content[index], ...updates };
    writeContent(content);
    return NextResponse.json({ item: content[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const content = readContent();
    writeContent(content.filter((c: any) => c.id !== id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
