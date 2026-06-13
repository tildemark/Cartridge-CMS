import { db } from "@/lib/db";
import { posts, pages, media, users } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import {
  FileText,
  BookOpen,
  Image,
  Users as UsersIcon,
  TrendingUp,
  Clock,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getStats() {
  try {
    const [postCount] = await db.select({ count: count() }).from(posts);
    const [pageCount] = await db.select({ count: count() }).from(pages);
    const [mediaCount] = await db.select({ count: count() }).from(media);
    const [userCount] = await db.select({ count: count() }).from(users);

    const recentPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .orderBy(desc(posts.updatedAt))
      .limit(5)
      .all();

    const publishedPostCount = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.status, "published"));

    return {
      postCount: postCount.count,
      pageCount: pageCount.count,
      mediaCount: mediaCount.count,
      userCount: userCount.count,
      publishedPostCount: publishedPostCount[0].count,
      recentPosts,
    };
  } catch {
    return {
      postCount: 0,
      pageCount: 0,
      mediaCount: 0,
      userCount: 0,
      publishedPostCount: 0,
      recentPosts: [],
    };
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getStats();

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here&apos;s an overview of your website.
          </p>
        </div>
        <Link href="/admin/posts/new" id="dashboard-new-post" className="btn-primary btn-sm flex items-center gap-1.5">
          <PenLine className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Posts" value={stats.postCount} icon={FileText} href="/admin/posts" accent="bg-blue-500" />
        <StatCard label="Pages" value={stats.pageCount} icon={BookOpen} href="/admin/pages" accent="bg-violet-500" />
        <StatCard label="Media Files" value={stats.mediaCount} icon={Image} href="/admin/media" accent="bg-amber-500" />
        <StatCard label="Users" value={stats.userCount} icon={UsersIcon} href="/admin/users" accent="bg-emerald-500" />
      </div>

      {/* Published vs Draft */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Post Status</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Published</span>
                <span className="font-semibold text-slate-800">{stats.publishedPostCount}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: stats.postCount > 0
                      ? `${(stats.publishedPostCount / stats.postCount) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Drafts</span>
                <span className="font-semibold text-slate-800">{stats.postCount - stats.publishedPostCount}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{
                    width: stats.postCount > 0
                      ? `${((stats.postCount - stats.publishedPostCount) / stats.postCount) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-700">Recent Posts</h2>
            </div>
            <Link href="/admin/posts" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>

          {stats.recentPosts.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No posts yet.</p>
              <Link href="/admin/posts/new" className="text-xs text-indigo-600 hover:underline mt-1 block">
                Create your first post →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between py-2.5 group">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-sm text-slate-700 hover:text-indigo-600 font-medium truncate flex-1 transition-colors"
                  >
                    {post.title}
                  </Link>
                  <span className={`
                    ml-3 px-2 py-0.5 text-xs rounded-full flex-shrink-0
                    ${post.status === "published" ? "bg-emerald-100 text-emerald-700" :
                      post.status === "archived" ? "bg-slate-100 text-slate-500" :
                      "bg-amber-100 text-amber-700"}
                  `}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/posts/new", label: "New Post", icon: FileText },
            { href: "/admin/pages/new", label: "New Page", icon: BookOpen },
            { href: "/admin/media", label: "Upload Media", icon: Image },
            { href: "/admin/settings", label: "Settings", icon: UsersIcon },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              id={`quick-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-sm text-slate-600 hover:text-indigo-700 transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
