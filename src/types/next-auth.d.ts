import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    roleId: number;
    roleSlug: string;
    roleName: string;
    permissions: string[];
  }

  interface Session {
    user: User & {
      id: string;
      roleId: number;
      roleSlug: string;
      roleName: string;
      permissions: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: number;
    roleSlug: string;
    roleName: string;
    permissions: string[];
  }
}
