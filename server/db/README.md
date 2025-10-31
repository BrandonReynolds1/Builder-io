Supabase / Postgres schema for Builder-io

Files:
- schema.sql — SQL to create the core application tables (roles, users, sponsors, priorities, questions, registrations, user_needs, messages, user_data, audit_logs)

How to apply
1) In the Supabase dashboard, open the SQL editor and paste the contents of `schema.sql`, then run it.
2) Or use psql against your project's database connection string.

Notes & recommendations
- If you plan to use Supabase Auth, create Auth users via the Supabase Auth UI or API, then upsert a corresponding row in `users` linking `auth_uid` to `auth.users.id`.
- For production, enable Row Level Security (RLS) on tables and add appropriate policies. The schema includes explanatory comments where policies are recommended.
- Create indexes and partitions as your scale increases; the provided schema includes some basic indexes.
- Do not include service keys on the client. Use server endpoints for privileged write operations.

Example: create a Super Admin
1) Create an Auth user via Supabase Auth with email `admin@example.com` (set a secure password).
2) Run the following in the SQL editor to create the app user row (if not present):

   insert into users (auth_uid, email, full_name, role_id, metadata)
     select 'REPLACE_WITH_AUTH_UID', 'admin@example.com', 'Administrator', r.id, jsonb_build_object('note', 'created via SQL')
     from roles r where r.name = 'admin';

Replace REPLACE_WITH_AUTH_UID with the user's `id` from the `auth.users` table.

Seeding application data
------------------------
Run `seed_data.sql` after `schema.sql` to populate priorities, registration options, and onboarding questions used by the app. Example flow in the Supabase SQL editor:

  1) Run `schema.sql` (creates tables and roles)
  2) Run `seed_data.sql` (inserts priorities, registration options and questions)

You can re-run `seed_data.sql` safely; it uses `on conflict` upserts for keys so it won't duplicate entries.
