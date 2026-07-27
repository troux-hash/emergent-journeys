CREATE OR REPLACE FUNCTION public.notify_new_operator_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_base_url text;
  svc_key text;
BEGIN
  SELECT decrypted_secret INTO fn_base_url
    FROM vault.decrypted_secrets WHERE name = 'project_functions_base_url' LIMIT 1;
  SELECT decrypted_secret INTO svc_key
    FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;

  IF fn_base_url IS NULL OR svc_key IS NULL THEN
    RAISE NOTICE 'notify_new_operator_lead: vault secrets missing -- skipping notification for lead %', NEW.id;
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(fn_base_url, '/') || '/notify-new-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || svc_key
    ),
    body := jsonb_build_object('lead_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_operator_lead ON public.operator_leads;
CREATE TRIGGER trg_notify_new_operator_lead
  AFTER INSERT ON public.operator_leads
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_operator_lead();

REVOKE EXECUTE ON FUNCTION public.notify_new_operator_lead() FROM PUBLIC, anon, authenticated;