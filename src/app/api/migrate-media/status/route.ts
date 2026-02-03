import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import attachments from "@/data/imported/attachments.json";

export async function GET() {
  try {
    // Count total attachments
    const total = (attachments as any[]).length;

    // Count migrated (with blob_url)
    const migratedResult = await sql`
      SELECT COUNT(*) as count FROM media WHERE blob_url IS NOT NULL
    `;
    const migrated = parseInt(migratedResult.rows[0].count);

    // Count total in media table
    const totalInDbResult = await sql`
      SELECT COUNT(*) as count FROM media
    `;
    const totalInDb = parseInt(totalInDbResult.rows[0].count);

    // Get sample of recent migrations
    const recentResult = await sql`
      SELECT wp_id, title, filename, blob_url, created_at
      FROM media
      WHERE blob_url IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      total,
      migrated,
      totalInDb,
      remaining: total - migrated,
      percentComplete: Math.round((migrated / total) * 100),
      recent: recentResult.rows,
    });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}
