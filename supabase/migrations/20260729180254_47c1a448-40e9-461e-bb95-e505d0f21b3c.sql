CREATE OR REPLACE FUNCTION public.expire_stale_pending_bookings()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer := 0;
  v_row RECORD;
  v_operator_url text;
  v_reason text;
BEGIN
  FOR v_row IN
    UPDATE public.bookings b
       SET status = 'expired', updated_at = now()
      FROM public.operators o
     WHERE b.operator_id = o.id
       AND b.status = 'pending_operator'
       AND (b.created_at < now() - interval '7 days'
            OR b.check_out < CURRENT_DATE)
     RETURNING b.id, b.guest_name, b.guest_email, b.check_in, b.check_out,
               o.name AS operator_name, o.slug AS operator_slug
  LOOP
    v_count := v_count + 1;
    v_operator_url := 'https://fichua.co/operators/' || v_row.operator_slug;
    v_reason := CASE WHEN v_row.check_out < CURRENT_DATE
                     THEN 'dates_passed' ELSE 'unconfirmed' END;

    PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
      'templateName', 'booking-expired',
      'to', v_row.guest_email,
      'idempotencyKey', 'booking-expired-' || v_row.id,
      'data', jsonb_build_object(
        'guestName', v_row.guest_name,
        'operatorName', v_row.operator_name,
        'operatorUrl', v_operator_url,
        'checkIn', to_char(v_row.check_in, 'YYYY-MM-DD'),
        'checkOut', to_char(v_row.check_out, 'YYYY-MM-DD'),
        'reason', v_reason
      )
    ));
  END LOOP;
  RETURN v_count;
END;
$function$;