import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let result;

    if (category) {
      // Get posts by category slug
      result = await sql`
        SELECT
          p.id, p.wp_id, p.title, p.slug, p.content, p.excerpt,
          p.status, p.post_type, p.featured_image, p.author,
          p.published_at, p.access_level,
          ARRAY_AGG(c.slug) as category_slugs,
          ARRAY_AGG(c.name) as category_names
        FROM posts p
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.status = 'publish'
          AND EXISTS (
            SELECT 1 FROM post_categories pc2
            JOIN categories c2 ON pc2.category_id = c2.id
            WHERE pc2.post_id = p.id AND c2.slug = ${category}
          )
        GROUP BY p.id
        ORDER BY p.published_at DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Get all posts
      result = await sql`
        SELECT
          p.id, p.wp_id, p.title, p.slug, p.content, p.excerpt,
          p.status, p.post_type, p.featured_image, p.author,
          p.published_at, p.access_level,
          ARRAY_AGG(c.slug) as category_slugs,
          ARRAY_AGG(c.name) as category_names
        FROM posts p
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.status = 'publish'
        GROUP BY p.id
        ORDER BY p.published_at DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Get total count
    const countResult = category
      ? await sql`
          SELECT COUNT(DISTINCT p.id) as total
          FROM posts p
          JOIN post_categories pc ON p.id = pc.post_id
          JOIN categories c ON pc.category_id = c.id
          WHERE p.status = 'publish' AND c.slug = ${category}
        `
      : await sql`
          SELECT COUNT(*) as total FROM posts WHERE status = 'publish'
        `;

    return NextResponse.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
