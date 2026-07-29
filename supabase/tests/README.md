# Database execution tests

## Why these exist

Postgres only **syntax**-checks a plpgsql function body at `CREATE FUNCTION`
time. Semantic errors — a bad column reference, an invalid FROM-clause
reference — are invisible until the function actually *runs*.

This is not theoretical. A migration in this repo shipped with
`UPDATE operators o ... FROM LATERAL calculate_subscription_price(o.id)`,
which parses perfectly and fails at runtime with *"invalid reference to
FROM-clause entry"*. Parse-only checking cannot catch that class of bug.
Only execution can.

## What it does

`fixture.sql` creates minimal stand-ins for the objects the migrations
depend on — `operators`, `room_types`, `has_role`, `system_alerts`,
`auth.uid()`, plus recording stubs for `net.http_post` and
`cron.schedule`. The stubs record calls into `net.sent` rather than making
them, so tests can assert on what *would* have been sent.

`enquiries_test.sql` then calls every function with real arguments and
asserts on results, including the paths that are awkward to test in
production: missing Vault secrets, duplicate nudges, non-admin callers.

## Running them

Needs a throwaway Postgres 16. No superuser required:

```bash
pip install pgserver --break-system-packages
python3 -c "import pgserver; pgserver.get_server('/tmp/pgdata')"

PGBIN=$(python3 -c "import pgserver,os;print(os.path.dirname(pgserver.__file__))")/pginstall/bin
$PGBIN/pg_ctl -D /tmp/pgdata -o "-k /tmp/pgdata -c listen_addresses=''" -l /tmp/pg.log start

URI="postgresql://postgres:@/fichua?host=/tmp/pgdata"
$PGBIN/psql "postgresql://postgres:@/postgres?host=/tmp/pgdata" -c "CREATE DATABASE fichua;"
$PGBIN/psql "$URI" -v ON_ERROR_STOP=1 -f supabase/tests/fixture.sql
$PGBIN/psql "$URI" -v ON_ERROR_STOP=1 -f supabase/migrations/20260728040000_enquiries.sql
$PGBIN/psql "$URI" -v ON_ERROR_STOP=1 -f supabase/tests/enquiries_test.sql
```

Every test raises a `NOTICE` on success and an exception on failure, so a
zero exit code means everything passed.

## Limits, stated plainly

The fixture is a stand-in, not the production schema. It will not catch a
mismatch between a function and the *real* shape of `operators` — if a
column is renamed in production, these tests keep passing. They verify
logic, not schema drift.

## RLS policy suite

`rls_test.sh` is the P0 security test. It applies the **real** migrations
(via `apply-migrations.sh` + `preprocess.py`) to a throwaway Postgres, then
exercises every policy as a real `anon` / `authenticated` role with
`request.jwt.claims` set exactly as Supabase sets it, so `auth.uid()` and
`has_role()` behave as in production.

```bash
PGBIN=... U="postgresql://postgres:@/rlstest?host=/tmp/pgdata" bash supabase/tests/rls_test.sh
```

Two outcome classes, kept apart on purpose:

- **PASS/FAIL** — security properties. A failure exits non-zero.
- **FIND** — behaviour that is weaker than it looks. Reported loudly but
  does not fail the run, because these are decisions for a human.

### Why the seed aborts loudly

An early version of this suite reported 34 passes while the seed had
silently failed halfway, so most assertions were run against empty tables.
Empty tables make almost every "cannot read" assertion pass. The seed is
now one transaction and the script exits 2 if it fails, because a partially
seeded database produces confident, meaningless green.

### Watch for passes that happen for the wrong reason

Two caught during development:

1. The harness's substitute overlap trigger did a `SELECT` on `bookings`.
   The real gist constraint performs no permission check, so the trigger
   denied `anon` for a reason production never would — turning three real
   findings into false "blocked" results. Fixed by making it
   `SECURITY DEFINER`.
2. The enquiry-insert probe was "blocked" by an unrelated permission error
   on the reference `DEFAULT`, not by the policy under test.

Both looked like security working. Neither was.
