-- Seed data for Builder-io application
-- Insert priorities, registration options, and example questions

-- Priorities
insert into priorities (key, label, weight, description)
values
  ('crisis', 'In Crisis - Need Help Now', 100, 'Immediate danger or suicidal ideation'),
  ('urgent', 'Urgent - This Week', 75, 'Needs support within days'),
  ('soon', 'Soon - Within a Month', 50, 'Planning to seek support soon'),
  ('general', 'General Support', 25, 'Ongoing or general support needs')
on conflict (key) do update set label = excluded.label, weight = excluded.weight, description = excluded.description;

-- Registration options
insert into registration_options (key, label, description)
values
  ('receive_updates', 'Receive Email Updates', 'Opt-in to receive informational emails'),
  ('share_anonymous_telemetry', 'Share Anonymous Telemetry', 'Help us understand aggregate need volumes'),
  ('open_to_sponsors', 'Open to Sponsor Matches', 'Allow sponsors to contact you for support')
on conflict (key) do update set label = excluded.label, description = excluded.description;

-- Questions (onboarding)
insert into questions (key, question_text, help_text, data_schema, "order")
values
  ('primary_need', 'What is the primary support you are seeking?', 'Briefly describe the most important help you need', null, 1),
  ('substance_focus', 'Are you seeking support related to substance use?', 'Select if your need relates to substance use', null, 2),
  ('preferred_contact', 'Preferred way to be contacted by a sponsor?', 'Phone, message, or call only', null, 3)
on conflict (key) do update set question_text = excluded.question_text, help_text = excluded.help_text, data_schema = excluded.data_schema, "order" = excluded."order";

-- Example registration of admin row is handled in schema.sql; do not overwrite auth-linked users here.

-- You can run this file after schema.sql. In Supabase SQL editor run both files or run:
-- psql <connection-string> -f schema.sql -f seed_data.sql
