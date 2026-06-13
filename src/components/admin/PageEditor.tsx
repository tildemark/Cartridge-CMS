"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, ArrowLeft, Globe, FileText, Loader2, Settings } from "lucide-react";
import Link from "next/link";

// Dynamically import editor (client-only)
const RichEditor = dynamic(() => import("@/components/editor/RichEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-xl h-64 flex items-center justify-center bg-slate-50">
      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
    </div>
  ),
});

interface PageEditorProps {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    content: string;
    status: "draft" | "published" | "archived";
    template: string;
    sortOrder: number;
    parentId: number | null;
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PageEditor({ initialData }: PageEditorProps) {
  const router = useRouter();
  const isNew = !initialData?.id;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);
  const [content, setContent] = useState(initialData?.content ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(initialData?.status ?? "draft");
  const [template, setTemplate] = useState(initialData?.template ?? "default");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [parentId, setParentId] = useState<number | null>(initialData?.parentId ?? null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [availablePages, setAvailablePages] = useState<{ id: number; title: string }[]>([]);

  // Fetch sibling/parent pages to populate parent select
  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter out own page to avoid cycles
          const filtered = initialData?.id
            ? data.filter((p: any) => p.id !== initialData.id)
            : data;
          setAvailablePages(filtered);
        }
      })
      .catch((e) => console.error("Failed to load parent pages", e));
  }, [initialData?.id]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  }

  const handleContentChange = useCallback((json: string) => {
    setContent(json);
  }, []);

  async function handleSave(publishStatus?: "draft" | "published") {
    setSaving(true);
    setError(null);

    const finalStatus = publishStatus ?? status;

    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/pages" : `/api/pages/${initialData!.id}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          status: finalStatus,
          template,
          sortOrder: Number(sortOrder),
          parentId: parentId ? Number(parentId) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const data = await res.json();
      setSavedAt(new Date());
      setStatus(finalStatus);

      if (isNew && data.id) {
        router.push(`/admin/pages/${data.id}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/pages"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Pages
        </Link>

        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-xs text-slate-400">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}

          <button
            id="page-save-draft"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="btn-ghost btn-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          <button
            id="page-publish"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <input
              id="page-title"
              type="text"
              placeholder="Page title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl font-bold text-slate-800 placeholder:text-slate-300 border-none outline-none resize-none"
            />
            <div className="flex items-center gap-2 mt-2 border-t border-slate-100 pt-2">
              <span className="text-xs text-slate-400">Slug:</span>
              <span className="text-xs text-slate-500 font-mono">/</span>
              <input
                id="page-slug"
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                className="text-xs text-slate-600 bg-transparent border-none outline-none flex-1 font-mono"
                placeholder="page-slug"
              />
            </div>
          </div>

          {/* Content editor */}
          <RichEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Write your page content here…"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Status
            </h3>
            <select
              id="page-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            {!isNew && initialData?.id && (
              <Link
                href={`/${initialData.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                View page
              </Link>
            )}
          </div>

          {/* Page Attributes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              Page Attributes
            </h3>

            <div className="space-y-1">
              <label htmlFor="page-template" className="text-xs text-slate-500 font-medium">Template</label>
              <select
                id="page-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="default">Default Template</option>
                <option value="fullwidth">Full Width</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="page-parent" className="text-xs text-slate-500 font-medium">Parent Page</label>
              <select
                id="page-parent"
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">(None)</option>
                {availablePages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="page-sort" className="text-xs text-slate-500 font-medium">Order</label>
              <input
                id="page-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
