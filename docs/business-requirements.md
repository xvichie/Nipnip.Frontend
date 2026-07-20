# NipNip — Business Requirements Document

*Last updated: 2026-07-21*

## 1. What is NipNip

NipNip is a Georgian **affiliate marketing and e-commerce platform** that connects two groups:

- **Merchants** — small and medium businesses who want to sell online and grow sales through influencer-driven marketing, without building their own storefront or affiliate infrastructure from scratch.
- **Creators** (influencers) — people with a social following who want to earn commission by promoting products they like, without needing to negotiate deals with individual brands.

NipNip gives merchants a ready-made online store, and gives creators a marketplace of products they can instantly generate a trackable link or discount code for, share with their audience, and get paid a commission on every sale they drive.

In short: **Shopify + an influencer marketing network, built as one connected product, for the Georgian market.**

## 2. The Problem

- Merchants (especially smaller ones) often can't afford a developer to build a store, and don't have the tools or relationships to run an affiliate/influencer program.
- Creators want to monetize their audience but the classic path (DM-ing brands, negotiating rates, manually tracking who bought what) is slow, manual, and doesn't scale.
- There's no existing local platform in Georgia that combines "get a store" and "get an affiliate program" into a single, self-serve product.

## 3. Product Overview

NipNip is one connected system with three sides:

| Role | What they do |
|---|---|
| **Merchant** | Runs a fully hosted online store (products, checkout, payments, delivery) and/or recruits creators to promote it |
| **Creator** | Signs up freely (no approval needed), browses merchants, grabs a tracking link or discount code for any product, shares it, earns commission |
| **Admin** (NipNip team) | Oversees the platform, resolves disputes, manages payouts, monitors merchants/creators |

Merchants and creators interact entirely through the platform — no manual contracts, no spreadsheets. Every click and sale is tracked automatically, and commissions are calculated and paid out by the system.

## 4. Core Product Areas

### 4.1 Merchant Storefront (e-commerce engine)

Every merchant gets a full storefront, not just a landing page:

- Product catalog with variants (size/color/etc.), multiple images, video, related products
- Categories, custom pages, contact/social info
- **7 selectable visual themes** (minimal, bold, classic, luxury, vibrant, commerce, editorial) with a full design customizer (colors, fonts, banners, hero layout, logo)
- Shopping cart and full checkout flow
- Custom domain support (merchants can use their own domain, with DNS verification)
- Order management: status pipeline (Pending → Confirmed → Shipped → Delivered / Cancelled), payment confirmation, internal notes, monthly revenue analytics

### 4.2 Payments

Merchants choose which payment methods to offer at checkout:

- **Cash on delivery**
- **Bank transfer** (merchant provides their own IBAN/instructions)
- **Card payments via Flitt** — a hosted checkout integration; the customer pays on a secure Flitt page and the order is confirmed automatically once payment clears. Each merchant connects their own Flitt merchant account.

### 4.3 Delivery

Merchants can connect **QuickShipper** (a third-party courier aggregator) directly from an order: one click auto-fills pickup/dropoff details and available couriers/prices from the merchant's own store and order data, creates the delivery, and shows live tracking status back on the order.

### 4.4 Affiliate Marketing Engine

This is the core differentiator versus a plain storefront builder:

- **Open marketplace** — any creator can browse any merchant's products and generate their own tracking link or a personal discount code, with no approval step (unless a merchant has marked their store private, in which case the creator sends a request the merchant approves/rejects).
- Every click and resulting sale is attributed to the creator who drove it.
- **Commission** is calculated automatically per sale and owed to the creator.
- **Link Trees** — creators can build multiple "link in bio" pages (like Linktree), each with its own set of merchant links, to share across Instagram/TikTok/etc.
- Merchants can also manually report an offline/manual sale and attribute it to a creator.
- **Payouts** — creators' earnings accumulate and are paid out by the platform.
- The platform takes a small **platform fee** from both sides of each transaction (a merchant-side fee and a creator-side fee), which is the core revenue model.

### 4.5 AI-Powered Merchant Tools

A growing suite of AI/media tools designed to save merchants the cost of a photographer or designer:

- **Background Remover** — one-click clean background removal on any product photo.
- **Social Post Creator** — turns one product photo into ready-to-post images sized for every platform (Facebook, Instagram Post/Story, TikTok, product page), with backgrounds (solid colors, patterns), a draggable/resizable/rotatable positioner, optional price badge and store logo overlay, and a "create product from these images" shortcut straight back into the catalog.
- **AI Product Photos** — generates new lifestyle/marketing photos from a product photo using AI image generation (e.g. "show this on a model in a park at golden hour"), with a guided, no-prompt-engineering-required picker (scene, subject, lighting) and a monthly usage quota per merchant to keep cost predictable.
- **AI Messaging Agent** — an AI chat assistant that can answer customer questions and even draft orders automatically inside a merchant's Facebook Page / Instagram DMs, using a merchant-configured knowledge base.

### 4.6 Third-Party Integrations

- **Facebook & Instagram** — connect a Facebook Page (and its linked Instagram Business account) to: import products directly from existing posts (AI-extracts name/price/variants from the caption), publish a product back out as a new post, and power the AI Messaging Agent.
- **QuickShipper** — delivery courier aggregation (see 4.3).
- **Flitt** — hosted card checkout (see 4.2).
- All third-party connections live in one place: **Integrations**, grouped into *Social Media*, *Delivery Services*, and *Payment Providers*.

### 4.7 Creator Dashboard

- Browse all merchants (or just the ones they have access to)
- Get a tracking link and/or a personalized discount code per merchant, per product
- Manage multiple Link Trees
- View earnings history and stats
- Onboarding flow for new creators (name, slug, socials, avatar)

### 4.8 Admin Panel

- Platform-wide overview, merchant list, creator list, conversions, payouts
- Demo login tooling for internal testing/demos

## 5. Business Model

NipNip earns revenue by taking a **percentage platform fee on every affiliate-driven sale**, split between the merchant side and the creator side. Merchants otherwise use the storefront, dashboard, and tools included as part of the platform; the affiliate fee is the primary monetization lever.

## 6. Who Can Do What

- **Creators** self-sign-up — no approval needed to join the platform, though an individual *private* merchant can require approval before a creator can promote them specifically.
- **Merchants** are the businesses selling products — provisioned by the NipNip team.
- Role is determined automatically based on which kind of account exists for a given login: the same authentication covers both sides of the platform.

## 7. Current Scope / Not Yet Built

Worth knowing as "not there yet" rather than assuming it exists:

- No merchant self-signup flow (merchants are onboarded by the NipNip team)
- No TikTok integration yet (Facebook/Instagram only, for now)
- Single-language UI groundwork exists (English/Georgian/Russian string files) but full multi-language support isn't finished
- No native mobile app — responsive web only

## 8. Glossary

| Term | Meaning |
|---|---|
| **Creator** | An influencer/individual promoting merchant products for commission |
| **Merchant** | A business selling products through their NipNip storefront |
| **Conversion** | A tracked sale attributed to a specific creator's link/code |
| **Commission** | The amount a creator earns from a conversion |
| **Platform fee** | NipNip's cut of each conversion (charged to both merchant and creator sides) |
| **Link Tree** | A creator's shareable "link in bio" page bundling multiple merchant links |
| **Storefront** | A merchant's public-facing online store |
| **GEL / ₾** | Georgian Lari, the platform's default currency |

---
*This document reflects the platform as currently built. For technical/architecture details, see `CLAUDE.md` in the frontend repository.*
