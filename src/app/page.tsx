import { getActiveTheme, buildThemeContext } from "@/lib/themes/engine";
import ClarityLayout from "@/themes/clarity/layouts/Default";
import PostCard from "@/themes/clarity/components/PostCard";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import { getSetting } from "@/lib/db/settings";
import { Monitor, Zap, ShieldCheck, Compass, Sparkles, Star, Quote } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteName = await getSetting("site_name");
    const siteDescription = await getSetting("site_description");
    return {
      title: siteName ?? "Welcome",
      description: siteDescription ?? undefined,
    };
  } catch {
    return { title: "Welcome" };
  }
}

export default async function HomePage() {
  const ctx = await buildThemeContext();

  let recentPosts: any[] = [];
  try {
    recentPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(3)
      .all();
  } catch {
    // DB not ready
  }

  const services = [
    {
      icon: Monitor,
      title: "Responsive Design",
      desc: "Pixel-perfect rendering across modern desktops, tablets, and mobile devices.",
      color: "text-blue-500 bg-blue-50 border-blue-100",
    },
    {
      icon: Zap,
      title: "Blazing Performance",
      desc: "Optimized static build output with Next.js 16 and SQLite for instant load speeds.",
      color: "text-amber-500 bg-amber-50 border-amber-100",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Security",
      desc: "Fully equipped with Role-Based Access Control and secure NextAuth v5 session guards.",
      color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    },
    {
      icon: Compass,
      title: "Extensible Theme Engine",
      desc: "Drop-in visual theme components and layout templates with absolute styling control.",
      color: "text-indigo-500 bg-indigo-50 border-indigo-100",
    },
  ];

  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "99.9%", label: "System Uptime" },
    { value: "24/7", label: "Dedicated Support" },
    { value: "100%", label: "Open Source" },
  ];

  const testimonials = [
    {
      quote: "uDesign's layout flexibility is unmatched. Recreating it on Cartridge CMS with Tailwind v4 has given us a blazing fast, secure site that matches our design criteria perfectly.",
      author: "Sarah Jenkins",
      role: "Digital Architect, VeloMedia",
      stars: 5,
    },
    {
      quote: "The visual presentation of the clarity theme is outstanding. It has minimal weight and executes faster than standard heavy WordPress templates.",
      author: "Marcus Aurelius",
      role: "Lead Engineer, TechGroup",
      stars: 5,
    },
  ];

  return (
    <ClarityLayout ctx={ctx}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-5 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        {/* Background visual grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            Loved by 50K+ Happy Customers
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Build Beautiful Websites with <span className="text-indigo-600">Minimal Effort</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {ctx.siteDescription || "Cartridge CMS delivers a powerful, secure, and modern design system designed to elevate your client websites and business landing pages."}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/blog"
              className="w-full sm:w-auto bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200"
            >
              Explore the Blog
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-7 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Services/Features Grid */}
      <section className="py-20 px-5 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Core Offerings</h2>
          <p className="text-slate-500 text-base">We provide all key layout builders and secure frameworks to get your client sites running smoothly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-5 hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 text-lg">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Counter Stats Section */}
      <section className="bg-slate-900 text-white py-16 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950/20" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1.5">
              <div className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tight">{stat.value}</div>
              <div className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-5 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What Our Clients Say</h2>
            <p className="text-slate-500 text-base">Read feedback from agencies and designers who transitioned to Cartridge CMS.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-600 text-sm leading-relaxed relative pl-6">
                    <Quote className="w-4 h-4 text-slate-300 absolute left-0 top-1 rotate-180 fill-slate-100" />
                    {t.quote}
                  </blockquote>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="font-bold text-slate-800 text-sm">{t.author}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts Grid */}
      {recentPosts.length > 0 && (
        <section className="py-20 px-5 max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Latest from the Blog</h2>
              <p className="text-slate-400 text-sm">Read the latest web development and content management logs.</p>
            </div>
            <Link href="/blog" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">View all posts →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </ClarityLayout>
  );
}
