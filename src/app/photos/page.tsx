"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { canAccessPhotos, getRoleDisplayName } from "@/lib/permissions";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category_names: string[];
}

export default function PhotosPage() {
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

  // Fetch posts from events-photos and reunions categories
  useEffect(() => {
    async function fetchPhotoPosts() {
      setLoading(true);
      try {
        // Fetch from events-photos category
        const res = await fetch("/api/posts?category=events-photos");
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
          setTotal(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch photo posts:", error);
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchPhotoPosts();
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
  const hasAccess = canAccessPhotos(userRole);

  // Access denied for White members
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Photos Access Restricted</h1>
          <p className="text-yellow-700 mb-4">
            Your current membership level ({userRole ? getRoleDisplayName(userRole) : "Unknown"}) does not include access to photo galleries.
          </p>
          <p className="text-yellow-600 text-sm mb-6">
            Photo access is available to Maroon, Tiger, and Administrator members.
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Photos & Memories</h1>
        <p className="text-lg text-gray-600">
          Browse {total} photo galleries from reunions, events, and community celebrations
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
        </div>
      ) : (
        <>
          {/* Photo Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer"
              >
                {/* Cover */}
                <div className="aspect-video bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center relative">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white p-4">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-sm opacity-80">Photo Gallery</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">View Gallery</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    {post.published_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-600">No photo galleries found.</p>
            </div>
          )}
        </>
      )}

      {/* More Galleries Info */}
      <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Have Photos to Share?</h2>
        <p className="text-gray-600">
          Help us preserve our history by sharing your photos from reunions, events, and school days.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Contact us at admin@fsbhtiger.com
        </p>
      </div>
    </div>
  );
}
