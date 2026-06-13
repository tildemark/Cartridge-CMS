# Cartridge CMS

Cartridge CMS is a lightweight, plug-and-play Content Management System built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **SQLite (via better-sqlite3) with Drizzle ORM**. It is optimized for client websites, small business pages, and content-rich blogs.

## Key Features

- ⚡ **WordPress-like Installation Wizard**: First-start guided setup covering site metadata, administrator account creation, sample database seeding, and theme selection.
- 🛡️ **Role-Based Access Control (RBAC)**: Complete roles and permissions engine supporting Super Admin, Admin, Editor, Author, and Viewer levels.
- 🎨 **Theme Engine**: Plug-and-play local directories (`src/themes/[theme-name]`). Currently packaged with two modern designs:
  - **Clarity** (for small businesses)
  - **Prose** (content-focused typographic blog)
- 📝 **TipTap Editor Integration**: Full rich text support featuring titles, slugs, and a server-side TipTap JSON renderer.
- 📁 **Media Library**: Drag-and-drop uploads stored locally in `public/uploads` with full detail inspection and file deletion capabilities.
- 🚀 **Next.js 16 conventions**: Uses modern proxy routing (middleware.ts $\rightarrow$ proxy.ts) and NextAuth v5 session guards.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up the environment variables: Create a `.env.local` file:
   ```env
   AUTH_SECRET="some-random-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```
5. Navigate to `http://localhost:3000/setup` to run the first-install wizard.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Database**: SQLite
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5 (Credentials Provider)
- **Rich Editor**: TipTap v3
- **Icons**: Lucide React
