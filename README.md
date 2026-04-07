# Portfolio Admin

Portfolio Admin is a Next.js admin dashboard for managing the content behind a personal portfolio website. It provides a protected admin workspace for updating profile details, education, experience, skills, projects, and incoming contact messages.

This repository is the admin frontend. It does not expose its own API routes and expects a separate backend server to be running.

## Overview

The app is built with the Next.js App Router and uses a client-heavy admin flow:

- Admin login at `/auth/login`
- Cookie-based route protection with Next.js middleware
- Dashboard summary cards powered by portfolio API data
- CRUD-style portfolio management screens
- Contact inbox with read/delete actions
- Responsive sidebar layout and command palette search

## Main Features

- Profile details management
- Education management
- Experience management
- Skills management
- Projects management
- Contact message review
- Protected dashboard routes
- Persistent auth state with cookie + local storage
- React Query-powered data fetching and cache invalidation

## Tech Stack

### Core

- Next.js 15.5.9
- React 19
- TypeScript 5
- App Router architecture

### Styling and UI

- Tailwind CSS 4
- `@tailwindcss/postcss`
- `tw-animate-css` and `tailwindcss-animate`
- shadcn/ui component structure
- Radix UI primitives
- Lucide React and Tabler Icons
- Geist fonts via `next/font`

### Data and State

- Axios for API requests
- TanStack React Query for server state
- Zustand with `persist` middleware for auth state
- `js-cookie` for token storage
- `nuqs` for URL search param state
- TanStack React Table for the contacts table

### Forms and Validation

- React Hook Form
- Zod
- `@hookform/resolvers`

### Other Notable Libraries

- KBar for command palette search
- `@pheralb/toast` and Sonner for notifications
- `react-dropzone` for file upload UI
- `date-fns`, `moment`, `recharts`, and other UI helpers

## Current Architecture

The active source code shows this project is primarily a frontend admin panel.

- API calls are centralized in `src/lib/apis.ts`
- Auth state lives in `src/hooks/use-auth.ts`
- Route protection is handled in `src/middleware.ts`
- Dashboard routes live under `src/app/(routes)/dashboard`
- Shared UI primitives live under `src/components/ui`

There are backend-oriented packages in `package.json`, but the current `src` codebase operates as a frontend client that talks to an external portfolio server.

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

Notes:

- If `NEXT_PUBLIC_SERVER_URL` is not set, the app falls back to `http://localhost:3001`
- The frontend expects the backend API to be available under `/api` and `/api/admin`

## Backend API Expected By This Frontend

### Public endpoints

- `GET /api/portfolio`
- `GET /api/profile`
- `GET /api/education`
- `GET /api/experiences`
- `GET /api/skills`
- `GET /api/projects`

### Admin endpoints

- `POST /api/admin/login`
- `GET /api/admin/contacts`
- `PUT /api/admin/contacts/:id/read`
- `DELETE /api/admin/contacts/:id`
- `POST /api/admin/profile`
- `PUT /api/admin/profile/:id`
- `POST /api/admin/education`
- `PUT /api/admin/education/:id`
- `DELETE /api/admin/education/:id`
- `POST /api/admin/experiences`
- `PUT /api/admin/experiences/:id`
- `DELETE /api/admin/experiences/:id`
- `POST /api/admin/skills`
- `PUT /api/admin/skills/:id`
- `DELETE /api/admin/skills/:id`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

## Authentication Flow

- Successful login stores the token in the `portfolio-admin-token` cookie
- Zustand persists auth data in local storage under `portfolio-admin-auth`
- Next.js middleware redirects unauthenticated users to `/auth/login`
- Authenticated users are redirected from `/auth/login` to `/dashboard`

## Getting Started

### Prerequisites

- Node.js 20 or newer, or Bun
- A running portfolio backend server

### Recommended Setup With Bun

```bash
bun install
bun run dev
```

### Setup With npm

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Commands

```bash
# development
npm run dev

# production build
npm run build

# start production server
npm run start
```

If you use Bun:

```bash
bun run dev
bun run build
bun run start
```

## Important Setup Notes

- Start the backend before logging into the admin dashboard
- The project currently has `dev`, `build`, and `start` scripts only
- No `lint` or `test` script is defined in `package.json` right now
- The root route redirects into the dashboard flow

## Key Files

- `src/lib/apis.ts` - axios instances and API base URLs
- `src/hooks/use-auth.ts` - auth store, token persistence, and 401 handling
- `src/middleware.ts` - route guard logic
- `src/components/layout/providers.tsx` - React Query and app-level providers
- `src/app/(routes)/dashboard` - admin pages
- `src/constants/data.ts` - sidebar navigation structure

## Summary

If you want to run this project locally, the minimum setup is:

1. Install dependencies
2. Create `.env.local`
3. Point `NEXT_PUBLIC_SERVER_URL` to your backend
4. Start the backend server
5. Run the Next.js app with `npm run dev` or `bun run dev`
