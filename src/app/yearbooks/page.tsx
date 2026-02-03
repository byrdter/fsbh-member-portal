"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { canAccessYearbooks, getRoleDisplayName } from "@/lib/permissions";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
}

export default function YearbooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch posts from yearbooks category
  useEffect(() => {
    async function fetchYearbookPosts() {
      setLoading(true);
      try {
        const res = await fetch("/api/posts?category=yearbooks");
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
          setTotal(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch yearbook posts:", error);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchYearbookPosts();
    }
  }, [status]);

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

  const userRole = session.user?.role;
  const hasAccess = canAccessYearbooks(userRole);

  // Access denied for Maroon and White members
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Yearbooks Access Restricted</h1>
          <p className="text-yellow-700 mb-4">
            Your current membership level ({userRole ? getRoleDisplayName(userRole) : "Unknown"}) does not include access to the yearbook archives.
          </p>
          <p className="text-yellow-600 text-sm mb-6">
            Yearbook access is available to Tiger members and Administrators.
            Please contact the association to upgrade your membership.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/dashboard"
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/contact"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract year from title if possible (e.g., "1965 Yearbook" or "Yearbook 1965")
  const extractYear = (title: string): number | null => {
    const match = title.match(/\b(19\d{2})\b/);
    return match ? parseInt(match[1]) : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Yearbooks</h1>
        <p className="text-lg text-gray-600">
          Browse {total} digitized yearbooks from Fair Street and E.E. Butler High Schools
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
        </div>
      ) : (
        <>
          {/* Yearbooks Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => {
              const year = extractYear(post.title);
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer"
                >
                  {/* Cover */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center relative">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-white p-4">
                        {year && <div className="text-6xl font-bold mb-2">{year}</div>}
                        <div className="text-lg opacity-80">Yearbook</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">View Yearbook</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {posts.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-600">No yearbooks found.</p>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">About Our Yearbook Collection</h2>
        <p className="text-blue-800">
          These yearbooks have been carefully digitized to preserve our history. The collection spans
          from 1948 to 1969, covering both Fair Street High School and E.E. Butler High School.
          If you have yearbooks from years not shown here, please contact us to help expand our archive.
        </p>
      </div>
    </div>
  );
}
