"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Image,
  Palette,
  Navigation,
  Settings,
  Users,
  Shield,
  Tags,
  Zap,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/admin/posts", label: "Posts", icon: FileText, permission: "posts:view" },
  { href: "/admin/pages", label: "Pages", icon: BookOpen, permission: "pages:view" },
  { href: "/admin/media", label: "Media", icon: Image, permission: "media:view" },
  { href: "/admin/categories", label: "Categories", icon: Tags, permission: "categories:manage" },
  { href: "/admin/menus", label: "Menus", icon: Navigation, permission: "menus:view" },
  { href: "/admin/themes", label: "Themes", icon: Palette, permission: "themes:view" },
  { href: "/admin/users", label: "Users", icon: Users, permission: "users:view" },
  { href: "/admin/roles", label: "Roles", icon: Shield, permission: "roles:view" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings:view" },
];

interface AdminSidebarProps {
  permissions: string[];
}

export default function AdminSidebar({ permissions }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-400 transition-colors">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Cartridge</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5" aria-label="Admin navigation">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 group
                ${active
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-indigo-400" />}
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-indigo-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          View site
        </Link>
      </div>
    </aside>
  );
}
