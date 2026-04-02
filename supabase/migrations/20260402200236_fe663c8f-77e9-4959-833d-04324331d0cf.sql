GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.intranet_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.intranet_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.intranet_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;