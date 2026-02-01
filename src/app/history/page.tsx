"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { historyPosts, categories } from "@/data/content";

function HistoryContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const filteredPosts = selectedCategory
    ? historyPosts.filter((post) =>
        post.category.toLowerCase().replace(/\s+/g, "-").includes(selectedCategory.toLowerCase())
      )
    : historyPosts;

  const handleCategoryClick = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      router.push(`/history?category=${slug}`);
    } else {
      router.push("/history");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">History & Archives</h1>
        <p className="text-lg text-gray-600">
          Explore our rich collection of community history, stories, and memories
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
            <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    !selectedCategory
                      ? "bg-red-100 text-red-900 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  All Posts
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex justify-between items-center ${
                      selectedCategory === cat.slug
                        ? "bg-red-100 text-red-900 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedCategory && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
              </h2>
              <button
                onClick={() => handleCategoryClick(null)}
                className="text-sm text-red-900 hover:text-red-700"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Posts Grid */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-red-900 transition">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-600">No posts found in this category.</p>
            </div>
          )}

          {/* More Content Notice */}
          <div className="mt-8 bg-purple-50 rounded-xl p-6">
            <h3 className="font-semibold text-purple-900 mb-2">More Content Available</h3>
            <p className="text-purple-800 text-sm">
              This is a preview of our archives. The full collection includes {historyPosts.length}+ posts
              across all categories. Content is being migrated from our main website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
