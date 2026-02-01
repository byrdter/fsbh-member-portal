"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { canAccessYearbooks, canAccessPhotos, isAdmin, getRoleBadgeColor, getRoleDisplayName } from "@/lib/permissions";

export function Navigation() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = session?.user?.role;
  const showYearbooks = canAccessYearbooks(userRole);
  const showPhotos = canAccessPhotos(userRole);
  const showAdmin = isAdmin(userRole);

  return (
    <nav className="bg-red-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">FSBH</span>
            <span className="hidden sm:block text-sm">Tigers Alumni</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-red-200 transition">
              Home
            </Link>

            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="hover:text-red-200 transition">
                  Dashboard
                </Link>
                {showYearbooks && (
                  <Link href="/yearbooks" className="hover:text-red-200 transition">
                    Yearbooks
                  </Link>
                )}
                {showPhotos && (
                  <Link href="/photos" className="hover:text-red-200 transition">
                    Photos
                  </Link>
                )}
                <Link href="/history" className="hover:text-red-200 transition">
                  History
                </Link>
                {showAdmin && (
                  <Link href="/admin" className="hover:text-red-200 transition">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-red-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-200 text-sm">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    {userRole && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(userRole)}`}>
                        {getRoleDisplayName(userRole)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/about" className="hover:text-red-200 transition">
                  About
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-red-900 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition"
                >
                  Member Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            {status === "authenticated" ? (
              <>
                {userRole && (
                  <div className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(userRole)}`}>
                      {getRoleDisplayName(userRole)} Member
                    </span>
                  </div>
                )}
                <Link href="/dashboard" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                {showYearbooks && (
                  <Link href="/yearbooks" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                    Yearbooks
                  </Link>
                )}
                {showPhotos && (
                  <Link href="/photos" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                    Photos
                  </Link>
                )}
                <Link href="/history" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                  History
                </Link>
                {showAdmin && (
                  <Link href="/admin" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full text-left py-2 text-red-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/about" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link href="/login" className="block py-2 hover:text-red-200" onClick={() => setMobileMenuOpen(false)}>
                  Member Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
