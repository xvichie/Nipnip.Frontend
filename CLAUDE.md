# NipNip — Frontend (Next.js)

## What is this

Frontend for NipNip, a Georgian affiliate marketing platform. Creators (influencers) sign up, browse merchants, grab unique tracking links and discount codes, share them, and earn commissions on sales they drive. Open marketplace — no approval needed. Merchants are onboarded manually by the admin (no merchant signup flow in the app).

## Tech stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + DaisyUI (dark theme default)
- Clerk for auth (@clerk/nextjs) — creators only
- TanStack Query (React Query) for API calls
- English UI, but don't hardcode strings — use a constants/strings object so i18n is easy later

## Backend API

The .NET backend runs separately. Base URL: `NEXT_PUBLIC_API_URL` env variable.
All authenticated requests send Clerk JWT in `Authorization: Bearer {token}` header.

## Design direction

Fun but modern and clean. Dark theme (DaisyUI "dark" or "night" theme). Not corporate, not boring — playful touches like emoji, rounded cards, satisfying micro-interactions (copy-to-clipboard toast, hover effects). But still professional enough that a brand would trust the platform. Think: Vercel's clean dark UI meets a fun marketplace energy.

Avoid: generic SaaS gray, boring tables with no personality, walls of text.

Use: bold accent colors for CTAs, clear visual hierarchy, generous spacing, card-based layouts, subtle animations on page load.

## User roles

- **Creator** — signs up through Clerk, browses merchants, gets links/codes, earns commissions
- **Merchant** — onboarded by admin (no signup flow), has their own dashboard to view stats and report manual sales. Merchants log in through Clerk too but their account is pre-created by admin.
- **Admin** — you. For now, manage merchants via API/Postman. Admin panel later.
- Roles are determined by which entity exists in the backend for the Clerk user ID. On login, check both `/api/merchants/me` and `/api/creators/me` — whichever returns 200 is their role. If neither exists, show the creator onboarding flow (since only creators self-signup).

## Project structure

```
nipnip-web/
├── app/
│   ├── layout.tsx                    # ClerkProvider + QueryClientProvider + DaisyUI dark theme
│   ├── page.tsx                      # Landing page
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── onboarding/
│   │   └── page.tsx                  # Creator profile setup (after first signup)
│   ├── merchants/
│   │   ├── page.tsx                  # Browse all merchants (public)
│   │   └── [slug]/page.tsx           # Merchant public profile (public)
│   └── dashboard/
│       ├── layout.tsx                # Shared dashboard layout with sidebar/nav, role-based routing
│       ├── merchant/
│       │   ├── page.tsx              # Merchant dashboard — stats overview
│       │   ├── conversions/page.tsx  # Conversion history
│       │   ├── report-sale/page.tsx  # Manual sale reporting form
│       │   └── settings/page.tsx     # Edit merchant profile
│       └── creator/
│           ├── page.tsx              # Creator dashboard — stats overview
│           ├── my-links/page.tsx     # Browse merchants + get tracking links + discount codes
│           ├── earnings/page.tsx     # Earnings history
│           └── settings/page.tsx     # Edit creator profile
├── components/
│   ├── ui/                           # Shared UI components
│   ├── merchants/                    # Merchant-specific components (MerchantCard, etc.)
│   ├── creators/                     # Creator-specific components
│   ├── dashboard/                    # Dashboard components (StatsCard, TopTable, etc.)
│   └── layout/                       # Navbar, Sidebar, Footer
├── lib/
│   ├── api.ts                        # Fetch wrapper with Clerk token injection
│   ├── queries/
│   │   ├── merchants.ts              # useMerchants, useMerchant, useMerchantDashboard
│   │   ├── creators.ts               # useCreatorDashboard, useRegisterCreator
│   │   ├── conversions.ts            # useTrackConversion, useReportManualSale
│   │   └── payouts.ts                # useCreatorPayouts
│   └── types/
│       ├── merchant.ts
│       ├── creator.ts
│       ├── conversion.ts
│       ├── payout.ts
│       └── common.ts                 # PaginatedResult<T>
├── hooks/
│   └── useCurrentRole.ts             # Checks if user is merchant, creator, or new (needs onboarding)
├── strings/
│   └── ka.ts                         # All UI strings in one object for future i18n
├── middleware.ts                      # Clerk middleware for protected routes
└── .env.local
```

## Architecture rules

### API layer
- All API calls through `lib/api.ts` — thin fetch wrapper that auto-injects Clerk Bearer token
- React Query hooks in `lib/queries/` — one file per domain
- Mutations use `useMutation` with `onSuccess` invalidation
- Types in `lib/types/` must match backend DTOs exactly

### Components
- Use DaisyUI classes (btn, card, input, table, modal, badge, alert, toast, skeleton, etc.)
- Don't reinvent DaisyUI components — use them as-is with Tailwind utility classes for tweaks
- Keep components small and focused

### Pages
- Pages are thin — compose components and call hooks
- Server components by default, `"use client"` only when needed
- Protected pages under `/dashboard/` — Clerk middleware handles redirect

### Patterns
- No Redux, no Zustand — React Query handles server state
- No axios — plain fetch
- No custom CSS files — Tailwind + DaisyUI only
- Forms: controlled components with useState, no form libraries
- Loading: DaisyUI `loading loading-spinner` or `skeleton`
- Errors: DaisyUI `alert alert-error`
- Success: DaisyUI `toast` with auto-dismiss
- Copy to clipboard: show toast "Link copied!" or "Code copied!"

### Naming
- Files: kebab-case (merchant-card.tsx)
- Components: PascalCase (MerchantCard)
- Hooks: camelCase with "use" (useMerchants)
- Types: PascalCase (MerchantResponse)

## Key flows

### Creator signup
1. Creator clicks "Sign Up" → Clerk signup flow
2. After Clerk auth, redirect to `/onboarding`
3. Onboarding page: enter name, slug, Instagram handle, TikTok handle, avatar URL
4. Submit calls `POST /api/creators`
5. Redirect to `/dashboard/creator`

### Creator gets a tracking link
1. Creator browses `/merchants` or `/dashboard/creator/my-links`
2. Sees a merchant card with commission rate
3. Clicks "Get My Link"
4. Modal/popover shows:
   - Tracking link: `{API_URL}/r/{creatorSlug}/{merchantSlug}` with copy button
   - Discount code: creator can type a preferred code, system checks availability. If taken, suggest auto-generated alternative like `{CREATORSLUG}_{MERCHANTSLUG}` or `{CREATORSLUG}{RANDOM4DIGITS}`. Copy button for the code too.
5. Creator shares link on Instagram/TikTok and tells followers the discount code

### Merchant reports a manual sale
1. Merchant logs into dashboard (account pre-created by admin)
2. Goes to `/dashboard/merchant/report-sale`
3. Form: search/select creator (by slug or name), enter order amount, optional order ID
4. Submit calls `POST /api/conversions/manual`
5. Success toast, commission calculated automatically

### Dashboard views
- Both merchant and creator dashboards show: stats cards at top (clicks, conversions, money), date range filter, top performers table below
- Merchant sees top creators, creator sees top merchants
- Keep it simple — numbers and tables, no charts for MVP

## Environment variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## What NOT to build

- No merchant signup flow — merchants onboarded manually
- No admin panel — manage via API for now
- No i18n setup — just use strings object for future
- No dark/light mode toggle — dark theme only
- No charts library — plain numbers and tables
- No image upload — enter URLs manually
- No real-time updates — manual refresh or refetch on focus
- No mobile app — responsive web
- No testing
- No SSR for dashboard — client-side React Query
- No search/filter on merchants page yet — just paginated list