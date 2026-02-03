import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const result = await sql`
      SELECT
        p.id, p.wp_id, p.title, p.slug, p.content, p.excerpt,
        p.status, p.post_type, p.featured_image, p.author,
        p.published_at, p.access_level,
        ARRAY_AGG(c.slug) as category_slugs,
        ARRAY_AGG(c.name) as category_names
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.slug = ${slug}
      GROUP BY p.id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: result.rows[0] });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
