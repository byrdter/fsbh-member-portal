"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  featured_image: string | null;
  category_names: string[];
  category_slugs: string[];
}

export default function PostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${slug}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else if (data.post) {
          setPost(data.post);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated" && slug) {
      fetchPost();
    }
  }, [slug, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Post Not Found</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/history"
            className="bg-red-900 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition"
          >
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/history"
        className="inline-flex items-center text-gray-600 hover:text-red-900 mb-6 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to History
      </Link>

      {/* Article */}
      <article className="bg-white rounded-xl shadow-sm p-8">
        {/* Categories */}
        {post.category_names?.filter(Boolean).length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {post.category_names.filter(Boolean).map((catName, idx) => (
              <Link
                key={idx}
                href={`/history?category=${post.category_slugs[idx]}`}
                className="text-xs bg-red-100 text-red-900 px-3 py-1 rounded-full hover:bg-red-200 transition"
              >
                {catName}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-8 pb-8 border-b">
          {post.author && (
            <span>By {post.author}</span>
          )}
          {post.published_at && (
            <span>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-900 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || "" }}
        />
      </article>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/history"
          className="text-red-900 hover:text-red-700 font-medium"
        >
          ← All Posts
        </Link>
      </div>
    </div>
  );
}
