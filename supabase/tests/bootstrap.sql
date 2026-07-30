-- Faithful-as-possible stand-in for the Supabase environment, so the REAL
-- migrations can be applied and their REAL policies tested.
--
-- auth.uid() and auth.role() read request.jwt.claims exactly as Supabase
-- does, which is what lets a test impersonate anon / a signed-in user /
-- an admin without inventing a parallel mechanism.

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS vault;
CREATE SCHEMA IF NOT EXISTS net;
CREATE SCHEMA IF NOT EXISTS cron;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;              EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE ROLE authenticated NOLOGIN;     EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE ROLE authenticator NOINHERIT LOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
GRANT anon, authenticated, service_role TO authenticator;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')::uuid
$$;
CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', current_setting('role', true))
$$;
CREATE OR REPLACE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT auth.jwt() ->> 'email'
$$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text, raw_user_meta_data jsonb, created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vault.secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text, secret text, description text
);
CREATE OR REPLACE VIEW vault.decrypted_secrets AS
  SELECT id, name, secret AS decrypted_secret, description FROM vault.secrets;
CREATE OR REPLACE FUNCTION vault.create_secret(new_secret text, new_name text DEFAULT NULL, new_description text DEFAULT '')
RETURNS uuid LANGUAGE sql AS $$
  INSERT INTO vault.secrets(name, secret, description)
  VALUES (new_name, new_secret, new_description) RETURNING id
$$;
CREATE OR REPLACE FUNCTION vault.update_secret(secret_id uuid, new_secret text DEFAULT NULL, new_name text DEFAULT NULL, new_description text DEFAULT NULL)
RETURNS void LANGUAGE sql AS $$
  UPDATE vault.secrets SET secret = COALESCE(new_secret, secret), name = COALESCE(new_name, name) WHERE id = secret_id
$$;

-- Record HTTP calls instead of making them.
CREATE TABLE IF NOT EXISTS net.sent (id bigserial, url text, headers jsonb, body jsonb, at timestamptz DEFAULT now());
CREATE OR REPLACE FUNCTION net.http_post(url text, body jsonb DEFAULT '{}', params jsonb DEFAULT '{}', headers jsonb DEFAULT '{}', timeout_milliseconds int DEFAULT 5000)
RETURNS bigint LANGUAGE sql AS $$
  INSERT INTO net.sent(url, headers, body) VALUES (url, headers, body) RETURNING id
$$;
CREATE TABLE IF NOT EXISTS cron.job (jobid bigserial, jobname text, schedule text, command text);
CREATE OR REPLACE FUNCTION cron.schedule(job_name text, schedule text, command text)
RETURNS bigint LANGUAGE sql AS $$
  INSERT INTO cron.job(jobname, schedule, command) VALUES (job_name, schedule, command) RETURNING jobid
$$;
CREATE OR REPLACE FUNCTION cron.unschedule(job_name text) RETURNS boolean LANGUAGE sql AS $$
  DELETE FROM cron.job WHERE jobname = job_name; SELECT true
$$;
CREATE OR REPLACE FUNCTION cron.unschedule(job_id bigint) RETURNS boolean LANGUAGE sql AS $$
  DELETE FROM cron.job WHERE jobid = job_id; SELECT true
$$;

-- HARNESS: pgmq is unavailable locally. These inert helpers exist from the
-- start so every migration that references them applies. Queue semantics
-- (visibility timeout, DLQ, retries) are NOT exercised locally.
CREATE TABLE IF NOT EXISTS public._harness_email_queue (
  msg_id bigserial PRIMARY KEY, queue_name text, message jsonb,
  enqueued_at timestamptz DEFAULT now());
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE sql AS $$
  INSERT INTO public._harness_email_queue(queue_name, message)
  VALUES ($1, $2) RETURNING msg_id $$;
CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE (msg_id bigint, read_ct integer, message jsonb) LANGUAGE sql AS $$
  SELECT q.msg_id, 0, q.message FROM public._harness_email_queue q
   WHERE q.queue_name = $1 LIMIT $2 $$;
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE sql AS $$
  DELETE FROM public._harness_email_queue WHERE msg_id = $2; SELECT true $$;
CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text,
  message_id bigint, payload jsonb)
RETURNS bigint LANGUAGE sql AS $$ SELECT $3 $$;

CREATE TABLE IF NOT EXISTS storage.buckets (id text PRIMARY KEY, name text, public boolean DEFAULT false);
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid, metadata jsonb
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON storage.objects, storage.buckets TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger LANGUAGE plpgsql AS $$ BEGIN END $$;

-- Supabase runs migrations as a superuser-ish owner; mirror that default.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;

-- Fidelity fix, and the single most important line in this file.
-- Supabase grants EXECUTE on every newly created public function to
-- anon/authenticated/service_role by default. Without reproducing that, a
-- migration writing only `REVOKE ... FROM PUBLIC` looks clean locally while
-- remaining fully reachable in production -- which is exactly how two real
-- exposures reached prod. The allowlists are near-useless without this.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;


-- Realtime publication that migrations add tables to.
DO $$ BEGIN
  CREATE PUBLICATION supabase_realtime;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- HARNESS: the queue dispatcher/wake pair live in the email-infra migration,
-- which cannot apply locally (pgmq/pg_net absent). Stubbing them here keeps
-- later migrations -- including the ones that REVOKE EXECUTE on has_role and
-- handle_new_user -- from aborting, which previously made the allowlist
-- assertion fail locally for a reason that did not exist in production.
CREATE OR REPLACE FUNCTION public.email_queue_dispatch() RETURNS void
  LANGUAGE plpgsql AS $$ BEGIN END $$;
CREATE OR REPLACE FUNCTION public.email_queue_wake() RETURNS trigger
  LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
