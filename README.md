# SajiTap

**Tap. Order. Enjoy.**

A modern, mobile-first restaurant table-ordering web application rebuilt from a legacy Vue 2 culinary ordering project using React, Vite, and TypeScript.

## Overview

SajiTap simulates the customer journey after scanning a table QR code: browse a curated menu, configure an item, manage a persistent cart, and place an order. It is frontend-only, using local menu data and browser storage.

## Features

- Responsive, food-focused customer ordering experience in Bahasa Indonesia
- Search, category filters, availability states, and price sorting
- Item detail with quantity, order note, and live subtotal
- Persistent cart powered by Zustand and localStorage
- Checkout validation, generated local order IDs, and order confirmation
- Optional table context preserved from `?table=12`
- Accessible controls, focus states, empty states, unavailable products, and 404 page

## User Flow

`QR/table link → menu → item detail → cart → checkout → order success`

## Tech Stack

- React + TypeScript, Vite, React Router, Tailwind CSS
- Zustand with persist middleware, Lucide React, Vitest

## Architecture / Project Structure

```text
src/
├── components/       # Layout, menu cards, reusable UI
├── data/menu.ts      # Typed local menu catalog
├── lib/              # Formatting and route helpers
├── pages/            # Route-level screens
├── store/            # Persistent cart and transient order state
├── types/            # Shared domain types
├── App.tsx
└── main.tsx
```

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |

## Demo Ordering Flow

Choose an available dish, set a quantity and optional instruction, review the cart, enter a name and table number, then submit the order.

## QR/Table Query Example

Open `/?table=12` or `/menu?table=12`. The table number is carried through internal navigation and prefilled at checkout.

## Screens / Routes

| Route | Screen |
| --- | --- |
| `/` | Home and featured menu |
| `/menu` | Searchable menu catalog |
| `/menu/:id` | Item customization |
| `/cart` | Cart review |
| `/checkout` | Customer and table details |
| `/order-success` | Order confirmation |

## Future Improvements

- Supabase backend and real order persistence
- Restaurant admin dashboard and kitchen order statuses
- QR-code generation per table, staff authentication, and real-time order updates

## Legacy Modernization

This is a modernization/remake of an earlier Vue 2 culinary ordering project. The Vue CLI, BootstrapVue, toast plugin, Axios calls, and external My JSON Server dependency were removed. Food photography and culinary menu identity were retained, while menu and cart behavior now run locally.

## License

This project is provided for portfolio and learning purposes.
