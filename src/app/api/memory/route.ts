import { NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const MEMORY_DIR = "/data/.openclaw/workspace/memory";

export async function GET() {
  try {
    const memories: Array<{
      id: string;
      date: string;
      title: string;
      content: string;
      size: string;
      wordCount: number;
    }> = [];

    try {
      const files = readdirSync(MEMORY_DIR);
      const mdFiles = files.filter((f) => f.endsWith(".md"));

      for (const file of mdFiles) {
        try {
          const filePath = join(MEMORY_DIR, file);
          const content = readFileSync(filePath, "utf8");
          const stats = statSync(filePath);

          // Parse filename as date (YYYY-MM-DD.md)
          const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
          const date = dateMatch ? dateMatch[1] : file.replace(".md", "");

          // Extract title from first heading or use date
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch
            ? titleMatch[1]
            : new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              });

          // Calculate size
          const sizeKB = (stats.size / 1024).toFixed(1);

          // Count words
          const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

          memories.push({
            id: file,
            date,
            title: title.replace(/^#\s*/, ""),
            content,
            size: `${sizeKB} KB`,
            wordCount,
          });
        } catch (e) {
          // Skip files that can't be read
        }
      }
    } catch {
      // Directory might not exist yet
    }

    // Sort by date descending
    memories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch memories" },
      { status: 500 }
    );
  }
}
