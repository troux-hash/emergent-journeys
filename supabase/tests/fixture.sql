-- Minimal stand-ins for the Fichua schema objects the enquiries migration
-- depends on. Just enough shape for the real functions to execute.
CREATE SCHEMA IF NOT EXISTS vault;
CREATE SCHEMA IF NOT EXISTS net;
CREATE SCHEMA IF NOT EXISTS cron;

CREATE TABLE vault.decrypted_secrets (name text, decrypted_secret text);

-- Record calls instead of making them, so the test can assert on what
-- would have been sent.
CREATE TABLE net.sent (id bigserial, url text, headers jsonb, body jsonb);
CREATE FUNCTION net.http_post(url text, body jsonb DEFAULT '{}', params jsonb DEFAULT '{}', headers jsonb DEFAULT '{}', timeout_milliseconds int DEFAULT 5000)
RETURNS bigint LANGUAGE sql AS $f$
  INSERT INTO net.sent(url, headers, body) VALUES (url, headers, body) RETURNING id;
$f$;

CREATE FUNCTION cron.schedule(job_name text, schedule text, command text)
RETURNS bigint LANGUAGE sql AS $f$ SELECT 1::bigint $f$;

CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, slug text, status text DEFAULT 'draft',
  email text, phone text, city text, country text
);
CREATE TABLE public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES public.operators(id),
  name text, price_per_night numeric, currency text, max_guests int
);
CREATE TABLE public.system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), kind text, detail text,
  context jsonb, resolved_at timestamptz
);
CREATE FUNCTION public.log_system_alert(p_kind text, p_detail text, p_context jsonb DEFAULT NULL)
RETURNS void LANGUAGE sql AS $f$
  INSERT INTO public.system_alerts(kind, detail, context) VALUES (p_kind, p_detail, p_context);
$f$;

-- Toggled by the tests to simulate admin vs non-admin callers.
CREATE TABLE public._test_is_admin (v boolean);
INSERT INTO public._test_is_admin VALUES (true);
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE AS $f$ SELECT v FROM public._test_is_admin LIMIT 1 $f$;

-- auth.uid() returns a fixed non-null uuid; admin-ness is decided by has_role above.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT '11111111-1111-1111-1111-111111111111'::uuid $f$;

CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;
