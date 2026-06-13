import Link from "next/link";
import type { ThemeContext } from "@/lib/themes/types";

interface FooterProps {
  ctx: ThemeContext;
}

export default function Footer({ ctx }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} {ctx.siteName}. Powered by{" "}
          <span className="text-indigo-500">Cartridge CMS</span>.
        </p>
        <nav className="flex gap-5" aria-label="Footer navigation">
          {ctx.footerMenu.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
