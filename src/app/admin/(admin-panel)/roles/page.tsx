import { db } from "@/lib/db";
import { roles, rolePermissions } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Shield, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  let allRoles: any[] = [];
  let permissionCounts: Record<number, number> = {};

  try {
    allRoles = await db.select().from(roles).all();
    for (const r of allRoles) {
      const [c] = await db
        .select({ count: count() })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, r.id))
        .all();
      permissionCounts[r.id] = c.count;
    }
  } catch (e) {
    // DB not ready
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Roles</h1>
        <p className="text-slate-500 text-sm mt-0.5">View user roles and Role-Based Access Control (RBAC) scopes.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {allRoles.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium">No roles available</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Role Name</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Slug</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Permissions</th>
                <th className="px-5 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    {role.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{role.slug}</td>
                  <td className="px-5 py-3.5 text-slate-500">{role.description ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-semibold">
                    {permissionCounts[role.id] ?? 0} active
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {role.isSystem && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                        <Lock className="w-2.5 h-2.5" />
                        System
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
