# Public Demo Deployment

SajiTap's hosted portfolio environment uses a static Netlify frontend and a dedicated Supabase project. Keep that project isolated from every real restaurant and populate it with synthetic data only.

## 1. Prepare Supabase

1. Create a dedicated Supabase project for the public demo.
2. Apply every file in `supabase/migrations/` in filename order, then run `supabase/seed.sql`.
3. In **Authentication → Providers**, keep anonymous sign-ins enabled for customer ordering and enable email/password for staff.
4. In **Authentication → URL Configuration**, set **Site URL** to the final Netlify origin. Add the same origin to **Redirect URLs** if password recovery or email confirmation is enabled later. Keep localhost URLs only for local development.
5. Confirm RLS is enabled and test the customer order RPC and every staff role before publishing credentials.

## 2. Provision restricted demo staff

Create four email/password users in **Authentication → Users**. Use disposable public-demo credentials and addresses that clearly identify the sandbox. Do not reuse any production identity or password.

After each Auth user exists, insert its profile with the Auth user UUID and the seeded demo restaurant ID:

```sql
insert into public.profiles (id, restaurant_id, full_name, role, is_demo)
values
  ('<admin-auth-user-uuid>',   '00000000-0000-0000-0000-000000000001', 'Admin Demo',   'admin',   true),
  ('<kitchen-auth-user-uuid>', '00000000-0000-0000-0000-000000000001', 'Dapur Demo',   'kitchen', true),
  ('<cashier-auth-user-uuid>', '00000000-0000-0000-0000-000000000001', 'Kasir Demo',   'cashier', true),
  ('<waiter-auth-user-uuid>',  '00000000-0000-0000-0000-000000000001', 'Pelayan Demo', 'waiter',  true);
```

The `is_demo` flag makes Admin Demo read-only at the database boundary. Kitchen, cashier, and waiter demo users retain only their existing tenant-scoped operational transitions. Creating an Auth user without a matching profile grants no staff access.

Do not commit the hosted passwords until these accounts exist and their restrictions have been verified. If credentials are later published, label them as disposable sandbox credentials in the README.

## 3. Deploy to Netlify

Import the GitHub repository and configure:

| Setting                  | Value                    |
| ------------------------ | ------------------------ |
| Build command            | `npm run build`          |
| Publish directory        | `dist`                   |
| `VITE_DATA_MODE`         | `supabase`               |
| `VITE_RESTAURANT_SLUG`   | `sajitap-demo`           |
| `VITE_SUPABASE_URL`      | Supabase project URL     |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

Never add a service-role key, database password, or JWT secret to Netlify frontend variables. `netlify.toml` contains the build settings and the SPA fallback needed for direct route refreshes.

## 4. Validate the deployment

1. Open and refresh `/t/12`, `/staff/login`, `/admin`, `/kitchen`, `/cashier`, `/waiter`, and a real `/order/<code>` URL.
2. Complete the customer flow from table entry through realtime order tracking.
3. Confirm role redirects and verify cross-role dashboard access is rejected.
4. Confirm Admin Demo can view but cannot mutate configuration, payments, or order status.
5. Confirm kitchen can move `pending → confirmed → preparing → ready`, waiter can move `ready → served`, and cashier can manage payment and completion.
6. Install the PWA, verify offline messaging, and confirm auth/order responses are never served from cache.

## Reset strategy

Run `supabase/reset_demo.sql` from the Supabase SQL editor or another trusted database-owner session. It removes demo orders and restores the seeded availability flags without deleting staff identities. Schedule that trusted operation outside the browser if traffic requires it. Never expose a reset endpoint or service-role credential to the frontend.
