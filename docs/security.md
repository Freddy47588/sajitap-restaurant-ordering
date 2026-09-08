# Security Model

## Identities and trust

Customers do not register. Before order creation, the client obtains a Supabase anonymous Auth session. Staff use email/password Auth and gain application access only when a matching `profiles` row assigns a restaurant and role.

The frontend contains only the Supabase public anon key. A service-role key or other privileged secret must never be exposed through a `VITE_*` variable.

## Authorization

- Row Level Security is enabled on every application table.
- Customer reads require both session ownership and the order tracking token used by the application query.
- Staff order reads are constrained to `current_staff_restaurant_id()`.
- Admin configuration writes require the `admin` role and the same restaurant.
- Kitchen and cashier changes go through security-definer RPCs that re-check role, tenant, and valid state transitions.
- Client-side protected routes are not treated as an authorization boundary.

## Order integrity

`create_customer_order` accepts identifiers and quantities, not trusted totals. Postgres verifies the active restaurant table, current menu availability, option ownership/cardinality, quantities, and text limits. It calculates prices from current database rows and writes the order plus snapshots atomically.

The RPC requires an authenticated session (including anonymous Auth users). The write trigger binds the JWT subject to the order and limits a session to five orders per ten minutes. Production deployments should additionally enable Supabase Auth and edge-level abuse controls appropriate to their traffic.

## Browser data and caching

The cart, preferences, and recent order tracking references are device-local. Treat devices shared by unrelated users accordingly. The PWA caches the static shell and public menu reads only; order, auth, staff profile, table-management, and RPC responses are not cached.

## Security review

A repository-wide static security review covered authentication, RLS, security-definer functions, tenant isolation, browser persistence, PWA cache policy, injection sinks, secrets, and dependencies. It identified and remediated two medium findings: unauthenticated order-RPC access and overbroad Supabase response caching. `npm audit` reported zero known dependency vulnerabilities at the time of review.

Local Supabase migration execution requires Docker and was unavailable in the review environment. Apply and test all migrations in a real Supabase environment before deployment.
