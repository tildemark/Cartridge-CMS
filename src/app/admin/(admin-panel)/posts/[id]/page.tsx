import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await db.select({ title: posts.title }).from(posts).where(eq(posts.id, Number(id))).get();
    return { title: post ? `Edit: ${post.title}` : "Edit Post" };
  } catch {
    return { title: "Edit Post" };
  }
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  let post: any;
  try {
    post = await db.select().from(posts).where(eq(posts.id, Number(id))).get();
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <PostEditor
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content ?? "",
        excerpt: post.excerpt ?? "",
        status: post.status,
      }}
    />
  );
}
