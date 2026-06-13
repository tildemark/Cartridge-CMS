import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { PenLine, Plus, FileText, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Posts" };

export default async function PostsPage() {
  let allPosts: any[] = [];
  let total = 0;

  try {
    allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        authorName: users.name,
        publishedAt: posts.publishedAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.updatedAt))
      .all();

    const [c] = await db.select({ count: count() }).from(posts);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Posts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          id="posts-new-btn"
          className="btn-primary btn-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {allPosts.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No posts yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Start by creating your first post.</p>
            <Link href="/admin/posts/new" className="btn-primary btn-sm inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Create Post
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Author</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <div className="text-xs text-slate-400 mt-0.5">/blog/{post.slug}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{post.authorName ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[post.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/posts/${post.id}`}
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
