"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, User, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    roleName?: string;
  };
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Breadcrumb placeholder (filled by pages) */}
      <div id="topbar-breadcrumb" />

      {/* Right: Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5 rounded hover:bg-slate-100"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Site
        </Link>

        {/* Notifications placeholder */}
        <button
          id="topbar-notifications"
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            id="topbar-user-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-slate-700 leading-tight">{user.name}</div>
              <div className="text-xs text-slate-400 leading-tight">{user.roleName}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-sm font-medium text-slate-700 truncate">{user.name}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
              <Link
                href="/admin/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <button
                id="topbar-signout"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
