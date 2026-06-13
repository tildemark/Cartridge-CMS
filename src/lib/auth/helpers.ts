import { auth } from "@/lib/auth/config";
import type { PermissionName } from "@/lib/db/seed";

/**
 * Get the current session (server-side).
 * Throws if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Check if the current user has a specific permission.
 */
export async function hasPermission(permission: PermissionName): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return (session.user.permissions ?? []).includes(permission);
}

/**
 * Assert the current user has a permission. Throws 403 if not.
 */
export async function requirePermission(permission: PermissionName): Promise<void> {
  const ok = await hasPermission(permission);
  if (!ok) {
    throw new Error(`Forbidden: missing permission "${permission}"`);
  }
}
