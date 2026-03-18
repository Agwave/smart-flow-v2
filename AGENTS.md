# AGENTS.md - SmartFlow Development Guide

SmartFlow is an AI-powered e-commerce customer service system using Next.js 16, React 19, Tailwind CSS 4, and ZhipuAI GLM-4-Flash.

## Commands

```bash
pnpm dev        # Start development server on http://localhost:3000
pnpm build      # Build production bundle
pnpm start      # Start production server
pnpm lint       # Run ESLint on all files
```

**No test framework is currently set up.** If adding tests, use Vitest.

## Project Structure

```
smart-flow-v2/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI chat API endpoint
│   ├── admin/             # Admin dashboard pages
│   ├── page.tsx           # Customer service homepage
│   └── layout.tsx         # Root layout
├── components/
│   ├── chat/              # Chat feature components
│   ├── ui/                # shadcn/ui component library
│   └── admin/             # Admin components
├── lib/
│   ├── utils.ts           # cn() utility
│   ├── types.ts           # TypeScript type definitions
│   └── mock-data.ts       # Mock data for development
└── public/                # Static assets
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ZHIPU_API_KEY` | ZhipuAI API key (required) |

Create `.env.local` from project root for local development.

---

## Best Practices

1. Add `"use client"` only when needed (hooks, browser APIs)
2. Use React hooks for state management
3. Never use `any`; define proper types
4. Use semantic HTML and shadcn/ui for accessibility
