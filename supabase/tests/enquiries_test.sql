-- Execution tests for the enquiries migration.
--
-- These EXECUTE every function rather than just parsing it. That matters:
-- Postgres only syntax-checks a plpgsql body at CREATE FUNCTION time, so
-- a semantic error (a bad column reference, an invalid FROM-clause
-- reference -- exactly the class of bug that shipped last time) is
-- invisible until the function actually runs.

\set ON_ERROR_STOP on
\timing off

DO $$
DECLARE
  op_a UUID;
  op_b UUID;
  op_draft UUID;
  v_ref TEXT;
  v_ref2 TEXT;
  v_ok BOOLEAN;
  v_n INT;
  v_e INT;
  v_cnt INT;
  v_median NUMERIC;
  v_pub BOOLEAN;
  v_txt TEXT;
BEGIN
  -- ---------- fixtures ----------
  INSERT INTO public.operators (name, slug, status, email, phone, city, country)
  VALUES ('Kilima Ridge', 'kilima-ridge', 'published', 'stay@kilima.test', '+250788000111', 'Musanze', 'Rwanda')
  RETURNING id INTO op_a;

  INSERT INTO public.operators (name, slug, status, email, phone, city, country)
  VALUES ('Lake House', 'lake-house', 'published', 'hi@lakehouse.test', '+250788000222', 'Kibuye', 'Rwanda')
  RETURNING id INTO op_b;

  INSERT INTO public.operators (name, slug, status, email, phone, city, country)
  VALUES ('Not Live Yet', 'not-live', 'draft', 'x@x.test', '+250788000333', 'Kigali', 'Rwanda')
  RETURNING id INTO op_draft;

  INSERT INTO public.room_types (operator_id, name, price_per_night, currency, max_guests)
  VALUES (op_a, 'Garden Room', 120, 'USD', 2), (op_a, 'Suite', 200, 'USD', 4);

  -- ---------- T1: create_enquiry returns a well-formed reference ----------
  v_ref := public.create_enquiry(op_a, 'whatsapp', 'Do you have space in August?');
  IF v_ref !~ '^FCH-[A-Z2-9]{6}$' THEN
    RAISE EXCEPTION 'T1 FAIL: reference malformed: %', v_ref;
  END IF;
  -- Ambiguous glyphs must be excluded: an operator has to read this off a
  -- phone screen and type it back.
  IF v_ref ~ '[IO01]' THEN
    RAISE EXCEPTION 'T1 FAIL: reference contains ambiguous character: %', v_ref;
  END IF;
  RAISE NOTICE 'T1 ok  create_enquiry -> %', v_ref;

  -- ---------- T2: references are unique across calls ----------
  v_ref2 := public.create_enquiry(op_b, 'email', 'Rates for a family of four?');
  IF v_ref2 = v_ref THEN
    RAISE EXCEPTION 'T2 FAIL: duplicate reference';
  END IF;
  RAISE NOTICE 'T2 ok  second reference distinct -> %', v_ref2;

  -- ---------- T3: unpublished operators are not contactable ----------
  BEGIN
    PERFORM public.create_enquiry(op_draft, 'whatsapp', 'hello');
    RAISE EXCEPTION 'T3 FAIL: created an enquiry against a draft operator';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%T3 FAIL%' THEN RAISE; END IF;
    RAISE NOTICE 'T3 ok  draft operator rejected (%)', SQLERRM;
  END;

  -- ---------- T4: invalid channel rejected ----------
  BEGIN
    PERFORM public.create_enquiry(op_a, 'carrier-pigeon', 'hello');
    RAISE EXCEPTION 'T4 FAIL: accepted an invalid channel';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%T4 FAIL%' THEN RAISE; END IF;
    RAISE NOTICE 'T4 ok  invalid channel rejected';
  END;

  -- ---------- T5: message is truncated, not rejected ----------
  v_txt := public.create_enquiry(op_a, 'chat', repeat('x', 5000));
  SELECT char_length(initial_message) INTO v_cnt FROM public.enquiries WHERE reference = v_txt;
  IF v_cnt <> 2000 THEN
    RAISE EXCEPTION 'T5 FAIL: expected truncation to 2000, got %', v_cnt;
  END IF;
  RAISE NOTICE 'T5 ok  oversized message truncated to 2000 chars';

  -- ---------- T6: acknowledge_enquiry, and its idempotence ----------
  v_ok := public.acknowledge_enquiry(v_ref, 'whatsapp');
  IF NOT v_ok THEN RAISE EXCEPTION 'T6 FAIL: first acknowledgement returned false'; END IF;

  SELECT outcome INTO v_txt FROM public.enquiries WHERE reference = v_ref;
  IF v_txt <> 'responded' THEN
    RAISE EXCEPTION 'T6 FAIL: outcome not advanced to responded, got %', v_txt;
  END IF;

  v_ok := public.acknowledge_enquiry(v_ref, 'whatsapp');
  IF v_ok THEN RAISE EXCEPTION 'T6 FAIL: second acknowledgement returned true'; END IF;
  RAISE NOTICE 'T6 ok  acknowledge sets responded, second tap is a no-op';

  -- ---------- T7: lowercase / padded reference still works ----------
  -- The operator is typing this off a phone. Case must not matter.
  v_ok := public.acknowledge_enquiry('  ' || lower(v_ref2) || ' ', 'link');
  IF NOT v_ok THEN
    RAISE EXCEPTION 'T7 FAIL: lowercase padded reference not accepted';
  END IF;
  RAISE NOTICE 'T7 ok  lowercase/whitespace-padded reference accepted';

  -- ---------- T8: unknown reference returns false, does not throw ----------
  v_ok := public.acknowledge_enquiry('FCH-ZZZZZZ', 'link');
  IF v_ok THEN RAISE EXCEPTION 'T8 FAIL: unknown reference returned true'; END IF;
  RAISE NOTICE 'T8 ok  unknown reference returns false';

  -- ---------- T9: escalation with no vault secrets raises an alert ----------
  DELETE FROM vault.decrypted_secrets;
  SELECT nudged, escalated INTO v_n, v_e FROM public.escalate_unanswered_enquiries();
  IF v_n <> 0 OR v_e <> 0 THEN
    RAISE EXCEPTION 'T9 FAIL: expected 0/0 with no secrets, got %/%', v_n, v_e;
  END IF;
  SELECT COUNT(*) INTO v_cnt FROM public.system_alerts
   WHERE kind = 'enquiry_escalation_skipped' AND resolved_at IS NULL;
  IF v_cnt <> 1 THEN
    RAISE EXCEPTION 'T9 FAIL: expected 1 open alert, got %', v_cnt;
  END IF;
  RAISE NOTICE 'T9 ok  missing secrets -> 0/0 and one open system alert';

  -- ---------- T10: with secrets, an old enquiry is nudged exactly once ----------
  INSERT INTO vault.decrypted_secrets VALUES
    ('project_functions_base_url', 'https://example.functions.test/'),
    ('email_queue_service_role_key', 'test-service-key');

  -- Age an open enquiry past the nudge threshold but not the escalation one.
  v_txt := public.create_enquiry(op_a, 'whatsapp', 'Waiting on a reply');
  UPDATE public.enquiries SET created_at = now() - interval '20 minutes' WHERE reference = v_txt;

  SELECT nudged, escalated INTO v_n, v_e FROM public.escalate_unanswered_enquiries();
  IF v_n <> 1 THEN RAISE EXCEPTION 'T10 FAIL: expected 1 nudge, got %', v_n; END IF;
  IF v_e <> 0 THEN RAISE EXCEPTION 'T10 FAIL: expected 0 escalations at 20 min, got %', v_e; END IF;

  SELECT COUNT(*) INTO v_cnt FROM net.sent
   WHERE body->>'kind' = 'operator_nudge' AND url = 'https://example.functions.test/enquiry-nudge';
  IF v_cnt <> 1 THEN
    RAISE EXCEPTION 'T10 FAIL: expected 1 operator_nudge http_post, got %', v_cnt;
  END IF;

  -- The trailing slash in the base url must not produce a double slash.
  IF EXISTS (SELECT 1 FROM net.sent WHERE url LIKE '%//enquiry-nudge') THEN
    RAISE EXCEPTION 'T10 FAIL: double slash in constructed url';
  END IF;
  RAISE NOTICE 'T10 ok  nudge sent once, url built correctly';

  -- The alert must clear itself once the job runs successfully again.
  SELECT COUNT(*) INTO v_cnt FROM public.system_alerts
   WHERE kind = 'enquiry_escalation_skipped' AND resolved_at IS NULL;
  IF v_cnt <> 0 THEN RAISE EXCEPTION 'T10 FAIL: alert not auto-resolved'; END IF;
  RAISE NOTICE 'T10 ok  previous alert auto-resolved on success';

  -- ---------- T11: a second run does not nudge the same enquiry again ----------
  SELECT nudged, escalated INTO v_n, v_e FROM public.escalate_unanswered_enquiries();
  IF v_n <> 0 THEN RAISE EXCEPTION 'T11 FAIL: re-nudged an already-nudged enquiry (%)', v_n; END IF;
  RAISE NOTICE 'T11 ok  no duplicate nudge on second run';

  -- ---------- T12: past 60 minutes it escalates to the team ----------
  UPDATE public.enquiries SET created_at = now() - interval '90 minutes' WHERE reference = v_txt;
  SELECT nudged, escalated INTO v_n, v_e FROM public.escalate_unanswered_enquiries();
  IF v_e <> 1 THEN RAISE EXCEPTION 'T12 FAIL: expected 1 escalation, got %', v_e; END IF;
  SELECT COUNT(*) INTO v_cnt FROM net.sent WHERE body->>'kind' = 'team_escalation';
  IF v_cnt <> 1 THEN RAISE EXCEPTION 'T12 FAIL: expected 1 team_escalation post, got %', v_cnt; END IF;
  RAISE NOTICE 'T12 ok  escalated to team after 60 min';

  -- ---------- T13: an answered enquiry is never chased ----------
  PERFORM public.acknowledge_enquiry(v_txt, 'whatsapp');
  DELETE FROM net.sent;
  v_txt := public.create_enquiry(op_b, 'whatsapp', 'Already handled');
  UPDATE public.enquiries
     SET created_at = now() - interval '3 hours', responded_at = now() - interval '2 hours'
   WHERE reference = v_txt;
  SELECT nudged, escalated INTO v_n, v_e FROM public.escalate_unanswered_enquiries();
  IF v_n <> 0 OR v_e <> 0 THEN
    RAISE EXCEPTION 'T13 FAIL: chased an answered enquiry (%/%)', v_n, v_e;
  END IF;
  RAISE NOTICE 'T13 ok  answered enquiries are not chased';

  -- ---------- T14: responsiveness is withheld below 5 data points ----------
  SELECT answered_count, median_minutes, is_publishable
    INTO v_cnt, v_median, v_pub
    FROM public.operator_responsiveness(op_a);
  IF v_pub THEN
    RAISE EXCEPTION 'T14 FAIL: publishable on only % answered enquiries', v_cnt;
  END IF;
  RAISE NOTICE 'T14 ok  responsiveness withheld at % answered (median %)', v_cnt, v_median;

  -- ---------- T15: with 5+ answers it becomes publishable, median is a median ----------
  -- Five answers at 2, 4, 6, 8 and 300 minutes. The median must be 6,
  -- not the mean (64) -- one absence should not define the operator.
  FOR v_n IN 1..5 LOOP
    v_txt := public.create_enquiry(op_b, 'whatsapp', 'ping ' || v_n);
    UPDATE public.enquiries
       SET created_at = now() - interval '10 hours',
           responded_at = now() - interval '10 hours'
                          + make_interval(mins => (ARRAY[2,4,6,8,300])[v_n])
     WHERE reference = v_txt;
  END LOOP;

  SELECT answered_count, median_minutes, is_publishable
    INTO v_cnt, v_median, v_pub
    FROM public.operator_responsiveness(op_b);
  IF NOT v_pub THEN RAISE EXCEPTION 'T15 FAIL: not publishable at % answered', v_cnt; END IF;
  IF v_median <> 6.0 THEN RAISE EXCEPTION 'T15 FAIL: expected median 6.0, got %', v_median; END IF;
  RAISE NOTICE 'T15 ok  publishable at %, median % min (mean would be 64)', v_cnt, v_median;

  -- ---------- T16: enquiry_queue executes and puts waiting first ----------
  v_txt := public.create_enquiry(op_a, 'whatsapp', 'Newest, unanswered');
  SELECT COUNT(*) INTO v_cnt FROM public.enquiry_queue();
  IF v_cnt = 0 THEN RAISE EXCEPTION 'T16 FAIL: queue returned no rows'; END IF;

  SELECT responded_at IS NULL INTO v_ok FROM public.enquiry_queue() LIMIT 1;
  IF NOT v_ok THEN
    RAISE EXCEPTION 'T16 FAIL: first queue row is already answered; unanswered must sort first';
  END IF;
  RAISE NOTICE 'T16 ok  enquiry_queue returns % rows, unanswered first', v_cnt;

  -- ---------- T17: minutes_waiting is populated for open enquiries ----------
  SELECT minutes_waiting INTO v_median FROM public.enquiry_queue()
   WHERE reference = v_txt;
  IF v_median IS NULL THEN RAISE EXCEPTION 'T17 FAIL: minutes_waiting is null'; END IF;
  RAISE NOTICE 'T17 ok  minutes_waiting computed (%)', v_median;

  -- ---------- T18: admin wrapper executes ----------
  SELECT nudged, escalated INTO v_n, v_e FROM public.run_enquiry_escalation();
  RAISE NOTICE 'T18 ok  run_enquiry_escalation executes (%/%)', v_n, v_e;

  RAISE NOTICE '---- all execution tests passed ----';
END $$;

-- ---------- T19/T20: admin guards actually deny a non-admin ----------
-- Run outside the DO block so the has_role flip is visible to the
-- STABLE function's snapshot.
UPDATE public._test_is_admin SET v = false;

DO $$
BEGIN
  BEGIN
    PERFORM public.enquiry_queue();
    RAISE EXCEPTION 'T19 FAIL: enquiry_queue returned data to a non-admin';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%T19 FAIL%' THEN RAISE; END IF;
    RAISE NOTICE 'T19 ok  enquiry_queue denies non-admin (%)', SQLERRM;
  END;

  BEGIN
    PERFORM public.run_enquiry_escalation();
    RAISE EXCEPTION 'T20 FAIL: run_enquiry_escalation ran for a non-admin';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%T20 FAIL%' THEN RAISE; END IF;
    RAISE NOTICE 'T20 ok  run_enquiry_escalation denies non-admin (%)', SQLERRM;
  END;

  RAISE NOTICE '---- admin guard tests passed ----';
END $$;
