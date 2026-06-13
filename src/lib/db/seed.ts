/**
 * RBAC seed data — default roles and all permissions.
 * Run once during initial DB setup (setup wizard finish step).
 */

export const DEFAULT_ROLES = [
  {
    slug: "super_admin",
    name: "Super Admin",
    description: "Full unrestricted access to everything.",
    isSystem: true,
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Full content + settings access. Cannot manage super admins.",
    isSystem: true,
  },
  {
    slug: "editor",
    name: "Editor",
    description: "Can manage all content (posts, pages, media) but not settings or users.",
    isSystem: true,
  },
  {
    slug: "author",
    name: "Author",
    description: "Can create and edit their own posts only.",
    isSystem: true,
  },
  {
    slug: "viewer",
    name: "Viewer",
    description: "Read-only access to the admin panel.",
    isSystem: true,
  },
] as const;

export const ALL_PERMISSIONS = [
  // Dashboard
  { name: "dashboard:view", group: "dashboard", description: "View the admin dashboard" },

  // Posts
  { name: "posts:view", group: "posts", description: "View all posts" },
  { name: "posts:create", group: "posts", description: "Create new posts" },
  { name: "posts:edit_own", group: "posts", description: "Edit own posts" },
  { name: "posts:edit_others", group: "posts", description: "Edit posts by other users" },
  { name: "posts:publish", group: "posts", description: "Publish / unpublish posts" },
  { name: "posts:delete_own", group: "posts", description: "Delete own posts" },
  { name: "posts:delete_others", group: "posts", description: "Delete posts by other users" },

  // Pages
  { name: "pages:view", group: "pages", description: "View all pages" },
  { name: "pages:create", group: "pages", description: "Create new pages" },
  { name: "pages:edit", group: "pages", description: "Edit any page" },
  { name: "pages:publish", group: "pages", description: "Publish / unpublish pages" },
  { name: "pages:delete", group: "pages", description: "Delete pages" },

  // Media
  { name: "media:view", group: "media", description: "Browse the media library" },
  { name: "media:upload", group: "media", description: "Upload files" },
  { name: "media:delete", group: "media", description: "Delete media files" },

  // Categories
  { name: "categories:manage", group: "categories", description: "Create, edit, delete categories" },

  // Menus
  { name: "menus:view", group: "menus", description: "View menus" },
  { name: "menus:edit", group: "menus", description: "Edit menus and menu items" },

  // Themes
  { name: "themes:view", group: "themes", description: "View installed themes" },
  { name: "themes:switch", group: "themes", description: "Switch the active theme" },

  // Settings
  { name: "settings:view", group: "settings", description: "View site settings" },
  { name: "settings:edit", group: "settings", description: "Edit site settings" },

  // Users
  { name: "users:view", group: "users", description: "View user list" },
  { name: "users:create", group: "users", description: "Create new users" },
  { name: "users:edit", group: "users", description: "Edit user profiles and roles" },
  { name: "users:delete", group: "users", description: "Delete users" },

  // Roles
  { name: "roles:view", group: "roles", description: "View roles and permissions" },
  { name: "roles:manage", group: "roles", description: "Create and edit roles" },
] as const;

export type PermissionName = (typeof ALL_PERMISSIONS)[number]["name"];

// Which permissions each role gets by default
export const ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
  super_admin: ALL_PERMISSIONS.map((p) => p.name),

  admin: ALL_PERMISSIONS.filter(
    (p) => !["roles:manage", "users:delete"].includes(p.name)
  ).map((p) => p.name),

  editor: [
    "dashboard:view",
    "posts:view", "posts:create", "posts:edit_own", "posts:edit_others",
    "posts:publish", "posts:delete_own", "posts:delete_others",
    "pages:view", "pages:create", "pages:edit", "pages:publish", "pages:delete",
    "media:view", "media:upload", "media:delete",
    "categories:manage",
    "menus:view", "menus:edit",
  ],

  author: [
    "dashboard:view",
    "posts:view", "posts:create", "posts:edit_own", "posts:delete_own",
    "media:view", "media:upload",
  ],

  viewer: [
    "dashboard:view",
    "posts:view",
    "pages:view",
    "media:view",
  ],
};
