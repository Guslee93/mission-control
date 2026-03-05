import { NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const WORKSPACE_DIR = "/data/.openclaw/workspace";

export async function GET() {
  try {
    const docs: Array<{
      id: string;
      filename: string;
      category: string;
      content: string;
      size: string;
      wordCount: number;
      createdAt: string;
    }> = [];

    try {
      const files = readdirSync(WORKSPACE_DIR);
      const mdFiles = files.filter(
        (f) =>
          f.endsWith(".md") &&
          !f.startsWith("memory") &&
          !f.includes("node_modules")
      );

      for (const file of mdFiles) {
        try {
          const filePath = join(WORKSPACE_DIR, file);
          const content = readFileSync(filePath, "utf8");
          const stats = statSync(filePath);

          // Determine category based on filename
          let category = "Docs";
          if (file.includes("journal") || file.match(/^\d{4}-\d{2}-\d{2}/)) {
            category = "Journal";
          } else if (file.includes("note")) {
            category = "Notes";
          } else if (
            ["SOUL", "USER", "IDENTITY", "AGENTS", "TOOLS", "MEMORY", "HEARTBEAT"].some((n) =>
              file.includes(n)
            )
          ) {
            category = "Config";
          }

          // Calculate size
          const sizeKB = (stats.size / 1024).toFixed(1);

          // Count words
          const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

          docs.push({
            id: file,
            filename: file,
            category,
            content,
            size: `${sizeKB} KB`,
            wordCount,
            createdAt: stats.mtime.toISOString().split("T")[0],
          });
        } catch (e) {
          // Skip files that can't be read
        }
      }
    } catch {
      // Directory might not exist
    }

    // Sort by filename
    docs.sort((a, b) => a.filename.localeCompare(b.filename));

    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch docs" },
      { status: 500 }
    );
  }
}
