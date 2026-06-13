import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, roles, rolePermissions, permissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            passwordHash: users.passwordHash,
            isActive: users.isActive,
            roleId: users.roleId,
            roleSlug: roles.slug,
            roleName: roles.name,
          })
          .from(users)
          .innerJoin(roles, eq(users.roleId, roles.id))
          .where(eq(users.email, email))
          .get();

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Load permissions for this role
        const perms = await db
          .select({ name: permissions.name })
          .from(rolePermissions)
          .innerJoin(
            permissions,
            eq(rolePermissions.permissionId, permissions.id)
          )
          .where(eq(rolePermissions.roleId, user.roleId))
          .all();

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          roleSlug: user.roleSlug,
          roleName: user.roleName,
          permissions: perms.map((p) => p.name),
        };
      },
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      // Allow setup, login, api, public paths
      if (
        pathname.startsWith("/setup") ||
        pathname.startsWith("/admin/login") ||
        pathname.startsWith("/api") ||
        !pathname.startsWith("/admin")
      ) {
        return true;
      }
      return !!auth;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = (user as any).roleId;
        token.roleSlug = (user as any).roleSlug;
        token.roleName = (user as any).roleName;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roleId = token.roleId as number;
      session.user.roleSlug = token.roleSlug as string;
      session.user.roleName = token.roleName as string;
      session.user.permissions = token.permissions as string[];
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
