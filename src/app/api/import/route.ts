import { NextResponse } from "next/server";
import { createCategory, createPost, linkPostToCategory, getAllCategories } from "@/lib/db";
import categories from "@/data/imported/categories.json";
import posts from "@/data/imported/posts.json";

export async function GET() {
  try {
    const results = {
      categories: { imported: 0, errors: 0 },
      posts: { imported: 0, errors: 0 },
    };

    // Import categories first
    console.log("Importing categories...");
    const categoryMap: Record<string, number> = {};

    for (const cat of categories) {
      try {
        const created = await createCategory(
          cat.name,
          cat.slug,
          cat.wpId,
          cat.parentSlug
        );
        categoryMap[cat.slug] = created.id;
        results.categories.imported++;
      } catch (error) {
        console.error(`Error importing category ${cat.name}:`, error);
        results.categories.errors++;
      }
    }

    // Get all categories for linking
    const allCategories = await getAllCategories();
    for (const cat of allCategories) {
      categoryMap[cat.slug] = cat.id;
    }

    // Import posts
    console.log("Importing posts...");
    for (const post of posts as any[]) {
      try {
        const created = await createPost({
          wpId: post.wpId,
          title: post.title,
          slug: post.slug || `post-${post.wpId}`,
          content: post.content,
          excerpt: post.excerpt,
          status: post.status || 'publish',
          postType: 'post',
          author: post.author,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
          accessLevel: post.accessLevel || 'white',
        });

        // Link post to categories
        if (post.categories && Array.isArray(post.categories)) {
          for (const catSlug of post.categories) {
            const categoryId = categoryMap[catSlug];
            if (categoryId && created.id) {
              await linkPostToCategory(created.id, categoryId);
            }
          }
        }

        results.posts.imported++;
      } catch (error) {
        console.error(`Error importing post ${post.title}:`, error);
        results.posts.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Import completed",
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
