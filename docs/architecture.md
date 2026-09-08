# Architecture

SajiTap is a client-rendered React application backed by Supabase. It deliberately keeps the browser application, database schema, and operational workflows in one repository so the system remains understandable and deployable as a portfolio project.

## Runtime boundaries

```text
Table QR / browser
        |
        v
React + React Router + Zustand
        |
        v
Service layer (menu, table, order, auth, admin)
        |
        v
Supabase API
  |-- Auth: anonymous diners and password-based staff
  |-- Postgres: tenant-scoped restaurant data
  |-- RPC: trusted order, status, and payment mutations
  `-- Realtime: customer and kitchen order updates
```

Pages never construct database clients directly. Services own persistence and expose domain-shaped values; stores own browser state such as the cart, table context, preferences, and recent order references.

## Data modes

- `local` is an explicit development adapter. It uses the checked-in menu/table catalog and browser storage, including demo staff identities.
- `supabase` uses Postgres, Auth, RLS, RPCs, and Realtime. Missing or invalid configuration fails visibly and never falls back to fake production data.

## State ownership

| State                         | Owner                          | Persistence                      |
| ----------------------------- | ------------------------------ | -------------------------------- |
| Table context                 | Zustand table store            | `sessionStorage`                 |
| Cart                          | Zustand cart store             | `localStorage`                   |
| Favorites and recently viewed | Zustand preference store       | `localStorage`                   |
| Recent order references       | Zustand order store            | `localStorage`                   |
| Menu catalog                  | React context + menu service   | Supabase or local catalog        |
| Staff session                 | Supabase Auth or local adapter | Supabase/browser-managed session |
| Orders and analytics          | Postgres                       | Database                         |

## Route groups

- Customer: `/`, `/t/:tableNumber`, `/menu`, `/cart`, `/checkout`, `/order/:orderCode`, `/orders`
- Operations: `/kitchen`, `/cashier`
- Administration: `/admin/*`
- Authentication: `/staff/login`

Major route modules are lazy-loaded. The PWA precaches the application shell, while only the public menu endpoint is eligible for runtime data caching. Auth, order, profile, table-management, and RPC traffic is network-only.

## Design choices

- Order codes are customer-friendly; UUIDs remain internal.
- Historical item/category/option names and prices are snapshots, so menu edits do not rewrite old receipts.
- Preparation and payment are independent state machines.
- React route guards improve UX, while database RLS and role-checking RPCs remain authoritative.
- Server-side rendering is intentionally out of scope; metadata improves sharing and basic discovery but does not claim SSR-grade SEO.
