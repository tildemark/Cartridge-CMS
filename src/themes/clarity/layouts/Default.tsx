import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ThemeContext } from "@/lib/themes/types";

interface LayoutProps {
  ctx: ThemeContext;
  children: React.ReactNode;
}

export default function ClarityLayout({ ctx, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-slate-800">
      <Header ctx={ctx} />
      <main className="flex-1">{children}</main>
      <Footer ctx={ctx} />
    </div>
  );
}
