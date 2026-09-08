<div align="center">
  <img src="public/brand/sajitap-logo.svg" alt="SajiTap logo" width="96" />

# SajiTap

**Tap. Order. Enjoy.**

A full-stack QR restaurant ordering system with realtime customer and staff workflows.

[![CI](https://github.com/Freddy47588/sajitap-restaurant-ordering/actions/workflows/ci.yml/badge.svg)](https://github.com/Freddy47588/sajitap-restaurant-ordering/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%7C%20Auth%20%7C%20Realtime-3FCF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)
</div>

## 🌐 Live Demo

The public Netlify URL has not been provisioned yet. Once deployed, replace this note with two direct links:

- **Customer Demo:** `<site-url>/t/12`
- **Staff Login:** `<site-url>/staff/login`

Customer demo journey: open Table 12, browse and customize the menu, add items to the cart, check out, then follow the order in realtime. Customers do not use the staff login.

## 🔐 Staff Demo Access

SajiTap has one shared staff entry point: `/staff/login`. After authentication, the application detects the profile role and routes it to the matching dashboard:

| Role         | Dashboard  | Demo capability                                                                              |
| ------------ | ---------- | -------------------------------------------------------------------------------------------- |
| Admin Demo   | `/admin`   | View dashboard, orders, menu, tables, staff, and analytics; database-enforced read-only mode |
| Kitchen Demo | `/kitchen` | `pending → confirmed → preparing → ready`                                                    |
| Cashier Demo | `/cashier` | View orders, manage payment, and complete the cashier workflow                               |
| Waiter Demo  | `/waiter`  | View front-of-house orders and move `ready → served`                                         |

Hosted sandbox accounts have **not** been provisioned, so no hosted credentials are claimed here. Follow [the deployment guide](docs/deployment.md) to create isolated Supabase Auth users, mark their profiles as demo accounts, verify their restrictions, and only then publish disposable credentials.

## 🍽️ Overview

SajiTap turns a table QR scan into a mobile-first restaurant workflow. Guests browse an Indonesian menu, choose options, submit a server-validated order, and track progress. Kitchen, waiter, cashier, and administrator views operate on the same realtime, tenant-scoped data.

The application deliberately supports two data modes:

| Environment           | `VITE_DATA_MODE` | Purpose                                                      |
| --------------------- | ---------------- | ------------------------------------------------------------ |
| Local development     | `local`          | Browser-backed adapter for fast and offline contributor work |
| Hosted portfolio demo | `supabase`       | Postgres, Auth, Realtime, RPCs, and RLS                      |

## ✨ Features

- QR table routes with active-table validation; production restaurant QR codes carry rotatable bearer tokens
- Searchable menu, favorites, recent items, preparation estimates, and recommendations
- Required and multi-select options, add-on pricing, notes, cart editing, and persistence
- Transactional order RPC with database-owned prices, availability checks, option validation, snapshots, and rate limiting
- Device-scoped order history and realtime customer tracking
- Supabase Auth for anonymous diners and role-based staff
- Tenant-scoped RLS and database-enforced kitchen, waiter, and payment transitions
- Menu, category, table, QR, staff, order, and analytics administration
- Installable PWA shell with offline feedback and sensitive API responses excluded from caching

## 🔄 User Flow

```text
CUSTOMER

QR /t/12
   ↓
Menu → Item options → Cart → Checkout
   ↓
Server-authoritative order → Realtime tracking
```

```text
STAFF

/staff/login
   ↓
Role detection
   ├── Admin   → /admin
   ├── Kitchen → /kitchen
   ├── Cashier → /cashier
   └── Waiter  → /waiter
```

## 👥 Staff Roles

- **👑 Admin:** restaurant dashboard, menu, categories, tables, staff, orders, and analytics. A public demo admin is read-only.
- **👨‍🍳 Kitchen:** receives orders and manages preparation states.
- **💳 Cashier:** manages payment and completion workflow.
- **🛠️ Waiter:** handles ready-to-serve orders and table service.

React route guards provide clear navigation, while Supabase RLS and RPC checks remain the authorization boundary. Unauthorized cross-role dashboard access is rejected.

## 🛠️ Tech Stack

| Technology              | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| React 19 + React Router | Customer and staff application                     |
| TypeScript              | Strict domain modeling                             |
| Vite + Vite PWA         | Build, code splitting, manifest, and offline shell |
| Tailwind CSS            | Mobile-first visual system                         |
| Zustand                 | Cart, table, preference, and device-order state    |
| Supabase                | Postgres, Auth, Realtime, RLS, and RPCs            |
| Vitest                  | Domain, store, and service tests                   |
| QRCode + Lucide React   | Table QR generation and interface icons            |

## 🏗️ Architecture

```text
GitHub repository
       ↓
Netlify: React + Vite static frontend
       ↓
Supabase: Postgres + Auth + Realtime + RLS
```

UI components call a service layer rather than Supabase directly. Zustand owns device state, React context owns asynchronous catalog and auth state, Postgres owns durable restaurant data, and RPCs own sensitive state transitions.

See [architecture](docs/architecture.md), [database](docs/database.md), and [security](docs/security.md) documentation for the detailed boundaries.

## 🗄️ Database

Versioned SQL in `supabase/migrations/` creates the restaurant, table, catalog, order, snapshot, and staff-profile model. `supabase/seed.sql` provides the synthetic SajiTap Demo Restaurant and menu. The browser sends item identifiers and quantities; Postgres validates them and calculates authoritative totals.

Staff Auth users are environment-specific and intentionally are not created by the seed.

## 🚀 Local Development

```bash
git clone https://github.com/Freddy47588/sajitap-restaurant-ordering.git
cd sajitap-restaurant-ordering
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:5173/t/12` to simulate a table scan.

### Local Development Accounts

These accounts exist only in the local browser adapter. They are not Supabase Auth users and must not be used as hosted credentials.

| Role    | Email                   | Password       | Dashboard  |
| ------- | ----------------------- | -------------- | ---------- |
| Admin   | `admin@sajitap.local`   | `demo-admin`   | `/admin`   |
| Kitchen | `kitchen@sajitap.local` | `demo-kitchen` | `/kitchen` |
| Cashier | `cashier@sajitap.local` | `demo-cashier` | `/cashier` |
| Waiter  | `waiter@sajitap.local`  | `demo-waiter`  | `/waiter`  |

For local Supabase development, install the Supabase CLI, start Docker, run `supabase start` and `supabase db reset`, then use the reported project URL and anon key. See [database setup](docs/database.md).

## 🔧 Environment Variables

| Variable                 | Local development   | Hosted demo                 |
| ------------------------ | ------------------- | --------------------------- |
| `VITE_DATA_MODE`         | `local`             | `supabase`                  |
| `VITE_RESTAURANT_SLUG`   | `sajitap-demo`      | Dedicated demo tenant slug  |
| `VITE_SUPABASE_URL`      | Empty in local mode | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Empty in local mode | Public anon key             |

Never put a service-role key, database password, private JWT secret, or admin API secret in a `VITE_*` variable.

## 🚢 Deployment

Netlify reads `netlify.toml`, runs `npm run build`, publishes `dist`, and rewrites all application routes to `index.html` for React Router. Set the hosted environment to `VITE_DATA_MODE=supabase`; never publish the portfolio in local mode.

The reproducible Supabase provisioning, restricted demo-account, URL configuration, Netlify environment, reset, and validation checklist is in [docs/deployment.md](docs/deployment.md).

## 🧪 Testing

```bash
npm run format:check
npm run lint
npm test
npm run build
```

GitHub Actions runs the same quality gates after `npm ci`. Ordinary CI uses local mode and requires no Supabase secrets.

## 📱 Routes

| Area           | Routes                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Customer       | `/`, `/t/:tableNumber`, `/menu`, `/menu/:id`, `/cart`, `/checkout`, `/order/:orderCode`, `/orders`                 |
| Operations     | `/kitchen`, `/cashier`, `/waiter`                                                                                  |
| Administration | `/admin`, `/admin/orders`, `/admin/menu`, `/admin/categories`, `/admin/tables`, `/admin/staff`, `/admin/analytics` |
| Authentication | `/staff/login`                                                                                                     |

## 📸 Screenshots

| Customer home                                       | Menu                                       |
| --------------------------------------------------- | ------------------------------------------ |
| ![SajiTap customer home](docs/screenshots/home.png) | ![SajiTap menu](docs/screenshots/menu.png) |

<p align="center">
  <img src="docs/screenshots/staff-login.png" alt="SajiTap staff login" width="420" />
</p>

All images above are captures of the running application. Additional dashboard screenshots should only be added from a real local or deployed build.

## 🔒 Security

- RLS is enabled on every application table and staff data is scoped to the profile's restaurant.
- Pricing, option validation, table availability, and order writes are server-authoritative.
- Staff roles are rechecked inside security-definer transition RPCs.
- Public demo profiles belong only to the synthetic demo tenant; demo admins are read-only at the database boundary.
- Production restaurant QR links use rotatable table capabilities; the seeded portfolio demo intentionally keeps `/t/12` directly accessible.
- The frontend uses only the public anon key. No service role belongs in browser code.
- Auth, order, profile, table-management, and RPC responses use network-only PWA handling.

See [SECURITY.md](SECURITY.md) for reporting and [docs/security.md](docs/security.md) for the trust model and public-demo boundaries.

## 🗺️ Roadmap

- Provision hosted demo infrastructure and publish the verified demo URL and sandbox credentials
- Add deployment monitoring, edge rate limits, and backup/restore drills
- Add maintained browser end-to-end tests in CI
- Evaluate SSR or prerendering only if public menu discovery becomes a product requirement

## ♻️ Legacy Modernization

SajiTap began as a Vue 2 culinary-ordering exercise. The current application replaces Vue CLI, Vue Router, BootstrapVue, Axios, toast plugins, and an external JSON demo dependency with a strict React architecture, relational backend, realtime operations, and defense-in-depth authorization. The Indonesian food identity and useful original photography were retained.

## 📄 License

This project is provided for portfolio and learning purposes.
