"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  category_names: string[];
  category_slugs: string[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

function HistoryContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          // Filter to show only categories with posts
          setCategories(data.categories.filter((c: Category) => c.count > 0));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const url = selectedCategory
          ? `/api/posts?category=${selectedCategory}`
          : "/api/posts";
        const res = await fetch(url);
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
          setTotal(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [selectedCategory, status]);

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
          Explore our rich collection of {total} posts across community history, stories, and memories
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
            </div>
          ) : (
            <>
              {/* Posts Grid */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="block"
                  >
                    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-red-900 transition">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="flex items-center gap-2 mt-4 flex-wrap">
                            {post.category_names?.filter(Boolean).map((catName, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {catName}
                              </span>
                            ))}
                            {post.published_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(post.published_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {posts.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-gray-600">No posts found in this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
