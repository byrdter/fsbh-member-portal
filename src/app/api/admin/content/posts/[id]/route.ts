import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { updatePost, deletePost, unlinkPostCategories, linkPostToCategory } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { title, slug, content, excerpt, status, featuredImage, author, accessLevel, categoryIds } = await request.json();

    const post = await updatePost(parseInt(id), {
      title,
      slug,
      content,
      excerpt,
      status,
      featuredImage,
      author,
      accessLevel,
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (categoryIds && Array.isArray(categoryIds)) {
      await unlinkPostCategories(post.id);
      for (const catId of categoryIds) {
        await linkPostToCategory(post.id, catId);
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await deletePost(parseInt(id));
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
