<div align="center">
  <img src="public/brand/sajitap-logo.svg" alt="SajiTap logo" width="96" />

# SajiTap

**Tap. Order. Enjoy.**

A warm, mobile-first restaurant table-ordering experience built for quick ordering from a QR-linked table.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-433E38)
![Portfolio](https://img.shields.io/badge/Project-Portfolio-9F3C20)
</div>

## 🍽️ Overview

SajiTap modernizes an earlier Vue 2 culinary-ordering exercise into a focused customer experience. After scanning a table QR link, guests can browse local Indonesian dishes, choose typed product options and add-ons, manage a persistent cart, and complete a simulated checkout without waiting for a server.

The application now includes a Supabase-ready relational schema, seed data, RLS foundations, and a centralized asynchronous menu repository. Local catalog mode remains available explicitly for frontend development. Submitted restaurant orders are **not persisted yet**; trusted order creation is the next phase.

## ✨ Features

- Responsive, food-focused interface in Bahasa Indonesia
- Menu search, five food and drink categories, favorite filtering, availability states, and price sorting
- Generic single- and multi-select product options with option-aware pricing
- Item detail with preparation estimates, deterministic pairings, quantity controls, notes, and a live subtotal
- Persistent cart with editable customizations powered by Zustand and `localStorage`
- Locally persisted favorites, recently viewed menus, and lightweight toast feedback
- Checkout validation, generated local order IDs, and confirmation details
- Centralized table context preserved across the complete flow with `?table=12` or `/t/12`
- Typed restaurant-table catalog with active/inactive validation and unavailable-table handling
- Locally generated table QR codes with copy, PNG download, and print actions
- Supabase-ready menu repository with loading, retry, and explicit failure states
- Postgres schema, development seed, staff-role model, and initial Row Level Security policies
- Accessible controls, visible focus states, empty states, and a dedicated 404 page

## 📸 Preview

Project screenshots can be added without changing the README structure:

| Home                        | Menu                        | Cart                        |
| --------------------------- | --------------------------- | --------------------------- |
| `docs/screenshots/home.png` | `docs/screenshots/menu.png` | `docs/screenshots/cart.png` |

> Screenshots are intentionally not embedded until real captures are added to these paths.

## 🔄 User Flow

```text
QR/table link → Home → Menu → Item detail → Cart → Checkout → Order success
```

## 🛠️ Tech Stack

| Technology   | Purpose                                 |
| ------------ | --------------------------------------- |
| React        | Component-based user interface          |
| TypeScript   | Static types and domain modeling        |
| Vite         | Development server and production build |
| Tailwind CSS | Responsive styling and design tokens    |
| React Router | Client-side routes and table-query flow |
| Zustand      | Persistent cart and local order state   |
| Supabase     | Postgres, Auth, RLS, and backend client |
| Vitest       | Focused unit tests                      |
| Lucide React | Accessible interface icons              |

## 🏗️ Architecture

```text
src/
├── assets/           # Source-managed hero imagery
├── components/       # Layout, menu, cart, and reusable UI
├── context/          # Shared asynchronous catalog state
├── data/menu.ts      # Development-mode menu catalog
├── lib/              # Currency formatting and route helpers
├── pages/            # Route-level screens
├── store/            # Persistent cart and transient order state
├── services/         # Supabase-aware data repositories
├── types/            # Shared domain types
├── App.tsx
└── main.tsx

public/
├── assets/images/    # Static menu photography
└── brand/            # SajiTap logo and favicon

supabase/
├── migrations/       # Versioned database schema and RLS
└── seed.sql           # Demo restaurant catalog
```

The local data layer is kept separate from UI code so it can later be replaced by a backend integration without rebuilding the presentation layer.

## 🚀 Getting Started

```bash
git clone https://github.com/Freddy47588/sajitap-restaurant-ordering.git
cd sajitap-restaurant-ordering
npm install
npm run dev
```

Copy `.env.example` to `.env.local`. The example uses the explicit local data mode. See [`docs/database.md`](docs/database.md) for Supabase CLI setup and database security notes.

### Environment variables

| Variable                 | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `VITE_DATA_MODE`         | `local` for development or `supabase`        |
| `VITE_SUPABASE_URL`      | Supabase project URL                         |
| `VITE_SUPABASE_ANON_KEY` | Public browser key; never use a service role |

Open the local URL shown by Vite. To simulate scanning a table QR code, visit:

```text
http://localhost:5173/?table=12
```

The stable table-entry route is also supported:

```text
http://localhost:5173/t/12
```

The query value follows internal ordering links and automatically prefills the checkout table field.

## 📜 Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite development server        |
| `npm run build`        | Type-check and create a production build |
| `npm run lint`         | Run ESLint                               |
| `npm test`             | Run the Vitest suite once                |
| `npm run format`       | Format project files with Prettier       |
| `npm run format:check` | Verify formatting without changing files |

## 📱 Screens & Routes

| Route             | Screen                              |
| ----------------- | ----------------------------------- |
| `/`               | Landing page and featured menu      |
| `/t/:tableNumber` | Stable table entry route            |
| `/menu`           | Searchable menu catalog             |
| `/menu/:id`       | Item detail and customization       |
| `/cart`           | Cart review and quantity management |
| `/checkout`       | Customer and table details          |
| `/order-success`  | Local order confirmation            |
| `/admin/tables`   | QR table management foundation      |
| `*`               | Not-found state                     |

## 🧪 Testing

The focused unit suite covers Indonesian Rupiah formatting, option-aware cart totals, customization identity, cart behavior, table-context utilities, table-catalog integrity, and the development menu repository.

```bash
npm test
```

## 🗺️ Roadmap

- Trusted Supabase order creation and persistent order tracking
- Restaurant administration and kitchen order statuses
- Supabase-backed table and QR management
- Staff authentication and role management
- Real-time order updates

These items are planned improvements and are not part of the current frontend demo.

## ♻️ Legacy Modernization

SajiTap began as a Vue 2 culinary-ordering project. The current version replaces Vue CLI, Vue Router, BootstrapVue, Axios, toast plugins, and the external My JSON Server dependency with a typed React architecture and local state. Useful Indonesian food photography and the original culinary identity were retained.

## 📄 License

This project is provided for portfolio and learning purposes.
