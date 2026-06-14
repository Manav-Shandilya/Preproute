# Preproute Test Management App

A frontend application for creating, managing, and publishing academic tests. Built for educators and administrators to streamline the test creation workflow — from defining metadata and adding questions to previewing and publishing.

Please visit the website on this URL - https://preproute-alpha-sandy.vercel.app/

## Features

- **Dashboard** – View, search, edit, and delete tests at a glance
- **Test Creation** – Multi-step form with validation for test metadata
- **Question Builder** – Rich text editor with LaTeX/math support, image upload, and CSV import
- **Preview & Publish** – Review tests before going live with scheduling options
- **Responsive Design** – Fully usable on mobile, tablet, and desktop viewports

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | TailwindCSS 3 |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Rich Text | TipTap |
| HTTP | Axios |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library + MSW |

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

## Getting Started

### 1. Install dependencies

```bash
cd preproute-test-app
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (or use the existing one):

```env
VITE_API_BASE_URL=https://admin-moderator-backend-staging.up.railway.app/api
```

### 3. Run the development server

```bash
npm run dev
```

The app starts at `http://localhost:5173` by default.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check with `tsc` then build for production |
| `npm run lint` | Run ESLint with zero-warning policy |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/       # Buttons, spinners, modals, selects
│   ├── layout/       # Header, Sidebar, AuthenticatedLayout
│   ├── question/     # QuestionForm, QuestionNavigator, QuestionSidebar
│   ├── publish/      # PublishPanel, PublishDialog
│   └── test/         # TestMetadataForm, TestTypeTabs, EditTestModal
├── contexts/         # React Context + useReducer state management
├── guards/           # Route protection (AuthGuard)
├── hooks/            # Custom hooks (useAutoSave, etc.)
├── pages/            # Page-level components (one per route)
├── schemas/          # Zod validation schemas
├── services/         # Axios API layer
├── styles/           # Global CSS / Tailwind directives
├── types/            # TypeScript interfaces and type definitions
└── utils/            # Utility functions (formatters, CSV parser, etc.)
```

## Architecture Decisions

### State Management – Context + useReducer

The app uses React Context combined with `useReducer` instead of an external library like Redux. Each domain (Auth, Test, Question, Subject, UI) has its own context with a typed reducer. This keeps state colocated with the features that use it and avoids prop-drilling, while remaining lightweight for an app of this size.

### Form Handling – React Hook Form + Zod

React Hook Form provides performant, uncontrolled form state. Combined with Zod schemas (via `@hookform/resolvers`), we get runtime type validation that mirrors our TypeScript types. Validation errors surface automatically with minimal boilerplate.

### API Layer – Axios with Interceptors

Axios is configured with a base instance that attaches the auth token via request interceptors and handles 401 responses via response interceptors (triggering logout). This centralizes auth concerns outside of individual API calls.

### Rich Text Editing – TipTap

TipTap (built on ProseMirror) powers the question editor with support for bold, italic, underline, lists, links, images, text alignment, and color. Its extension-based architecture makes it straightforward to add capabilities like LaTeX rendering.

### Folder Structure

Components are grouped by domain (`test/`, `question/`, `publish/`) rather than by type (`buttons/`, `modals/`). This makes it easy to locate all pieces related to a feature and supports independent development of each feature area.

## Deployment

### Build for production

```bash
npm run build
```

This outputs static assets to the `dist/` directory.

### Deploy

The `dist/` folder can be deployed to any static hosting provider:

- **Vercel** – Connect the repo and set the build command to `npm run build` with output directory `dist`
- **Netlify** – Same as above; add a `_redirects` file with `/* /index.html 200` for SPA routing
- **AWS S3 + CloudFront** – Upload `dist/` to an S3 bucket configured for static website hosting
- **Railway / Render** – Configure as a static site with the `dist` publish directory

Ensure the `VITE_API_BASE_URL` environment variable is set in your hosting provider's settings for production builds.

## License

Private – internal use only.
