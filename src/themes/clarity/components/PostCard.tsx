import Link from "next/link";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: string | null;
    authorName?: string | null;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Decorative gradient header block */}
      <div className="h-36 bg-gradient-to-br from-indigo-100 to-violet-100" />
      <div className="p-5">
        <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 transition-colors">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
          {post.authorName && <span>By {post.authorName}</span>}
          {post.publishedAt && (
            <time>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}
