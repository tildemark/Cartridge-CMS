import { db } from "@/lib/db";
import { pages, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage() {
  let allPages: any[] = [];
  let total = 0;

  try {
    allPages = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        status: pages.status,
        authorName: users.name,
        template: pages.template,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .orderBy(desc(pages.updatedAt))
      .all();

    const [c] = await db.select({ count: count() }).from(pages);
    total = c.count;
  } catch {
    // DB not initialized yet
  }

  const statusColor: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pages</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total</p>
        </div>
        <Link href="/admin/pages/new" id="pages-new-btn" className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {allPages.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pages yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Create your first page.</p>
            <Link href="/admin/pages/new" className="btn-primary btn-sm inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Create Page
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Template</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-medium text-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      {page.title}
                    </Link>
                    <div className="text-xs text-slate-400 mt-0.5">/{page.slug}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 capitalize">{page.template ?? "default"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[page.status] ?? ""}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
