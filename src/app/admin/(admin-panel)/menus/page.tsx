import { db } from "@/lib/db";
import { menus, menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Navigation, Link as LinkIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Menus" };

export default async function MenusPage() {
  let allMenus: any[] = [];
  let itemsByMenu: Record<number, any[]> = {};

  try {
    allMenus = await db.select().from(menus).all();
    for (const m of allMenus) {
      const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.menuId, m.id))
        .orderBy(menuItems.sortOrder)
        .all();
      itemsByMenu[m.id] = items;
    }
  } catch (e) {
    // DB not ready or no menus
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Menus</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage navigation menus across your website templates.</p>
      </div>

      {allMenus.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-20 text-center shadow-sm">
          <Navigation className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium">No menus defined</p>
          <p className="text-slate-400 text-sm mt-0.5">Install sample content during setup to view default menus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allMenus.map((menu) => {
            const items = itemsByMenu[menu.id] ?? [];
            return (
              <div key={menu.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Menu Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">{menu.name}</h2>
                    <span className="text-xs text-slate-400 font-mono capitalize">Location: {menu.location}</span>
                  </div>
                  <Navigation className="w-5 h-5 text-slate-400" />
                </div>

                {/* Items List */}
                <div className="p-5">
                  {items.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No links added to this menu.</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 hover:border-slate-300 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 flex-1">{item.label}</span>
                          <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 border border-slate-100 rounded">
                            {item.url || "/"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
