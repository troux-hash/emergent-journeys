
-- Create storage bucket for intranet attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('intranet-attachments', 'intranet-attachments', false);

-- Storage RLS: admins can upload
CREATE POLICY "Admins can upload intranet attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'intranet-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Storage RLS: admins can view/download
CREATE POLICY "Admins can view intranet attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'intranet-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Storage RLS: admins can delete
CREATE POLICY "Admins can delete intranet attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'intranet-attachments'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create attachments tracking table
CREATE TABLE public.intranet_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.intranet_documents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intranet_attachments ENABLE ROW LEVEL SECURITY;

-- Admins can manage attachments
CREATE POLICY "Admins can manage attachments"
ON public.intranet_attachments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intranet_attachments TO authenticated;
