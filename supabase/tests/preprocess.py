#!/usr/bin/env python3
"""Adapt a production migration so it can be applied to the local harness.

Two substitutions, both forced by extensions that are absent from the
local Postgres build, and both stated here so nobody mistakes a passing
local test for a verified production constraint.

1. EXCLUDE USING gist (uuid WITH =, daterange WITH &&) needs btree_gist.
   Replaced with a BEFORE trigger enforcing the same rule.

   *** This means the local harness CANNOT verify the real overlap
   constraint. A double-booking test here proves the harness trigger
   works. The real gist constraint -- and specifically its behaviour
   under genuine concurrency, which is the whole reason to use a
   constraint instead of a trigger -- must be tested on a real Supabase
   branch. A trigger does a SELECT and can be raced; the constraint
   cannot. They are NOT equivalent under load. ***

2. pgmq is absent, so the email-queue helpers are stubbed as plain table
   operations. Queue semantics (visibility timeout, DLQ) are therefore
   not exercised locally either.

Everything else is applied byte-for-byte.
"""
import os
import re
import sys

TRIGGER_SUB = """-- HARNESS SUBSTITUTION for EXCLUDE USING gist (btree_gist unavailable locally).
-- NOT equivalent under concurrency -- see supabase/tests/preprocess.py.
CREATE OR REPLACE FUNCTION public._harness_no_overlap() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER            -- a real constraint does no permission check;
SET search_path = public    -- without this the trigger denies anon falsely
AS $harness$
BEGIN
  IF NEW.status NOT IN ('cancelled', 'refunded') AND EXISTS (
    SELECT 1 FROM public.bookings b
     WHERE b.room_type_id = NEW.room_type_id
       AND b.id <> NEW.id
       AND b.status NOT IN ('cancelled', 'refunded')
       AND b.stay_range && daterange(NEW.check_in, NEW.check_out, '[)')
  ) THEN
    RAISE EXCEPTION 'conflicting key value violates exclusion constraint "bookings_no_overlap"'
      USING ERRCODE = '23P01';
  END IF;
  RETURN NEW;
END $harness$;
DROP TRIGGER IF EXISTS _harness_bookings_no_overlap ON public.bookings;
CREATE TRIGGER _harness_bookings_no_overlap
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public._harness_no_overlap();"""

PGMQ_STUB = """

-- HARNESS: pgmq unavailable locally; inert queue helpers so dependent
-- migrations still apply. Queue semantics are NOT tested here.
CREATE TABLE IF NOT EXISTS public._harness_email_queue (
  msg_id bigserial PRIMARY KEY, queue_name text, message jsonb,
  enqueued_at timestamptz DEFAULT now());
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE sql AS $h$
  INSERT INTO public._harness_email_queue(queue_name, message)
  VALUES ($1, $2) RETURNING msg_id $h$;
CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, vt integer, qty integer)
RETURNS TABLE (msg_id bigint, message jsonb) LANGUAGE sql AS $h$
  SELECT q.msg_id, q.message FROM public._harness_email_queue q
   WHERE q.queue_name = $1 LIMIT $3 $h$;
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE sql AS $h$
  DELETE FROM public._harness_email_queue WHERE msg_id = $2; SELECT true $h$;
CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text,
  message_id bigint, payload jsonb)
RETURNS bigint LANGUAGE sql AS $h$ SELECT $3 $h$;
"""

EXCLUDE_RE = re.compile(
    r"ALTER TABLE public\.bookings\s*\n\s*ADD CONSTRAINT bookings_no_overlap\s*\n"
    r"\s*EXCLUDE USING gist[^;]*;",
    re.MULTILINE,
)

# Extensions the local build does not ship. Neutralised rather than stubbed
# per-migration, because a failed CREATE EXTENSION aborts the whole file and
# every later object in it silently never gets created -- which is how
# suppressed_emails went missing locally while existing in production.
MISSING_EXT_RE = re.compile(
    r"CREATE EXTENSION (?:IF NOT EXISTS )?\"?(pg_net|pgmq|pg_cron|http|supabase_vault|vault)\"?[^;]*;",
    re.IGNORECASE,
)


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    with open(src) as fh:
        text = fh.read()

    # HARNESS_REAL_GIST=1 keeps the production EXCLUDE USING gist constraint
    # verbatim. Only set it when the local Postgres actually has btree_gist --
    # then, and only then, the concurrency behaviour matches production.
    if os.environ.get("HARNESS_REAL_GIST") == "1":
        n = 0
    else:
        text, n = EXCLUDE_RE.subn(TRIGGER_SUB, text)
    text = MISSING_EXT_RE.sub(
        lambda m: "-- HARNESS: extension unavailable locally -- " + " ".join(m.group(0).split()),
        text,
    )


    with open(dst, "w") as fh:
        fh.write(text)

    if n:
        print(f"  [preprocess] {src.split('/')[-1]}: replaced {n} gist constraint(s)")


if __name__ == "__main__":
    main()
