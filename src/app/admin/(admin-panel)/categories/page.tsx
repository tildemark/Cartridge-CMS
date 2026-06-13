"use client";

import { useState, useEffect } from "react";
import { Tags, Plus, Trash2, Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug
    setSlug(
      val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFormError("Name and slug are required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to create category");
      }

      setName("");
      setSlug("");
      setDescription("");
      await fetchCategories();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to delete category");
      }

      await fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
        <p className="text-slate-500 text-sm mt-0.5">Organize your blog posts into taxonomies.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 self-start space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Add New Category</h2>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              ⚠ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Name</label>
              <input
                type="text"
                placeholder="News & Announcements"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Slug</label>
              <input
                type="text"
                placeholder="news-announcements"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Description</label>
              <textarea
                placeholder="A brief description of this category…"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary font-semibold text-sm py-2 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Category
            </button>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-20 text-center shadow-sm">
              <Tags className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">No categories created yet</p>
              <p className="text-slate-400 text-sm mt-0.5">Add a new category on the left side.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-55 bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Slug</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Description</th>
                    <th className="px-5 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">/{c.slug}</td>
                      <td className="px-5 py-3.5 text-slate-500 line-clamp-1">{c.description ?? "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
