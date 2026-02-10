"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { isAdmin } from "@/lib/permissions";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentSlug?: string;
  count: number;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  post_type: string;
  featured_image: string;
  author: string;
  published_at: string;
  access_level: string;
  category_slugs: string[];
  category_names: string[];
}

type Tab = "posts" | "categories";
type PostModal = "create" | "edit" | null;
type CatModal = "create" | "edit" | null;

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("posts");

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [postModal, setPostModal] = useState<PostModal>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postForm, setPostForm] = useState({
    title: "", slug: "", content: "", excerpt: "", status: "publish",
    featuredImage: "", author: "", accessLevel: "white", categoryIds: [] as number[],
  });
  const [postSaving, setPostSaving] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<number | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);
  const [catModal, setCatModal] = useState<CatModal>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", parentSlug: "" });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setCatsError(null);
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data.categories);
    } catch {
      setCatsError("Failed to load categories.");
    } finally {
      setCatsLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async (category?: string) => {
    try {
      setPostsError(null);
      setPostsLoading(true);
      const url = category
        ? `/api/posts?category=${category}&limit=200`
        : "/api/posts?limit=200";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts);
    } catch {
      setPostsError("Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && isAdmin(session.user?.role)) {
      fetchCategories();
      fetchPosts();
    }
  }, [session, fetchCategories, fetchPosts]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (!session) return null;

  if (!isAdmin(session.user?.role)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-700 mb-4">You do not have permission to manage content.</p>
          <Link href="/dashboard" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- Category handlers ---
  const openCreateCategory = () => {
    setCatForm({ name: "", slug: "", parentSlug: "" });
    setCatError(null);
    setEditingCat(null);
    setCatModal("create");
  };

  const openEditCategory = (cat: Category) => {
    setCatForm({ name: cat.name, slug: cat.slug, parentSlug: cat.parentSlug || "" });
    setCatError(null);
    setEditingCat(cat);
    setCatModal("edit");
  };

  const handleSaveCategory = async () => {
    setCatError(null);
    setCatSaving(true);
    try {
      if (catModal === "create") {
        const res = await fetch("/api/admin/content/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create");
        setCategories([...categories, { ...data.category, count: 0 }]);
      } else if (catModal === "edit" && editingCat) {
        const res = await fetch(`/api/admin/content/categories/${editingCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update");
        setCategories(categories.map(c =>
          c.id === editingCat.id ? { ...c, name: data.category.name, slug: data.category.slug, parentSlug: data.category.parent_slug } : c
        ));
      }
      setCatModal(null);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category? Posts in it will be unlinked but not deleted.")) return;
    setDeletingCat(id);
    try {
      const res = await fetch(`/api/admin/content/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingCat(null);
    }
  };

  // --- Post handlers ---
  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreatePost = () => {
    setPostForm({
      title: "", slug: "", content: "", excerpt: "", status: "publish",
      featuredImage: "", author: `${session.user?.firstName || ""} ${session.user?.lastName || ""}`.trim(), accessLevel: "white", categoryIds: [],
    });
    setPostError(null);
    setEditingPost(null);
    setPostModal("create");
  };

  const openEditPost = (post: Post) => {
    const catIds = categories
      .filter(c => post.category_slugs?.includes(c.slug))
      .map(c => c.id);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      status: post.status,
      featuredImage: post.featured_image || "",
      author: post.author || "",
      accessLevel: post.access_level || "white",
      categoryIds: catIds,
    });
    setPostError(null);
    setEditingPost(post);
    setPostModal("edit");
  };

  const handleSavePost = async () => {
    setPostError(null);
    setPostSaving(true);
    try {
      if (postModal === "create") {
        const res = await fetch("/api/admin/content/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create");
      } else if (postModal === "edit" && editingPost) {
        const res = await fetch(`/api/admin/content/posts/${editingPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update");
      }
      setPostModal(null);
      fetchPosts(filterCategory || undefined);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setPostSaving(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Delete this post permanently?")) return;
    setDeletingPost(id);
    try {
      const res = await fetch(`/api/admin/content/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeletingPost(null);
    }
  };

  const handleFilterChange = (slug: string) => {
    setFilterCategory(slug);
    fetchPosts(slug || undefined);
  };

  const toggleCategoryId = (id: number) => {
    setPostForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Content</h1>
          <p className="text-gray-600">Create and manage posts and categories</p>
        </div>
        <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm">
          &larr; Back to Admin
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-900">{posts.length}</div>
          <div className="text-blue-700">Posts</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-900">{categories.length}</div>
          <div className="text-green-700">Categories</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-900">
            {posts.filter(p => p.status === "publish").length}
          </div>
          <div className="text-purple-700">Published</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === "posts"
              ? "border-red-900 text-red-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === "categories"
              ? "border-red-900 text-red-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Categories
        </button>
      </div>

      {/* ============== POSTS TAB ============== */}
      {activeTab === "posts" && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={openCreatePost}
              className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition text-sm font-medium"
            >
              New Post
            </button>
            <select
              value={filterCategory}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name} ({c.count})</option>
              ))}
            </select>
          </div>

          {/* Posts Error / Loading */}
          {postsError && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {postsError}
              <button onClick={() => fetchPosts(filterCategory || undefined)} className="ml-2 underline">Retry</button>
            </div>
          )}

          {postsLoading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-900 mx-auto mb-2"></div>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No posts found. Create one to get started.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
                          <div className="text-xs text-gray-400">{post.slug}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {post.category_names?.filter(Boolean).map((name, i) => (
                              <span key={i} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                {name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            post.access_level === "admin" ? "bg-purple-100 text-purple-800" :
                            post.access_level === "tiger" ? "bg-orange-100 text-orange-800" :
                            post.access_level === "maroon" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {post.access_level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            post.status === "publish" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openEditPost(post)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingPost === post.id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingPost === post.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============== CATEGORIES TAB ============== */}
      {activeTab === "categories" && (
        <div>
          <div className="mb-6">
            <button
              onClick={openCreateCategory}
              className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition text-sm font-medium"
            >
              New Category
            </button>
          </div>

          {catsError && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {catsError}
              <button onClick={fetchCategories} className="ml-2 underline">Retry</button>
            </div>
          )}

          {catsLoading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-900 mx-auto mb-2"></div>
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No categories yet. Create one to get started.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{cat.slug}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{cat.parentSlug || "-"}</td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">{cat.count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              disabled={deletingCat === cat.id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingCat === cat.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============== CATEGORY MODAL ============== */}
      {catModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {catModal === "create" ? "New Category" : "Edit Category"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCatForm(f => ({
                      ...f,
                      name,
                      slug: catModal === "create" ? generateSlug(name) : f.slug,
                    }));
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Category Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="category-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (optional)</label>
                <select
                  value={catForm.parentSlug}
                  onChange={(e) => setCatForm({ ...catForm, parentSlug: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {categories
                    .filter(c => c.id !== editingCat?.id)
                    .map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                </select>
              </div>
              {catError && <div className="text-red-600 text-sm">{catError}</div>}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setCatModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  disabled={catSaving || !catForm.name || !catForm.slug}
                  className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition text-sm font-medium disabled:opacity-50"
                >
                  {catSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============== POST MODAL ============== */}
      {postModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {postModal === "create" ? "New Post" : "Edit Post"}
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setPostForm(f => ({
                        ...f,
                        title,
                        slug: postModal === "create" ? generateSlug(title) : f.slug,
                      }));
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Post Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={postForm.slug}
                    onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="post-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Brief summary..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  rows={10}
                  placeholder="<p>Your content here...</p>"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={postForm.status}
                    onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                  <select
                    value={postForm.accessLevel}
                    onChange={(e) => setPostForm({ ...postForm, accessLevel: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="white">White (All Members)</option>
                    <option value="maroon">Maroon</option>
                    <option value="tiger">Tiger</option>
                    <option value="admin">Admin Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={postForm.author}
                    onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                <input
                  type="text"
                  value={postForm.featuredImage}
                  onChange={(e) => setPostForm({ ...postForm, featuredImage: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <label
                      key={c.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm cursor-pointer transition ${
                        postForm.categoryIds.includes(c.id)
                          ? "bg-red-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={postForm.categoryIds.includes(c.id)}
                        onChange={() => toggleCategoryId(c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              {postError && <div className="text-red-600 text-sm">{postError}</div>}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setPostModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={postSaving || !postForm.title || !postForm.slug}
                  className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition text-sm font-medium disabled:opacity-50"
                >
                  {postSaving ? "Saving..." : "Save Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
