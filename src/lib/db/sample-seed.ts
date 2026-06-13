import { db } from "@/lib/db";
import { posts, pages, menus, menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Reusable Helper to make TipTap JSON documents
function makeTipTapDoc(title: string, paragraphs: string[]): string {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: title }],
      },
      ...paragraphs.map((text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      })),
    ],
  });
}

export async function seedSampleContent(authorId: number) {
  // 1. Check if we already have seeded content to avoid duplicates
  const existingPages = await db.select().from(pages).limit(1).all();
  if (existingPages.length > 0) {
    return; // Already has content
  }

  // 2. Insert Pages
  const seededPages = [
    {
      title: "Home",
      slug: "home",
      content: makeTipTapDoc("Welcome to Cartridge CMS", [
        "Cartridge CMS is a lightweight, customizable, and enterprise-grade content management system built with Next.js 16, TypeScript, SQLite, and Tailwind CSS v4.",
        "This is your homepage. You can customize this layout by modifying the theme layouts, templates, and widgets. Use our admin dashboard to manage posts, pages, and themes with ease.",
      ]),
      status: "published" as const,
      authorId,
      template: "default",
      sortOrder: 0,
    },
    {
      title: "About Us",
      slug: "about",
      content: makeTipTapDoc("About Cartridge CMS", [
        "Founded on the principle of simplicity and speed, Cartridge CMS delivers a plug-and-play experience for business websites, small business owners, and bloggers alike.",
        "Our mission is to bridge the gap between simple, static site generators and heavy, complex enterprise CMS engines. We provide clean design, robust security, and full API accessibility out of the box.",
      ]),
      status: "published" as const,
      authorId,
      template: "default",
      sortOrder: 1,
    },
    {
      title: "Services",
      slug: "services",
      content: makeTipTapDoc("Our Services", [
        "We offer a variety of professional web development and digital solutions tailored to elevate your business presence online.",
        "1. Web Design & Prototyping - High-fidelity, user-centered interface designs.",
        "2. Content Strategy - Custom theme development and responsive visual layouts.",
        "3. Performance Audit - Blazing fast PageSpeed optimizations and SEO foundations.",
      ]),
      status: "published" as const,
      authorId,
      template: "default",
      sortOrder: 2,
    },
    {
      title: "Contact Us",
      slug: "contact",
      content: makeTipTapDoc("Get in Touch", [
        "Have questions? Need a custom solution? Reach out to our team of specialists.",
        "Email: contact@cartridgecms.com | Phone: +1 (555) 019-2834",
        "Or visit our main office at 100 Main Street, Suite 400, Tech City, USA.",
      ]),
      status: "published" as const,
      authorId,
      template: "default",
      sortOrder: 3,
    },
    {
      title: "Privacy Policy",
      slug: "privacy",
      content: makeTipTapDoc("Privacy Policy", [
        "This policy governs how we collect, store, and utilize user information across our site.",
        "We do not sell or lease user data. All collected logs are strictly used to optimize local performance metrics and secure the administrative gateway.",
      ]),
      status: "published" as const,
      authorId,
      template: "default",
      sortOrder: 4,
    },
    {
      title: "Terms of Service",
      slug: "terms",
      content: makeTipTapDoc("Terms of Service", [
        "By accessing and using this site, you agree to be bound by these service terms.",
        "You are solely responsible for all content published through your instance of Cartridge CMS. We provide the software 'as is' without warranties of any kind.",
      ]),
      status: "published" as const,
      authorId,
      template: "default",
      sortOrder: 5,
    },
  ];

  const pageIds: Record<string, number> = {};
  for (const pageData of seededPages) {
    const inserted = await db.insert(pages).values(pageData).returning({ id: pages.id }).get();
    pageIds[pageData.slug] = inserted.id;
  }

  // 3. Insert Posts
  const seededPosts = [
    {
      title: "Introducing Cartridge CMS",
      slug: "introducing-cartridge-cms",
      content: makeTipTapDoc("Welcome to a New Class of CMS", [
        "We are proud to announce the first release of Cartridge CMS. Our core goal has always been simple: build a developer-friendly CMS that business clients love using.",
        "Featuring a beautiful Tailwind-based admin control panel, full Role-Based Access Control (RBAC), and standard TipTap rich text, Cartridge CMS handles the heavy lifting so you can focus on building beautiful user experiences.",
      ]),
      excerpt: "Learn about the philosophy and design behind the new plug-and-play Cartridge CMS.",
      status: "published" as const,
      authorId,
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Mastering Tailwind CSS v4 in Production",
      slug: "mastering-tailwind-v4",
      content: makeTipTapDoc("The Future of Utility-First CSS", [
        "Tailwind CSS v4 brings incredible performance boosts, native CSS variable integrations, and a streamlined engine built for modern compilers.",
        "In this guide, we dive deep into configuring the theme options, optimizing bundle sizes with CSS variables, and utilizing Tailwind's new color palettes to make interfaces that feel premium and state of the art.",
      ]),
      excerpt: "Deep dive into features, performance, and color options of Tailwind CSS v4.",
      status: "published" as const,
      authorId,
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      title: "Why SQLite is Perfect for Most Small Business Sites",
      slug: "why-sqlite-is-perfect",
      content: makeTipTapDoc("Rethinking Database Scalability", [
        "Many developers default to hosted PostgreSQL or MySQL without questioning if it's truly needed. For most small business sites with moderate traffic, SQLite is incredibly fast, simple to backup, and highly cost-efficient.",
        "With SQLite running in WAL (Write-Ahead Logging) mode, it easily handles concurrent reads and writes, simplifying infrastructure without compromising on responsiveness.",
      ]),
      excerpt: "Uncover the scaling capability and ease of SQLite for client and small business websites.",
      status: "published" as const,
      authorId,
      publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
  ];

  for (const postData of seededPosts) {
    await db.insert(posts).values(postData).run();
  }

  // 4. Create Menus
  const primaryMenu = await db
    .insert(menus)
    .values({ name: "Primary Menu", location: "primary" })
    .returning({ id: menus.id })
    .get();

  const footerMenu = await db
    .insert(menus)
    .values({ name: "Footer Menu", location: "footer" })
    .returning({ id: menus.id })
    .get();

  // 5. Create Menu Items
  const primaryItems = [
    { label: "Home", url: "/", pageId: pageIds["home"], sortOrder: 0 },
    { label: "Blog", url: "/blog", sortOrder: 1 },
    { label: "About", url: "/about", pageId: pageIds["about"], sortOrder: 2 },
    { label: "Services", url: "/services", pageId: pageIds["services"], sortOrder: 3 },
    { label: "Contact", url: "/contact", pageId: pageIds["contact"], sortOrder: 4 },
  ];

  const footerItems = [
    { label: "Privacy Policy", url: "/privacy", pageId: pageIds["privacy"], sortOrder: 0 },
    { label: "Terms of Service", url: "/terms", pageId: pageIds["terms"], sortOrder: 1 },
  ];

  for (const item of primaryItems) {
    await db.insert(menuItems).values({ menuId: primaryMenu.id, ...item }).run();
  }

  for (const item of footerItems) {
    await db.insert(menuItems).values({ menuId: footerMenu.id, ...item }).run();
  }
}
