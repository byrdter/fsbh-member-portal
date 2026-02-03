import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Add unique constraint on wp_id if not exists
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS media_wp_id_idx ON media (wp_id) WHERE wp_id IS NOT NULL
    `;

    // Count existing media records
    const countResult = await sql`SELECT COUNT(*) as count FROM media`;

    return NextResponse.json({
      success: true,
      message: "Media table setup complete",
      existingRecords: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      },
      { status: 500 }
    );
  }
}
