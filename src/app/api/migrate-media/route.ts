import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@vercel/postgres";
import attachments from "@/data/imported/attachments.json";

interface Attachment {
  wpId: number;
  title: string;
  slug: string;
  url: string;
  mimeType: string;
}

// Get file extension from URL
function getExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "bin";
}

// Get content type from extension
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return types[ext] || "application/octet-stream";
}

export async function GET(request: NextRequest) {
  try {
    // Get blob token upfront
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN environment variable is not set" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const dryRun = searchParams.get("dry") === "true";

    const batch = (attachments as Attachment[]).slice(offset, offset + limit);
    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
      items: [] as { wpId: number; title: string; status: string; blobUrl?: string; error?: string }[],
    };

    for (const attachment of batch) {
      results.processed++;

      // Skip if no URL
      if (!attachment.url) {
        results.skipped++;
        results.items.push({
          wpId: attachment.wpId,
          title: attachment.title,
          status: "skipped",
          error: "No URL",
        });
        continue;
      }

      try {
        // Check if already migrated
        const existing = await sql`
          SELECT blob_url FROM media WHERE wp_id = ${attachment.wpId}
        `;
        if (existing.rows[0]?.blob_url) {
          results.skipped++;
          results.items.push({
            wpId: attachment.wpId,
            title: attachment.title,
            status: "skipped",
            blobUrl: existing.rows[0].blob_url,
            error: "Already migrated",
          });
          continue;
        }

        if (dryRun) {
          results.success++;
          results.items.push({
            wpId: attachment.wpId,
            title: attachment.title,
            status: "dry-run",
          });
          continue;
        }

        // Download from WordPress
        const response = await fetch(attachment.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; FSBHMigration/1.0)",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const ext = getExtension(attachment.url);
        const contentType = getContentType(ext);
        const filename = `${attachment.slug}.${ext}`;

        // Upload to Vercel Blob
        const blob = await put(filename, buffer, {
          access: "public",
          contentType,
          token: blobToken,
          addRandomSuffix: true,
        });

        // Save to database
        await sql`
          INSERT INTO media (wp_id, title, filename, url, blob_url, mime_type)
          VALUES (
            ${attachment.wpId},
            ${attachment.title || "(Untitled)"},
            ${filename},
            ${attachment.url},
            ${blob.url},
            ${contentType}
          )
        `;

        results.success++;
        results.items.push({
          wpId: attachment.wpId,
          title: attachment.title,
          status: "success",
          blobUrl: blob.url,
        });
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`${attachment.wpId}: ${errorMsg}`);
        results.items.push({
          wpId: attachment.wpId,
          title: attachment.title,
          status: "failed",
          error: errorMsg,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.processed} attachments`,
      total: (attachments as Attachment[]).length,
      offset,
      limit,
      nextOffset: offset + limit < (attachments as Attachment[]).length ? offset + limit : null,
      results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    );
  }
}
