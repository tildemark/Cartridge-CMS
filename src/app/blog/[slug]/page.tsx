import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { buildThemeContext } from "@/lib/themes/engine";
import ClarityLayout from "@/themes/clarity/layouts/Default";
import TipTapRenderer from "@/components/editor/TipTapRenderer";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await db
      .select({ title: posts.title, excerpt: posts.excerpt })
      .from(posts)
      .where(eq(posts.slug, slug))
      .get();
    return {
      title: post?.title ?? "Post",
      description: post?.excerpt ?? undefined,
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const ctx = await buildThemeContext();

  let post: any;
  try {
    post = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        publishedAt: posts.publishedAt,
        status: posts.status,
        authorName: users.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.slug, slug))
      .get();
  } catch {
    notFound();
  }

  if (!post || post.status !== "published") notFound();

  return (
    <ClarityLayout ctx={ctx}>
      <article className="max-w-2xl mx-auto px-5 py-16">
        {/* Meta */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            {post.publishedAt && (
              <time>{new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
            )}
            {post.authorName && <span>· by {post.authorName}</span>}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg text-slate-500 mt-3 leading-relaxed">{post.excerpt}</p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          <TipTapRenderer content={post.content} />
        </div>
      </article>
    </ClarityLayout>
  );
}
