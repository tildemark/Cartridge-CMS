import PageEditor from "@/components/admin/PageEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Page" };

export default function NewPage() {
  return <PageEditor />;
}
