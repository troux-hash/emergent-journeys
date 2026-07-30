#!/bin/bash
# RLS policy suite -- P0 test #1.
#
# WHY THIS EXISTS
# RLS is the entire security boundary of this application. `authenticated`
# holds SELECT/INSERT/UPDATE/DELETE grants on bookings, enquiries,
# operators and operator_leads, which means a row-level policy is the ONLY
# thing standing between any person who signs up and every traveller's
# email, phone number and booking history. Until now, nothing verified
# those policies at all.
#
# HOW IT WORKS
# Each case runs in its own transaction as a real Postgres role (anon or
# authenticated) with request.jwt.claims set exactly as Supabase sets it,
# so auth.uid() and has_role() behave as they do in production. Every
# transaction is rolled back.
#
# TWO OUTCOME CLASSES, kept separate on purpose:
#   MUST HOLD  -- a security property. Failure exits non-zero.
#   FINDING    -- current behaviour that is weaker than it looks. Reported
#                 loudly, does not fail the run, because these are design
#                 decisions for a human, not regressions.
set -u

PGBIN=${PGBIN:-/sessions/funny-sharp-lamport/.local/lib/python3.10/site-packages/pgserver/pginstall/bin}
P="$PGBIN/psql"
U=${U:-"postgresql://postgres:@/rlstest?host=/tmp/pgdata"}

PASS=0; FAIL=0; FINDINGS=0
ADMIN_UID="aaaaaaaa-0000-0000-0000-000000000001"
USER_UID="bbbbbbbb-0000-0000-0000-000000000002"

# Run SQL as a role with JWT claims. Echoes either "ROWS:<n>" or "ERR:<msg>".
as() {
  local role="$1" uid="$2" sql="$3" claims
  if [ -z "$uid" ]; then claims="{\"role\":\"$role\"}";
  else claims="{\"sub\":\"$uid\",\"role\":\"$role\"}"; fi
  local out
  # -q suppresses command tags (ROLLBACK etc) so only query output remains.
  # \set QUIET and a sentinel keep the set_config result out of the way.
  out=$("$P" "$U" -tAq -v ON_ERROR_STOP=1 2>&1 <<SQL
BEGIN;
SELECT set_config('request.jwt.claims', '$claims', true) INTO TEMP _c;
SET LOCAL ROLE $role;
$sql
ROLLBACK;
SQL
)
  if echo "$out" | grep -qi "ERROR"; then
    echo "ERR:$(echo "$out" | grep -i ERROR | head -1 | sed 's/.*ERROR: *//')"
  else
    echo "ROWS:$(echo "$out" | grep -v '^$' | tail -1)"
  fi
}

ok()      { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad()     { FAIL=$((FAIL+1)); printf '  FAIL  %s\n        got: %s\n' "$1" "$2"; }
finding() { FINDINGS=$((FINDINGS+1)); printf '  FIND  %s\n        %s\n' "$1" "$2"; }

must_see_nothing() {
  local desc="$1" role="$2" uid="$3" sql="$4"
  local r; r=$(as "$role" "$uid" "SELECT count(*) FROM ($sql) x;")
  case "$r" in
    ROWS:0) ok "$desc" ;;
    ERR:*)  ok "$desc  [blocked at grant level]" ;;
    *)      bad "$desc" "$r -- data was readable" ;;
  esac
}

must_see() {
  local desc="$1" role="$2" uid="$3" want="$4" sql="$5"
  local r; r=$(as "$role" "$uid" "SELECT count(*) FROM ($sql) x;")
  [ "$r" = "ROWS:$want" ] && ok "$desc" || bad "$desc (wanted $want)" "$r"
}

must_fail() {
  local desc="$1" role="$2" uid="$3" sql="$4"
  local r; r=$(as "$role" "$uid" "$sql")
  case "$r" in
    ERR:*) ok "$desc" ;;
    *)     bad "$desc" "$r -- the write SUCCEEDED" ;;
  esac
}

must_succeed() {
  local desc="$1" role="$2" uid="$3" sql="$4"
  local r; r=$(as "$role" "$uid" "$sql")
  case "$r" in
    ERR:*) bad "$desc" "$r" ;;
    *)     ok "$desc" ;;
  esac
}

# For UPDATE/DELETE, RLS silently affects 0 rows rather than raising. That
# is still a denial -- but it has to be asserted on the row count, not on
# an exception, or the test reports a pass for the wrong reason.
must_change_nothing() {
  local desc="$1" role="$2" uid="$3" sql="$4"
  local r; r=$(as "$role" "$uid" "WITH d AS ($sql RETURNING 1) SELECT count(*) FROM d;")
  case "$r" in
    ROWS:0) ok "$desc" ;;
    ERR:*)  ok "$desc  [blocked with an error]" ;;
    *)      bad "$desc" "$r row(s) changed" ;;
  esac
}

probe() {
  local desc="$1" role="$2" uid="$3" sql="$4" note="$5"
  local r; r=$(as "$role" "$uid" "$sql")
  case "$r" in
    ERR:*) ok "$desc is blocked" ;;
    *)     finding "$desc SUCCEEDED" "$note" ;;
  esac
}

echo "=============================================="
echo " RLS policy suite"
echo "=============================================="

"$P" "$U" -q -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
TRUNCATE public.bookings, public.reviews, public.room_types, public.enquiries,
         public.operator_leads, public.support_requests, public.user_roles,
         public.profiles, public.operators CASCADE;

INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@fichua.test'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'random@signup.test')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin');

-- An on-signup trigger on auth.users already creates these rows; upsert.
INSERT INTO public.profiles (user_id, display_name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Admin'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Random Signup')
ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- A published operator must satisfy operators_publish_requires_verification:
-- all four verification flags true. Good constraint; discovered by this test.
INSERT INTO public.operators (id, name, slug, status, email, phone, city, country, description,
  identity_verified, photo_gps_verified, whatsapp_verified, payout_verified)
VALUES ('11111111-1111-1111-1111-111111111111', 'Published Place', 'published-place',
        'published', 'a@a.test', '+250700000001', 'Musanze', 'Rwanda', 'A live listing.',
        true, true, true, true),
       ('22222222-2222-2222-2222-222222222222', 'Secret Draft', 'secret-draft',
        'draft', 'b@b.test', '+250700000002', 'Kigali', 'Rwanda', 'Not for the public.',
        false, false, false, false);

INSERT INTO public.room_types (id, operator_id, name, price_per_night, currency, max_guests)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
        'Garden Room', 150, 'USD', 2),
       ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
        'Hidden Room', 999, 'USD', 2);

INSERT INTO public.bookings (operator_id, room_type_id, guest_name, guest_email,
  guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
  currency_snapshot, total_price, status)
VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
        'Real Guest', 'guest@private.test', '+250700000009', 2,
        '2026-09-01', '2026-09-04', 150, 'USD', 450, 'confirmed');

-- A booking still waiting on the operator, so the Confirm action has
-- something real to act on. Dates deliberately clear of the confirmed one.
INSERT INTO public.bookings (id, operator_id, room_type_id, guest_name, guest_email,
  guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
  currency_snapshot, total_price, status)
VALUES ('77777777-7777-7777-7777-777777777777',
        '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
        'Pending Guest', 'pending@private.test', '+250700000010', 2,
        '2026-10-01', '2026-10-04', 150, 'USD', 450, 'pending_operator');



INSERT INTO public.reviews (operator_id, booking_id, source, rating, review_text, moderation_status, reviewer_name)
SELECT '11111111-1111-1111-1111-111111111111', b.id, 'fichua_verified', 5,
       'Approved and visible', 'approved', 'A'
  FROM public.bookings b LIMIT 1;
INSERT INTO public.reviews (operator_id, source, rating, review_text, moderation_status, reviewer_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'google', 1, 'Pending moderation', 'pending', 'B');

INSERT INTO public.operator_leads (property_name, phone, email, status)
VALUES ('Lead Property', '+250700000010', 'lead@private.test', 'new');
COMMIT;
SQL
if [ $? -ne 0 ]; then echo "SEED FAILED -- aborting, results would be meaningless"; exit 2; fi
echo "seed ok"

echo
echo "--- 1. Anonymous visitors: what can they read? ---"
must_see "anon sees only the published operator" anon "" 1 \
  "SELECT id FROM public.operators"
must_see_nothing "anon cannot see the draft operator" anon "" \
  "SELECT id FROM public.operators WHERE slug='secret-draft'"
must_see "anon sees rooms only for published operators" anon "" 1 \
  "SELECT id FROM public.room_types"
must_see "anon sees only approved reviews" anon "" 1 \
  "SELECT id FROM public.reviews"
must_see_nothing "anon cannot read bookings (guest emails, prices)" anon "" \
  "SELECT id FROM public.bookings"
must_see_nothing "anon cannot read enquiries" anon "" \
  "SELECT id FROM public.enquiries"
must_see_nothing "anon cannot read operator sign-up leads" anon "" \
  "SELECT id FROM public.operator_leads"
must_see_nothing "anon cannot read user_roles" anon "" \
  "SELECT user_id FROM public.user_roles"
must_see_nothing "anon cannot read profiles" anon "" \
  "SELECT user_id FROM public.profiles"
must_see_nothing "anon cannot read support requests" anon "" \
  "SELECT id FROM public.support_requests"
must_see_nothing "anon cannot read chat messages" anon "" \
  "SELECT id FROM public.chat_messages"
must_see_nothing "anon cannot read system alerts" anon "" \
  "SELECT id FROM public.system_alerts"
must_see_nothing "anon cannot read discoverability tests" anon "" \
  "SELECT id FROM public.discoverability_tests"

echo
echo "--- 2. A random signed-up user is NOT an admin ---"
must_see_nothing "signed-in non-admin cannot read bookings" authenticated "$USER_UID" \
  "SELECT id FROM public.bookings"
must_see_nothing "signed-in non-admin cannot read enquiries" authenticated "$USER_UID" \
  "SELECT id FROM public.enquiries"
must_see_nothing "signed-in non-admin cannot read operator leads" authenticated "$USER_UID" \
  "SELECT id FROM public.operator_leads"
must_see_nothing "signed-in non-admin cannot read user_roles" authenticated "$USER_UID" \
  "SELECT user_id FROM public.user_roles"
must_see_nothing "signed-in non-admin cannot see the draft operator" authenticated "$USER_UID" \
  "SELECT id FROM public.operators WHERE slug='secret-draft'"
must_see_nothing "signed-in non-admin cannot read unmoderated reviews" authenticated "$USER_UID" \
  "SELECT id FROM public.reviews WHERE moderation_status='pending'"
must_see_nothing "signed-in non-admin cannot read intranet documents" authenticated "$USER_UID" \
  "SELECT id FROM public.intranet_documents"
must_see "signed-in non-admin sees only their OWN profile" authenticated "$USER_UID" 1 \
  "SELECT user_id FROM public.profiles"

echo
echo "--- 3. Privilege escalation ---"
must_fail "non-admin cannot grant themselves admin" authenticated "$USER_UID" \
  "INSERT INTO public.user_roles (user_id, role) VALUES ('$USER_UID','admin');"
must_change_nothing "non-admin cannot delete an admin's role" authenticated "$USER_UID" \
  "DELETE FROM public.user_roles WHERE user_id='$ADMIN_UID'"
must_fail "anon cannot grant any role" anon "" \
  "INSERT INTO public.user_roles (user_id, role) VALUES ('$USER_UID','admin');"
must_change_nothing "non-admin cannot reassign their profile to another user" authenticated "$USER_UID" \
  "UPDATE public.profiles SET user_id='$ADMIN_UID' WHERE user_id='$USER_UID'"

echo
echo "--- 4. Anonymous write abuse ---"
must_change_nothing "anon cannot publish an operator" anon "" \
  "UPDATE public.operators SET status='published' WHERE slug='secret-draft'"
must_fail "anon cannot create an operator" anon "" \
  "INSERT INTO public.operators (name, slug, status) VALUES ('Fake','fake','published');"
must_change_nothing "anon cannot change a room price" anon "" \
  "UPDATE public.room_types SET price_per_night=1 WHERE id='33333333-3333-3333-3333-333333333333'"
must_fail "anon cannot write a review" anon "" \
  "INSERT INTO public.reviews (operator_id, source, rating, review_text, moderation_status, reviewer_name)
   VALUES ('11111111-1111-1111-1111-111111111111', 'google', 5, 'Fake', 'approved', 'Bot');"
must_change_nothing "anon cannot approve a pending review" anon "" \
  "UPDATE public.reviews SET moderation_status='approved' WHERE moderation_status='pending'"
must_fail "anon cannot confirm a booking directly" anon "" \
  "INSERT INTO public.bookings (operator_id, room_type_id, guest_name, guest_email,
     guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
     currency_snapshot, total_price, status)
   VALUES ('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333',
     'X','x@x.test','+250700000011',1,'2027-01-01','2027-01-02',150,'USD',150,'confirmed');"
must_fail "anon cannot mark an enquiry as already responded" anon "" \
  "INSERT INTO public.enquiries (operator_id, channel, responded_at)
   VALUES ('11111111-1111-1111-1111-111111111111','whatsapp', now());"
must_change_nothing "anon cannot delete a booking" anon "" \
  "DELETE FROM public.bookings"

echo
echo "--- 5. Intended anonymous writes still work ---"
must_succeed "anon can submit an operator sign-up lead" anon "" \
  "INSERT INTO public.operator_leads (property_name, phone) VALUES ('New Lodge','+250700000012');"
must_succeed "anon can create an enquiry via the RPC" anon "" \
  "SELECT public.create_enquiry('11111111-1111-1111-1111-111111111111','whatsapp','hello');"
must_succeed "anon can acknowledge an enquiry by reference" anon "" \
  "SELECT public.acknowledge_enquiry('FCH-ZZZZZZ','link');"

echo
echo "--- 6. Admin-only functions reject everyone else ---"
must_fail "anon cannot call enquiry_queue()" anon "" \
  "SELECT public.enquiry_queue();"
must_fail "non-admin cannot call enquiry_queue()" authenticated "$USER_UID" \
  "SELECT public.enquiry_queue();"
must_fail "non-admin cannot call operator_lifecycle_overview()" authenticated "$USER_UID" \
  "SELECT public.operator_lifecycle_overview();"
must_fail "non-admin cannot read revenue via delivered_bookings_detail()" authenticated "$USER_UID" \
  "SELECT public.delivered_bookings_detail('11111111-1111-1111-1111-111111111111');"
must_fail "non-admin cannot call publish_readiness()" authenticated "$USER_UID" \
  "SELECT public.publish_readiness('11111111-1111-1111-1111-111111111111');"
must_fail "non-admin cannot seed baseline tests" authenticated "$USER_UID" \
  "SELECT public.seed_baseline_tests('11111111-1111-1111-1111-111111111111');"
must_fail "non-admin cannot trigger the escalation job" authenticated "$USER_UID" \
  "SELECT public.run_enquiry_escalation();"
must_fail "anon cannot confirm a booking via confirm_booking()" anon "" \
  "SELECT public.confirm_booking('77777777-7777-7777-7777-777777777777');"
must_fail "non-admin cannot confirm a booking via confirm_booking()" authenticated "$USER_UID" \
  "SELECT public.confirm_booking('77777777-7777-7777-7777-777777777777');"

echo
echo "--- 7. Admin can do its job (guards are not over-tight) ---"
must_see "admin can read bookings" authenticated "$ADMIN_UID" 2 \
  "SELECT id FROM public.bookings"
must_see "admin can see both operators" authenticated "$ADMIN_UID" 2 \
  "SELECT id FROM public.operators"
must_see "admin can see pending reviews" authenticated "$ADMIN_UID" 2 \
  "SELECT id FROM public.reviews"
must_succeed "admin can call enquiry_queue()" authenticated "$ADMIN_UID" \
  "SELECT count(*) FROM public.enquiry_queue();"
must_succeed "admin can trigger guarded enquiry escalation wrapper" authenticated "$ADMIN_UID" \
  "SELECT * FROM public.run_enquiry_escalation();"
must_succeed "admin can call operator_lifecycle_overview()" authenticated "$ADMIN_UID" \
  "SELECT count(*) FROM public.operator_lifecycle_overview();"
must_succeed "admin can inspect delivered booking detail" authenticated "$ADMIN_UID" \
  "SELECT count(*) FROM public.delivered_bookings_detail('11111111-1111-1111-1111-111111111111');"
must_succeed "admin can call open_system_alerts()" authenticated "$ADMIN_UID" \
  "SELECT count(*) FROM public.open_system_alerts();"
must_succeed "admin can call publish_readiness()" authenticated "$ADMIN_UID" \
  "SELECT count(*) FROM public.publish_readiness('11111111-1111-1111-1111-111111111111');"
must_succeed "admin can seed baseline tests" authenticated "$ADMIN_UID" \
  "SELECT public.seed_baseline_tests('11111111-1111-1111-1111-111111111111');"
must_succeed "admin can confirm a pending booking" authenticated "$ADMIN_UID" \
  "SELECT reference FROM public.confirm_booking('77777777-7777-7777-7777-777777777777');"
# Confirming twice must not silently succeed -- the second call has nothing in
# a confirmable state, and a no-op that reports success would tell an admin a
# record was re-sent when it was not.
must_fail "confirming an already-confirmed booking is refused" authenticated "$ADMIN_UID" \
  "SELECT public.confirm_booking('77777777-7777-7777-7777-777777777777');
   SELECT public.confirm_booking('77777777-7777-7777-7777-777777777777');"
# The one that matters: confirming must never double-sell the calendar.
must_fail "confirming dates already confirmed for the room is refused" authenticated "$ADMIN_UID" \
  "INSERT INTO public.bookings (id, operator_id, room_type_id, guest_name, guest_email,
     guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
     currency_snapshot, total_price, status)
   VALUES ('88888888-8888-8888-8888-888888888888',
     '11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333',
     'Clash','clash@x.test','+250700000012',1,'2026-09-02','2026-09-03',150,'USD',150,
     'pending_operator');
   SELECT public.confirm_booking('88888888-8888-8888-8888-888888888888');"

echo
echo "--- 8. Probes: weaker than they look? ---"
probe "anon inserting a booking with total_price = 0" anon "" \
  "INSERT INTO public.bookings (operator_id, room_type_id, guest_name, guest_email,
     guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
     currency_snapshot, total_price, status)
   VALUES ('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333',
     'Freeloader','free@x.test','+250700000013',1,'2027-03-01','2027-03-08',0,'USD',0,'pending');" \
  "The INSERT policy validates guest_name, guest_whatsapp and status but says NOTHING about price. An anonymous caller can post a 7-night booking for 0 and it is stored as a legitimate pending booking. Price must be recomputed server-side from room_types, never trusted from the client."

probe "anon booking a room belonging to an UNPUBLISHED operator" anon "" \
  "INSERT INTO public.bookings (operator_id, room_type_id, guest_name, guest_email,
     guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
     currency_snapshot, total_price, status)
   VALUES ('22222222-2222-2222-2222-222222222222','44444444-4444-4444-4444-444444444444',
     'Ghost','ghost@x.test','+250700000014',1,'2027-04-01','2027-04-02',999,'USD',999,'pending');" \
  "The operator is not publicly visible, yet it can be booked. The INSERT policy never checks operator status, so a draft or paused listing is still bookable by anyone who knows the ids."

probe "anon inserting an enquiry against an UNPUBLISHED operator" anon "" \
  "INSERT INTO public.enquiries (operator_id, channel, initial_message)
   VALUES ('22222222-2222-2222-2222-222222222222','whatsapp','direct table insert');" \
  "NOTE: after 20260728050000 this is blocked because anon INSERT is revoked entirely -- the RPC is the only entrance. Before that migration it was blocked only by an unrelated permission error on the reference DEFAULT, which was a pass for the wrong reason. Original concern: create_enquiry() refuses unpublished operators but the RLS policy behind the REST endpoint did not. Anyone posting straight to /rest/v1/enquiries bypasses the check the function enforces -- the policy is looser than the function it sits behind."

probe "anon booking dates in the past" anon "" \
  "INSERT INTO public.bookings (operator_id, room_type_id, guest_name, guest_email,
     guest_whatsapp, guests, check_in, check_out, price_per_night_snapshot,
     currency_snapshot, total_price, status)
   VALUES ('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333',
     'TimeTraveller','past@x.test','+250700000015',1,'2020-01-01','2020-01-02',150,'USD',150,'pending');" \
  "Only check_out > check_in is enforced. Bookings can be created entirely in the past, which will pollute delivered-booking counts and therefore subscription billing."

echo
echo "=============================================="
printf ' %s passed, %s failed, %s findings\n' "$PASS" "$FAIL" "$FINDINGS"
echo "=============================================="
[ "$FAIL" -eq 0 ] || exit 1
exit 0
