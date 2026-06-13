import { db } from "@/lib/db";
import { pages, users } from "@/lib/db/schema";
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
    const page = await db
      .select({ title: pages.title })
      .from(pages)
      .where(eq(pages.slug, slug))
      .get();
    return { title: page?.title ?? "Page" };
  } catch {
    return { title: "Page" };
  }
}

export default async function PublicPageRoute({ params }: Props) {
  const { slug } = await params;
  const ctx = await buildThemeContext();

  let page: any;
  try {
    page = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        content: pages.content,
        status: pages.status,
      })
      .from(pages)
      .where(eq(pages.slug, slug))
      .get();
  } catch {
    notFound();
  }

  if (!page || page.status !== "published") notFound();

  return (
    <ClarityLayout ctx={ctx}>
      <div className="max-w-2xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">{page.title}</h1>
        <div className="prose prose-slate max-w-none">
          <TipTapRenderer content={page.content} />
        </div>
      </div>
    </ClarityLayout>
  );
}
