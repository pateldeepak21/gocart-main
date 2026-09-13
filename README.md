<div align="center">
  <h1>🛒 GoCart</h1>
  <p>
    A full-stack, multi-vendor e-commerce platform built with Next.js, Prisma, PostgreSQL, and Clerk.
  </p>
  <p>
    <a href="https://gocart-main-umf7.vercel.app"><img src="https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge" alt="Live Demo"></a>
    <a href="https://github.com/pateldeepak21/gocart-main/blob/main/LICENSE"><img src="https://img.shields.io/github/license/pateldeepak21/gocart-main?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/pateldeepak21/gocart-main/issues"><img src="https://img.shields.io/github/issues/pateldeepak21/gocart-main?style=for-the-badge" alt="GitHub issues"></a>
  </p>
  <p>
    <strong><a href="https://gocart-main-umf7.vercel.app">🔗 Live Demo</a></strong>
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture Highlights](#️-architecture-highlights)
- [🚀 Getting Started](#-getting-started)
- [📜 License](#-license)

---

## ✨ Features

### Customer
- Browse and search products across all approved stores
- Persistent cart with debounced sync to the database
- Manage delivery addresses
- Apply discount coupons (new-user, member-only, or general)
- Checkout via **Cash on Delivery** or **Stripe**
- Track order status and rate delivered products

### Seller
- Register a store (goes live after admin approval)
- Add products with multiple images — with **AI-assisted auto-fill** of name/description from a product photo
- Toggle product stock status
- View and update order status
- Seller dashboard: earnings, orders, products, ratings & reviews

### Admin
- Approve or reject store applications
- Activate/deactivate any store
- Create and delete coupons (with automatic expiry cleanup)
- Platform-wide dashboard: total orders, revenue, products, stores

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| UI Icons | Lucide React |
| State Management | Redux Toolkit |
| Database | PostgreSQL ([Neon](https://neon.tech)) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Authentication | [Clerk](https://clerk.com) |
| Image Hosting | [ImageKit](https://imagekit.io) |
| Payments | Stripe Checkout + Webhooks |
| Background Jobs | [Inngest](https://www.inngest.com) |
| Deployment | Vercel |

---

## 🏗️ Architecture Highlights

- **Role-based authorization** — every protected API route verifies identity via Clerk and checks seller/admin status server-side, not just in the UI.
- **Multi-vendor checkout** — a single cart can span multiple stores; the order API groups items by store and creates one order per store in a single transaction.
- **Event-driven automation** — Inngest keeps user records in sync with Clerk and auto-expires coupons without manual cron jobs.
- **Self-healing user sync** — API routes create a missing `User` record on the fly (from Clerk) if the sync webhook hasn't landed yet, preventing foreign-key failures.
- **Resilient DB layer** — uses the standard `pg` driver adapter for stable connections in Vercel's serverless environment.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- Accounts for [Clerk](https://clerk.com), [ImageKit](https://imagekit.io), [Stripe](https://stripe.com), and [Inngest](https://www.inngest.com)

### Installation

```bash
git clone https://github.com/pateldeepak21/gocart-main.git
cd gocart-main
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_neon_pooled_connection_string
DIRECT_URL=your_neon_direct_connection_string

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

ADMIN_EMAIL=your_admin_email
NEXT_PUBLIC_CURRENCY_SYMBOL=$
```

### Run locally

```bash
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

Deployed on **Vercel** with continuous deployment from the `main` branch — every push triggers an automatic production build. Environment variables are configured in Vercel's project settings and are never committed to version control.

---

## 📜 License

This project is for educational/portfolio purposes.