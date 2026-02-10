"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { canAccessYearbooks, canAccessPhotos, isAdmin, getRoleBadgeColor, getRoleDisplayName, getRoleDescription } from "@/lib/permissions";

const allContentCategories = [
  {
    title: "Yearbooks",
    description: "1948 - 1969",
    count: 11,
    href: "/yearbooks",
    requiresYearbookAccess: true,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "bg-blue-500",
  },
  {
    title: "Event Photos",
    description: "Reunions & Celebrations",
    count: 27,
    href: "/photos",
    requiresYearbookAccess: false,
    requiresPhotoAccess: true,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-green-500",
  },
  {
    title: "Community History",
    description: "Stories & Memories",
    count: 50,
    href: "/history",
    requiresYearbookAccess: false,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    color: "bg-purple-500",
  },
  {
    title: "Black History",
    description: "Our Heritage",
    count: 34,
    href: "/history?category=black-history",
    requiresYearbookAccess: false,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    color: "bg-yellow-600",
  },
  {
    title: "Sports",
    description: "Athletics Archives",
    count: 21,
    href: "/history?category=sports",
    requiresYearbookAccess: false,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "bg-orange-500",
  },
  {
    title: "Newsletters",
    description: "Association Updates",
    count: 5,
    href: "/history?category=newsletters",
    requiresYearbookAccess: false,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
      </svg>
    ),
    color: "bg-teal-500",
  },
];

export default function DashboardPage() {
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
  const hasYearbookAccess = canAccessYearbooks(userRole);
  const hasPhotoAccess = canAccessPhotos(userRole);
  const userIsAdmin = isAdmin(userRole);

  // Filter categories based on user's access level
  const accessibleCategories = allContentCategories.filter(
    (category) =>
      (!category.requiresYearbookAccess || hasYearbookAccess) &&
      (!category.requiresPhotoAccess || hasPhotoAccess)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session.user?.firstName}!
            </h1>
            <p className="text-red-100">
              Access your alumni archives and connect with your community.
            </p>
          </div>
          {userRole && (
            <div className="mt-4 md:mt-0">
              <div className={`inline-block px-4 py-2 rounded-lg ${getRoleBadgeColor(userRole)}`}>
                <div className="font-semibold">{getRoleDisplayName(userRole)} Member</div>
                <div className="text-xs opacity-80">{getRoleDescription(userRole)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Actions */}
      {userIsAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Administrator Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/content"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Manage Content
            </Link>
            <a
              href="https://fsbhtiger.com/wp-admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              WordPress Admin
            </a>
          </div>
        </div>
      )}

      {/* Upgrade Notice for Maroon/White members */}
      {!hasYearbookAccess && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Upgrade to Tiger Membership</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Unlock access to our complete yearbook collection (1948-1969) by upgrading to Tiger membership.
              </p>
              <a
                href="https://fsbhtiger.com/contact-us"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-yellow-800 font-medium hover:text-yellow-900 underline"
              >
                Contact us to upgrade
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Content Categories */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Archives</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {accessibleCategories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 group"
          >
            <div className="flex items-start space-x-4">
              <div className={`${category.color} text-white p-3 rounded-lg group-hover:scale-110 transition`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-900 transition">
                  {category.title}
                </h3>
                <p className="text-gray-500 text-sm">{category.description}</p>
                <p className="text-red-900 font-medium mt-2">{category.count} items</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <a
          href="https://fsbhtiger.com/donate"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-900 text-white rounded-lg p-4 text-center hover:bg-red-800 transition"
        >
          Donate to FSBHSAA
        </a>
        <a
          href="https://fsbhtiger.com/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-800 text-white rounded-lg p-4 text-center hover:bg-gray-700 transition"
        >
          Contact Us
        </a>
        <a
          href="https://fsbhtiger.com/about-us"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-600 text-white rounded-lg p-4 text-center hover:bg-gray-500 transition"
        >
          Board of Directors
        </a>
        <a
          href="https://www.facebook.com/groups/fsbhtiger"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white rounded-lg p-4 text-center hover:bg-blue-500 transition"
        >
          Facebook Group
        </a>
      </div>
    </div>
  );
}
