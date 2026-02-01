"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isAdmin, getRoleBadgeColor, getRoleDisplayName, getRoleDescription } from "@/lib/permissions";
import { UserRole } from "@/types/next-auth";

// Demo users for display (in production, this would come from an API)
const demoUsers = [
  { id: "1", email: "admin@fsbhtiger.com", name: "Admin User", role: "admin" as UserRole },
  { id: "2", email: "tiger@fsbhtiger.com", name: "Tiger Member", role: "tiger" as UserRole, classYear: "1965" },
  { id: "3", email: "maroon@fsbhtiger.com", name: "Maroon Member", role: "maroon" as UserRole, classYear: "1960" },
  { id: "4", email: "white@fsbhtiger.com", name: "White Member", role: "white" as UserRole, classYear: "1955" },
  { id: "5", email: "demo@fsbhtiger.com", name: "Demo Member", role: "tiger" as UserRole, classYear: "1965" },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState(demoUsers);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("white");

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
  const hasAdminAccess = isAdmin(userRole);

  // Access denied for non-admins
  if (!hasAdminAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-700 mb-4">
            You do not have permission to access the admin area.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role } : user
    ));
    setEditingUser(null);
  };

  const roleStats = {
    admin: users.filter(u => u.role === "admin").length,
    tiger: users.filter(u => u.role === "tiger").length,
    maroon: users.filter(u => u.role === "maroon").length,
    white: users.filter(u => u.role === "white").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, roles, and system settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-900">{roleStats.admin}</div>
          <div className="text-purple-700">Administrators</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-900">{roleStats.tiger}</div>
          <div className="text-orange-700">Tiger Members</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-900">{roleStats.maroon}</div>
          <div className="text-red-700">Maroon Members</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-gray-900">{roleStats.white}</div>
          <div className="text-gray-700">White Members</div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Membership Levels</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["admin", "tiger", "maroon", "white"] as UserRole[]).map((role) => (
            <div key={role} className="bg-white rounded-lg p-4">
              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRoleBadgeColor(role)}`}>
                {getRoleDisplayName(role)}
              </span>
              <p className="text-sm text-gray-600 mt-2">{getRoleDescription(role)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {user.classYear || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="admin">Administrator</option>
                        <option value="tiger">Tiger</option>
                        <option value="maroon">Maroon</option>
                        <option value="white">White</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRoleChange(user.id, newRole)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setNewRole(user.role);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Change Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <a
          href="https://fsbhtiger.com/wp-admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-800 text-white rounded-lg p-4 text-center hover:bg-gray-700 transition"
        >
          WordPress Admin
        </a>
        <a
          href="https://fsbhtiger.com/wp-admin/edit.php"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white rounded-lg p-4 text-center hover:bg-blue-500 transition"
        >
          Manage Posts
        </a>
        <a
          href="https://fsbhtiger.com/wp-admin/upload.php"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white rounded-lg p-4 text-center hover:bg-green-500 transition"
        >
          Media Library
        </a>
      </div>
    </div>
  );
}
