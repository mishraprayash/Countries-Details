# AGENTS.md - Coding Guidelines for Agents

This is a Next.js 16 project using the App Router, TypeScript, and Tailwind CSS.

---

## Build / Lint / Test Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Build
npm run build            # Production build

# Linting
npm run lint             # Run ESLint on all files

# Start production
npm start                # Start production server
```

There are **no tests configured** in this project. If adding tests, use Vitest or Jest with React Testing Library.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home/dashboard
│   ├── countries/        # Countries list page
│   ├── country/[name]/  # Dynamic country detail
│   ├── compare/          # Comparison page
│   ├── quiz/             # Quiz page
│   └── favorites/        # Favorites page
├── components/           # Reusable React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (api.ts, worldbank.ts)
├── types/                # TypeScript interfaces
├── constants/            # App constants
├── data/                 # Static JSON data
└── utils/                # Helper utilities
```

---

## Code Style Guidelines

### Imports

- Use path alias `@/` for all internal imports (configured in tsconfig.json)
- Order: external libs → internal modules → types
- Example:
```tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Country } from "@/types/country";
import { Globe } from "lucide-react";
import { getAllCountries } from "@/lib/api";
```

### TypeScript

- **Always use strict mode** (enabled in tsconfig.json)
- Prefer `interface` over `type` for public API types
- Use explicit return types for exported functions
- Never use `any` - use `unknown` if type is truly unknown

### Naming Conventions

- **Components**: PascalCase (e.g., `CountryCard`, `Navbar`)
- **Functions/variables**: camelCase (e.g., `getAllCountries`, `isFavorite`)
- **Files**: kebab-case for components (`country-card.tsx`), camelCase for utilities (`api.ts`)
- **Interfaces**: PascalCase with `Props` suffix for component props (e.g., `CountryCardProps`)

### Error Handling

- Throw descriptive errors with context:
```tsx
if (!response.ok) {
  throw new Error(`Failed to fetch country: ${name}`);
}
```
- Always check response.ok for fetch calls
- Use try/catch in client components for graceful error UI

### Component Patterns

- **Server Components**: Default - use `async function` with direct data fetching
- **Client Components**: Add `"use client"` at the top when using:
  - `useState`, `useEffect`, `useRef`
  - Event handlers (onClick, onChange)
  - Browser-only APIs

```tsx
"use client";

import { useState } from "react";

export default function MyComponent() {
  const [value, setValue] = useState("");
  // ...
}
```

### UI / Styling

- Use **Tailwind CSS** for all styling
- Use dark theme colors (zinc-950, zinc-900, zinc-50)
- Use `ring-1 ring-white/5` for subtle borders
- Use `back-blur-md` for glassmorphism effects
- Use `transition-all duration-X` for smooth animations
- Use `group-` patterns for hover states on parent-child elements

### Data Fetching

- Use Next.js `fetch` with caching:
```tsx
const response = await fetch(url, {
  next: { revalidate: 3600 } // Cache for 1 hour
});
```
- Use Suspense with fallback for async content
- Handle loading states with dedicated skeleton components

### Next.js 16 Specific

This is **Next.js 16** with breaking changes from older versions. Key differences:
- `params` in dynamic routes is now a Promise
- Use `next.config.ts` instead of `next.config.js`
- Check `node_modules/next/dist/docs/` for latest API changes
- Follow deprecation notices in code

---

## Linting Rules

ESLint config uses:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Run `npm run lint` to check. Fix issues before committing.

---

## Adding New Features

1. Create component in `src/components/` if reusable
2. Create page in `src/app/` following App Router conventions
3. Add types to `src/types/` if new data structures needed
4. Use `npm run lint` and verify build before submitting
5. Update this AGENTS.md if new patterns emerge