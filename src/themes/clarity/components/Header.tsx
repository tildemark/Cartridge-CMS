import Link from "next/link";
import type { ThemeContext } from "@/lib/themes/types";

interface HeaderProps {
  ctx: ThemeContext;
}

export default function Header({ ctx }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur z-10">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
          {ctx.siteName}
        </Link>
        <nav className="flex items-center gap-6" aria-label="Primary navigation">
          {ctx.primaryMenu.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
