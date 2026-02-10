"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { isAdmin, getRoleBadgeColor, getRoleDisplayName, getRoleDescription } from "@/lib/permissions";
import { UserRole } from "@/types/next-auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  class_year?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("white");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", name: "", password: "", role: "white" as UserRole, classYear: "" });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && isAdmin(session.user?.role)) {
      fetchUsers();
    }
  }, [session, fetchUsers]);

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

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role } : user
      ));
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      return;
    }

    setDeletingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addForm.email,
          name: addForm.name,
          password: addForm.password,
          role: addForm.role,
          classYear: addForm.classYear || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add user");
      }

      setUsers([data.user, ...users]);
      setAddForm({ email: "", name: "", password: "", role: "white", classYear: "" });
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setAddLoading(false);
    }
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition text-sm font-medium"
          >
            {showAddForm ? "Cancel" : "Add Member"}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleAddUser} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="white">White</option>
                  <option value="maroon">Maroon</option>
                  <option value="tiger">Tiger</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Year</label>
                <input
                  type="text"
                  value={addForm.classYear}
                  onChange={(e) => setAddForm({ ...addForm, classYear: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 1965"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
              {addError && (
                <div className="md:col-span-2 lg:col-span-3 text-red-600 text-sm">{addError}</div>
              )}
            </form>
          </div>
        )}

        {/* Error / Loading State */}
        {error && (
          <div className="px-6 py-4 bg-red-50 text-red-700 text-sm">
            {error}
            <button onClick={fetchUsers} className="ml-2 underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-900 mx-auto mb-2"></div>
            Loading users...
          </div>
        ) : (
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
                      {user.class_year || "-"}
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
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setEditingUser(user.id);
                              setNewRole(user.role);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Change Role
                          </button>
                          {user.id !== session.user?.id && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingUser === user.id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingUser === user.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
