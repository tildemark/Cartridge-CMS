import PostEditor from "@/components/admin/PostEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Post" };

export default function NewPostPage() {
  return <PostEditor />;
}
