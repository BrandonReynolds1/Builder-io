-- Supabase / Postgres schema for Builder-io
-- Run this in the Supabase SQL editor or via psql against your project's DB

-- Enable commonly used extensions (Supabase typically enables pgcrypto)
-- Uncomment if needed:
-- create extension if not exists "pgcrypto";

-- Roles table: application-level roles (admin, sponsor, user, moderator, ...)
create table if not exists roles (
  id serial primary key,
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Users table: application user metadata (Supabase Auth can be used for authentication)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid, -- optional: link to Supabase auth.uid if using Supabase Auth
  email text unique,
  full_name text,
  role_id integer references roles(id) on delete set null,
  profile jsonb,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_email on users(email);

-- Sponsors: optional profile details specific to sponsors (references users)
create table if not exists sponsor_backgrounds (
  id uuid primary key default gen_random_uuid(),
  sponsor_user_id uuid references users(id) on delete cascade,
  title text,
  details text,
  qualifications jsonb,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Priorities: reusable priority levels for needs/questions
create table if not exists priorities (
  id serial primary key,
  key text not null unique,
  label text not null,
  weight integer default 0,
  description text,
  created_at timestamptz default now()
);

-- Questions: forms or needs questions that users answer
create table if not exists questions (
  id serial primary key,
  key text not null unique,
  question_text text not null,
  help_text text,
  data_schema jsonb, -- optional JSON schema to validate answers client-side
  "order" integer default 0,
  created_at timestamptz default now()
);

-- Registration options (checkboxes / options available during registration)
create table if not exists registration_options (
  id serial primary key,
  key text not null unique,
  label text not null,
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Registrations: records for user sign-ups (could be used for onboarding flows)
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  options jsonb,
  status text default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User needs: what the user has indicated they need/support requests
create table if not exists user_needs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question_id integer references questions(id) on delete set null,
  priority_id integer references priorities(id) on delete set null,
  details text,
  status text default 'open',
  assigned_sponsor_id uuid references users(id) on delete set null,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_user_needs_user on user_needs(user_id);
create index if not exists idx_user_needs_status on user_needs(status);

-- Messages: messages between users and sponsors (or system messages)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references users(id) on delete set null,
  to_user_id uuid references users(id) on delete set null,
  user_need_id uuid references user_needs(id) on delete cascade,
  body text,
  attachments jsonb, -- array of {url, type, name}
  metadata jsonb,
  sent_at timestamptz default now(),
  read boolean default false
);

create index if not exists idx_messages_user_need on messages(user_need_id);
create index if not exists idx_messages_to_user on messages(to_user_id);

-- Connections: requests between seekers (users) and sponsors
create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  sponsor_id uuid references users(id) on delete cascade,
  status text default 'pending', -- pending, accepted, declined
  created_at timestamptz default now(),
  unique (user_id, sponsor_id)
);

create index if not exists idx_connections_sponsor on connections(sponsor_id);
create index if not exists idx_connections_user on connections(user_id);

-- Generic user data: store arbitrary user filled forms / answers
create table if not exists user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  key text,
  value jsonb,
  created_at timestamptz default now()
);

-- Audit / admin activity (very lightweight)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text,
  resource_type text,
  resource_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Optional: sample insert for roles and an admin user placeholder
-- Note: If you use Supabase Auth, create the auth user via the Auth UI or API
-- and then insert a users row using the auth.uid into auth_uid column.

insert into roles (name, description)
  values
    ('admin', 'Full administrative access'),
    ('sponsor', 'Sponsor role for supporting users'),
    ('user', 'Standard end-user'),
    ('moderator', 'Content/moderation role')
  on conflict (name) do nothing;

-- Example admin insert: replace the email with the admin email you'll use.
-- If using Supabase Auth, create the auth user first and then upsert to users with auth_uid.
insert into users (email, full_name, role_id, metadata)
  select 'admin@example.com', 'Administrator', r.id, jsonb_build_object('note','replace-with-supabase-auth-user')
  from roles r where r.name = 'admin'
  on conflict (email) do nothing;

-- NOTES:
-- 1) Enable Row Level Security (RLS) and create policies appropriate for your app.
--    Supabase defaults to RLS disabled; for production set RLS and policies.
-- 2) For production, never store service keys in client. Use server functions for privileged ops.
-- 3) Consider creating more granular tables for attachments, call logs, recordings, etc.
-- 4) Add indexes and partitioning as needed for scale.
