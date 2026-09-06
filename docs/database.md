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

- Anonymous users can read public restaurant configuration, active tables, categories, menu items, available options, and recommendations.
- Anonymous users cannot directly insert, update, or delete orders. Phase 4 will add a narrow security-definer order RPC that validates all prices and selections.
- Authenticated staff can read orders only for the restaurant referenced by their profile.
- Admin mutations are scoped to the staff member's restaurant.
- Order item names, prices, and selected option prices are stored as historical snapshots.

The initial seed creates a demo restaurant, five categories, 12 tables, the complete local menu catalog, option groups, options, and deterministic recommendations. Staff users are intentionally not seeded because Auth identities are environment-specific.

Order preparation status and payment status are separate database enums. UI labels for order statuses are centralized in `src/lib/orderStatus.ts` so internal English values never leak into customer-facing screens.
