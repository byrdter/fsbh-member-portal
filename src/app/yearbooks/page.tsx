"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { yearbooks } from "@/data/content";
import { canAccessYearbooks, getRoleDisplayName } from "@/lib/permissions";

export default function YearbooksPage() {
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
  const hasAccess = canAccessYearbooks(userRole);

  // Access denied for Maroon and White members
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a7 7 0 11-14 0 7 7 0 0114 0z" />
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Yearbooks</h1>
        <p className="text-lg text-gray-600">
          Browse digitized yearbooks from Fair Street and E.E. Butler High Schools (1948-1969)
        </p>
      </div>

      {/* Yearbooks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {yearbooks.map((yearbook) => (
          <div
            key={yearbook.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer"
          >
            {/* Cover placeholder */}
            <div className="aspect-[3/4] bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center relative">
              <div className="text-center text-white p-4">
                <div className="text-6xl font-bold mb-2">{yearbook.year}</div>
                <div className="text-lg opacity-80">Yearbook</div>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white font-semibold text-lg">View Yearbook</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{yearbook.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{yearbook.description}</p>
              {yearbook.pageCount && (
                <p className="text-xs text-gray-400 mt-2">{yearbook.pageCount} pages</p>
              )}
            </div>
          </div>
        ))}
      </div>

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
