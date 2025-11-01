-- Bulk seed: ~100 sponsors and ~100 users with randomized names, backgrounds, and settings
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING on emails)
-- Recommended: run in your Supabase SQL editor against the same project used by the app

-- Assumptions:
-- 1) roles table already contains 'sponsor' and 'user' entries (created by schema.sql)
-- 2) gen_random_uuid() is available (Supabase has pgcrypto enabled by default)

-- =====================
-- Insert ~100 Sponsors
-- =====================
WITH roles_map AS (
  SELECT
    (SELECT id FROM roles WHERE name = 'sponsor') AS sponsor_id,
    (SELECT id FROM roles WHERE name = 'user') AS user_id
),
pooled AS (
  SELECT
    ARRAY['Alex','Sam','Jordan','Taylor','Morgan','Casey','Riley','Quinn','Skyler','Hayden','Avery','Cameron','Drew','Elliot','Harper','Jesse','Peyton','Rowan','Sydney','Dakota','Reese','Robin','Shawn','Jamie','Kendall','Shannon','Parker','Logan','Phoenix','Carter'] AS first_names,
    ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'] AS last_names,
    ARRAY[
      'Recovery Coach','Peer Mentor','Substance Use Counselor','Wellness Advocate','Support Specialist','Case Manager'
    ] AS titles,
    ARRAY[
      'Motivational Interviewing','Trauma-informed Care','Relapse Prevention','Harm Reduction','CBT Basics','SMART Recovery','12-Step Facilitation','Crisis Support','Family Systems','Mindfulness'
    ] AS qualifications,
    ARRAY[
      'Relapse prevention','Trauma recovery','Family support','Anxiety & depression','Life skills','Career readiness','Housing stability','Legal navigation','Coping skills','Health & wellness'
    ] AS focus_areas,
    ARRAY[
      'To give back','To support my community','Because someone helped me','To make a difference','Personal calling','Professional growth'
    ] AS motivations
),
new_sponsors AS (
  INSERT INTO users (email, full_name, role_id, metadata)
  SELECT
    lower(replace(
      (p.first_names[(1+floor(random()*array_length(p.first_names,1)))::int] || '.' ||
       p.last_names[(1+floor(random()*array_length(p.last_names,1)))::int]
      ), ' ', '')) || g.n || '@example.com' AS email,
    (p.first_names[(1+floor(random()*array_length(p.first_names,1)))::int] || ' ' ||
     p.last_names[(1+floor(random()*array_length(p.last_names,1)))::int]) AS full_name,
    rm.sponsor_id,
    jsonb_build_object(
      'sponsorMotivation', p.motivations[(1+floor(random()*array_length(p.motivations,1)))::int]
    ) AS metadata
  FROM generate_series(1, 100) AS g(n)
  CROSS JOIN roles_map rm
  CROSS JOIN pooled p
  ON CONFLICT (email) DO NOTHING
  RETURNING id, full_name, email
)
INSERT INTO sponsor_backgrounds (sponsor_user_id, title, details, qualifications, verified)
SELECT
  s.id,
  p.titles[(1+floor(random()*array_length(p.titles,1)))::int] AS title,
  'Experienced in ' || p.focus_areas[(1+floor(random()*array_length(p.focus_areas,1)))::int] ||
  ' and ' || p.focus_areas[(1+floor(random()*array_length(p.focus_areas,1)))::int] AS details,
  jsonb_build_array(
    p.qualifications[(1+floor(random()*array_length(p.qualifications,1)))::int],
    p.qualifications[(1+floor(random()*array_length(p.qualifications,1)))::int]
  ) AS qualifications,
  (random() < 0.75) AS verified
FROM new_sponsors s
CROSS JOIN pooled p;

-- =================
-- Insert ~100 Users
-- =================
WITH roles_map AS (
  SELECT
    (SELECT id FROM roles WHERE name = 'sponsor') AS sponsor_id,
    (SELECT id FROM roles WHERE name = 'user') AS user_id
),
pooled AS (
  SELECT
    ARRAY['Alex','Sam','Jordan','Taylor','Morgan','Casey','Riley','Quinn','Skyler','Hayden','Avery','Cameron','Drew','Elliot','Harper','Jesse','Peyton','Rowan','Sydney','Dakota','Reese','Robin','Shawn','Jamie','Kendall','Shannon','Parker','Logan','Phoenix','Carter'] AS first_names,
    ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'] AS last_names,
    ARRAY[
      'Stay sober 90 days','Rebuild relationships','Find employment','Attend weekly meetings','Improve wellness','Manage triggers','Secure stable housing','Develop coping skills','Pursue education','Financial stability'
    ] AS user_goals
),
new_users AS (
  INSERT INTO users (email, full_name, role_id, metadata)
  SELECT
    lower(replace(
      (p.first_names[(1+floor(random()*array_length(p.first_names,1)))::int] || '.' ||
       p.last_names[(1+floor(random()*array_length(p.last_names,1)))::int]
      ), ' ', '')) || (100 + g.n) || '@example.com' AS email,
    (p.first_names[(1+floor(random()*array_length(p.first_names,1)))::int] || ' ' ||
     p.last_names[(1+floor(random()*array_length(p.last_names,1)))::int]) AS full_name,
    rm.user_id,
    jsonb_build_object(
      'recoveryGoals', jsonb_build_array(
        p.user_goals[(1+floor(random()*array_length(p.user_goals,1)))::int],
        p.user_goals[(1+floor(random()*array_length(p.user_goals,1)))::int]
      ),
      'onboardingUrgency', ((1 + floor(random()*5))::int)
    ) AS metadata
  FROM generate_series(1, 100) AS g(n)
  CROSS JOIN roles_map rm
  CROSS JOIN pooled p
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email, full_name
)
SELECT 1;

-- ======================================
-- Optional: seed random connections
-- Uncomment to create some real-looking connections
-- ======================================
-- WITH roles_map AS (
--   SELECT
--     (SELECT id FROM roles WHERE name = 'sponsor') AS sponsor_id,
--     (SELECT id FROM roles WHERE name = 'user') AS user_id
-- ),
-- u AS (
--   SELECT id FROM users WHERE role_id = (SELECT user_id FROM roles_map) ORDER BY random() LIMIT 120
-- ),
-- s AS (
--   SELECT id FROM users WHERE role_id = (SELECT sponsor_id FROM roles_map) ORDER BY random() LIMIT 120
-- )
-- INSERT INTO connections (user_id, sponsor_id, status)
-- SELECT u.id, s.id, CASE WHEN random() < 0.6 THEN 'accepted' ELSE 'pending' END
-- FROM u CROSS JOIN LATERAL (
--   SELECT id FROM s ORDER BY random() LIMIT 1
-- ) AS s
-- ON CONFLICT (user_id, sponsor_id) DO NOTHING;

-- ======================================
-- Optional: seed random messages for accepted connections
-- ======================================
-- WITH pooled AS (
--   SELECT ARRAY[
--     'Hello! I''d like to connect.','Thanks for reaching out.','How are you doing today?','Let''s schedule a call.','Sharing a helpful resource.','Great progress this week!','Do you have meeting availability?','Keep going – you''re doing great.'
--   ] AS sample_messages
-- )
-- INSERT INTO messages (from_user_id, to_user_id, body, read, sent_at)
-- SELECT
--   CASE WHEN random() < 0.5 THEN c.user_id ELSE c.sponsor_id END,
--   CASE WHEN random() < 0.5 THEN c.sponsor_id ELSE c.user_id END,
--   p.sample_messages[(1+floor(random()*array_length(p.sample_messages,1)))::int],
--   (random() < 0.5),
--   now() - (random() * interval '14 days')
-- FROM connections c CROSS JOIN pooled p
-- WHERE c.status = 'accepted'
-- LIMIT 300;
