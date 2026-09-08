# Security Model

## Identities and trust

Customers do not register. Before order creation, the client obtains a Supabase anonymous Auth session. Staff use email/password Auth and gain application access only when a matching `profiles` row assigns a restaurant and role.

The frontend contains only the Supabase public anon key. A service-role key or other privileged secret must never be exposed through a `VITE_*` variable.

## Authorization

- Row Level Security is enabled on every application table.
- Customer reads are authorized by Supabase session ownership. The application also narrows normal reads with the order code and tracking token, but the bearer session remains the database authorization boundary; treat shared browser profiles accordingly.
- Staff order reads are constrained to `current_staff_restaurant_id()`.
- Admin configuration writes require the `admin` role and the same restaurant.
- Kitchen, waiter, and cashier changes go through security-definer RPCs that re-check role, tenant, and valid state transitions.
- Client-side protected routes are not treated as an authorization boundary.

## Public demo accounts

Hosted demo identities must exist only in a dedicated Supabase project and the synthetic SajiTap Demo Restaurant tenant. Every published profile uses `is_demo = true`. The database makes a demo administrator read-only for restaurant configuration, order status, and payment changes; the operational demo roles retain only their existing kitchen, cashier, or waiter transitions.

Never reuse a real employee account or production password. Creating an Auth user alone does not grant staff access because a tenant-scoped `profiles` row is also required. Hosted accounts are provisioned manually and are not part of `seed.sql`.

## Order integrity

`create_customer_order` accepts identifiers and quantities, not trusted totals. Postgres verifies the active restaurant table, current menu availability, option ownership/cardinality, quantities, and text limits. It calculates prices from current database rows and writes the order plus snapshots atomically.

The RPC requires an authenticated session (including anonymous Auth users). The write trigger binds the JWT subject to the order and serializes a five-orders-per-ten-minutes limit for each session. Option arrays are bounded before expansion. Production deployments should additionally enable Supabase Auth and edge-level abuse controls because a visitor can create a new anonymous identity.

Production restaurant QR URLs include a rotatable high-entropy table token checked by the order RPC. The seeded public demo restaurant is explicitly marked `is_demo`, so its documented `/t/12` evaluator entry can remain intentionally public without weakening non-demo tenants.

## Browser data and caching

The cart, preferences, and recent order tracking references are device-local. Treat devices shared by unrelated users accordingly. The PWA caches the static shell and public menu reads only; order, auth, staff profile, table-management, and RPC responses are not cached.

## Security review

A repository-wide static security review covered authentication, RLS, security-definer functions, tenant isolation, browser persistence, PWA cache policy, injection sinks, secrets, and dependencies. It identified and remediated two medium findings: unauthenticated order-RPC access and overbroad Supabase response caching. `npm audit` reported zero known dependency vulnerabilities at the time of review.

Apply and test all migrations in the target Supabase project before deployment. Repository review cannot prove the effective hosted Auth, RLS, Realtime, or URL configuration.
