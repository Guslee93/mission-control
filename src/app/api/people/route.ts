import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";

const PEOPLE_FILE = "/data/.openclaw/workspace/.mission-control/people.json";

function readPeople() {
  try {
    const data = readFileSync(PEOPLE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writePeople(people: any[]) {
  writeFileSync(PEOPLE_FILE, JSON.stringify(people, null, 2));
}

export async function GET() {
  try {
    const people = readPeople();
    return NextResponse.json({ people });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const people = readPeople();
    const newPerson = { id: Date.now().toString(), ...body, lastContact: new Date().toISOString().split("T")[0] };
    people.push(newPerson);
    writePeople(people);
    return NextResponse.json({ person: newPerson });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const people = readPeople();
    const index = people.findIndex((p: any) => p.id === id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    people[index] = { ...people[index], ...updates };
    writePeople(people);
    return NextResponse.json({ person: people[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update person" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const people = readPeople();
    writePeople(people.filter((p: any) => p.id !== id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
