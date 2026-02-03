import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const result = await sql`
      SELECT
        c.id, c.wp_id, c.name, c.slug, c.parent_slug,
        COUNT(pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'publish'
      GROUP BY c.id
      ORDER BY c.name
    `;

    return NextResponse.json({
      categories: result.rows.map((row) => ({
        id: row.id,
        wpId: row.wp_id,
        name: row.name,
        slug: row.slug,
        parentSlug: row.parent_slug,
        count: parseInt(row.post_count) || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
