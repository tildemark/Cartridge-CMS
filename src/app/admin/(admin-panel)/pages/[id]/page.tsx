import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/PageEditor";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const page = await db
      .select({ title: pages.title })
      .from(pages)
      .where(eq(pages.id, Number(id)))
      .get();
    return { title: page ? `Edit: ${page.title}` : "Edit Page" };
  } catch {
    return { title: "Edit Page" };
  }
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;

  let page: any;
  try {
    page = await db.select().from(pages).where(eq(pages.id, Number(id))).get();
  } catch {
    notFound();
  }

  if (!page) notFound();

  return (
    <PageEditor
      initialData={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content ?? "",
        status: page.status,
        template: page.template ?? "default",
        sortOrder: page.sortOrder,
        parentId: page.parentId,
      }}
    />
  );
}
