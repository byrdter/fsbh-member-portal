"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { photoGalleries } from "@/data/content";
import { canAccessPhotos, getRoleDisplayName } from "@/lib/permissions";

export default function PhotosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
            <a
              href="https://fsbhtiger.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Contact Us
            </a>
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
          Browse photo galleries from reunions, events, and community celebrations
        </p>
      </div>

      {/* Photo Galleries Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photoGalleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer"
          >
            {/* Cover placeholder */}
            <div className="aspect-video bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center relative">
              <div className="text-center text-white p-4">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-2xl font-bold">{gallery.imageCount}</div>
                <div className="text-sm opacity-80">photos</div>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white font-semibold text-lg">View Gallery</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{gallery.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{gallery.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {new Date(gallery.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {gallery.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* More Galleries Coming */}
      <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">More Galleries Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          We are continuously adding photos from our archives. Total collection: 27+ galleries
        </p>
        <p className="text-sm text-gray-500">
          Have photos to share? Contact us at admin@fsbhtiger.com
        </p>
      </div>
    </div>
  );
}
