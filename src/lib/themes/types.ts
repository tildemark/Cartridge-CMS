/**
 * Theme metadata contract — must exist as theme.json in each theme directory.
 */
export interface ThemeMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  preview?: string; // relative path to preview image
}

/**
 * Data passed to a theme's layout component.
 */
export interface ThemeContext {
  siteName: string;
  siteDescription: string;
  primaryMenu: ThemeMenuItem[];
  footerMenu: ThemeMenuItem[];
}

export interface ThemeMenuItem {
  id: number;
  label: string;
  url: string;
  children?: ThemeMenuItem[];
}

/**
 * Props for theme page components (home, page, post, blog).
 */
export interface ThemePageProps {
  ctx: ThemeContext;
  children?: React.ReactNode;
}

export interface ThemePostProps {
  ctx: ThemeContext;
  post: {
    title: string;
    content: string; // TipTap JSON string
    excerpt: string | null;
    publishedAt: string | null;
    authorName: string | null;
  };
}

export interface ThemeBlogProps {
  ctx: ThemeContext;
  posts: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: string | null;
    authorName: string | null;
  }[];
  page: number;
  totalPages: number;
}
