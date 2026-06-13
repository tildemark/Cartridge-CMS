import { getActiveTheme, buildThemeContext } from "@/lib/themes/engine";
import ClarityLayout from "@/themes/clarity/layouts/Default";
import PostCard from "@/themes/clarity/components/PostCard";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import { getSetting } from "@/lib/db/settings";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteName = await getSetting("site_name");
    const siteDescription = await getSetting("site_description");
    return {
      title: siteName ?? "Welcome",
      description: siteDescription ?? undefined,
    };
  } catch {
    return { title: "Welcome" };
  }
}

export default async function HomePage() {
  const ctx = await buildThemeContext();

  let recentPosts: any[] = [];
  try {
    recentPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(6)
      .all();
  } catch {
    // DB not ready
  }

  return (
    <ClarityLayout ctx={ctx}>
      {/* Hero */}
      <section className="py-20 px-5 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
            {ctx.siteName}
          </h1>
          {ctx.siteDescription && (
            <p className="text-xl text-slate-500 mb-8 leading-relaxed">{ctx.siteDescription}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/blog"
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Read the Blog
            </Link>
            <Link
              href="/about"
              className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Latest Posts</h2>
              <Link href="/blog" className="text-sm text-indigo-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </ClarityLayout>
  );
}
