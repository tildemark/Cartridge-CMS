import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { buildThemeContext } from "@/lib/themes/engine";
import ClarityLayout from "@/themes/clarity/layouts/Default";
import PostCard from "@/themes/clarity/components/PostCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const perPage = 10;
  const offset = (currentPage - 1) * perPage;

  const ctx = await buildThemeContext();

  let allPosts: any[] = [];
  let totalPages = 1;

  try {
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.status, "published"));

    totalPages = Math.max(1, Math.ceil(total / perPage));

    allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        publishedAt: posts.publishedAt,
        authorName: users.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(perPage)
      .offset(offset)
      .all();
  } catch {
    // DB not ready
  }

  return (
    <ClarityLayout ctx={ctx}>
      <div className="max-w-5xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Blog</h1>
        <p className="text-slate-500 mb-10">Thoughts, stories, and ideas.</p>

        {allPosts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {currentPage > 1 && (
              <Link href={`/blog?page=${currentPage - 1}`} className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">
                ← Previous
              </Link>
            )}
            <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages && (
              <Link href={`/blog?page=${currentPage + 1}`} className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </ClarityLayout>
  );
}
