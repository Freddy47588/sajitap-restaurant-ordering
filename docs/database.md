# Database and Supabase Setup

SajiTap uses Supabase Postgres, Auth, Realtime-ready order tables, and Row Level Security. The browser uses only the public anon key. Never place a service-role key in a Vite variable.

## Local Supabase

Install the Supabase CLI, start the local stack, and reset the database:

```bash
supabase start
supabase db reset
```

The reset applies `supabase/migrations/202609060001_initial_schema.sql` and then `supabase/seed.sql`.

Copy `.env.example` to `.env.local`. For local static catalog development, keep `VITE_DATA_MODE=local`. To use Supabase, set:

```text
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local anon key>
```

## Security Model

- Public clients can read customer-facing restaurant configuration, active tables, categories, menu items, available options, and recommendations.
- Customers cannot directly insert, update, or delete orders. After creating an anonymous Auth session, a narrow security-definer order RPC validates the restaurant, active table, menu availability, quantities, required option cardinality, option ownership, and all prices before writing an order transaction.
- Authenticated staff can read orders only for the restaurant referenced by their profile.
- Admin mutations are scoped to the staff member's restaurant.
- Order item names, prices, and selected option prices are stored as historical snapshots.

The initial seed creates a demo restaurant, five categories, 12 tables, the complete local menu catalog, option groups, options, and deterministic recommendations. Staff users are intentionally not seeded because Auth identities are environment-specific.

Order preparation status and payment status are separate database enums. UI labels for order statuses are centralized in `src/lib/orderStatus.ts` so internal English values never leak into customer-facing screens.

## Order creation contract

`create_customer_order` accepts customer identity, restaurant/table context, and item identifiers. It deliberately ignores browser totals, menu prices, option prices, and display names. The function reads authoritative values from Postgres, creates historical snapshots, and returns only the new customer-facing order summary plus a high-entropy tracking token. Any validation error rolls back the complete transaction.

Anonymous access to `restaurant_tables` is column-limited to `table_number`, `label`, and `active`; database IDs and QR rotation tokens are staff-only.

Customer ordering uses a background Supabase anonymous Auth session—there is no customer registration or login screen. The resulting Auth user ID is attached to new orders by a trigger. RLS permits that session to read only its own orders and nested snapshots, which also enables authorized Realtime status events. Friendly order codes and tracking tokens are retained locally as device history.

The hardening migration revokes bare anon-role execution of order creation and limits one authenticated session to five orders per ten-minute window. This is a database guard, not a substitute for project-level Auth rate limits or edge abuse protection in a public production deployment.

Staff authentication uses Supabase email/password identities joined one-to-one to `public.profiles`. Creating an Auth user alone grants no restaurant access: a trusted administrator must also provision its profile with the correct `restaurant_id` and role. RLS remains authoritative even though the React router also performs role-aware navigation checks.

Public demo profiles set `is_demo = true`. The database keeps the demo administrator read-only while preserving each operational role's tenant-scoped workflow. Production restaurant QR URLs carry a rotatable table token checked during order creation; the seeded demo restaurant is explicitly public for the documented portfolio entry route.

Use `supabase/reset_demo.sql` only from a trusted database-owner session to clear synthetic orders and restore the demo catalog/table flags. It is intentionally not exposed through the application.
