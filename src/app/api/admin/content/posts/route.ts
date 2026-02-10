import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { createPost, linkPostToCategory } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, slug, content, excerpt, status, featuredImage, author, accessLevel, categoryIds } = await request.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase letters, numbers, and hyphens only" },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      slug,
      content: content || "",
      excerpt: excerpt || "",
      status: status || "publish",
      featuredImage,
      author: author || session.user?.name || "",
      publishedAt: new Date(),
      accessLevel: accessLevel || "white",
    });

    if (categoryIds && Array.isArray(categoryIds)) {
      for (const catId of categoryIds) {
        await linkPostToCategory(post.id, catId);
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
