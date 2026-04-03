import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Paperclip, Trash2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Attachment {
  id: string;
  document_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  uploaded_by: string;
  created_at: string;
}

interface Props {
  documentId: string | null; // null = new unsaved doc (upload after save)
  userId: string;
  readOnly?: boolean;
  /** For new docs: parent collects pending files to upload after save */
  onPendingFiles?: (files: File[]) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentAttachments = ({ documentId, userId, readOnly, onPendingFiles }: Props) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = async () => {
    if (!documentId) return;
    const { data } = await supabase
      .from("intranet_attachments")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });
    setAttachments((data as Attachment[]) || []);
  };

  useEffect(() => {
    fetchAttachments();
  }, [documentId]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // If no documentId yet (new doc), queue files for later
    if (!documentId) {
      const newPending = [...pendingFiles, ...Array.from(files)];
      setPendingFiles(newPending);
      onPendingFiles?.(newPending);
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10 MB limit`);
          continue;
        }

        const path = `${documentId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("intranet-attachments")
          .upload(path, file);

        if (uploadError) {
          toast.error(`Upload failed: ${uploadError.message}`);
          continue;
        }

        const { error: dbError } = await supabase
          .from("intranet_attachments")
          .insert({
            document_id: documentId,
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            content_type: file.type || "application/octet-stream",
            uploaded_by: userId,
          });

        if (dbError) {
          toast.error(`Failed to save attachment record: ${dbError.message}`);
        }
      }
      toast.success("File(s) uploaded");
      await fetchAttachments();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDownload = async (att: Attachment) => {
    const { data, error } = await supabase.storage
      .from("intranet-attachments")
      .createSignedUrl(att.file_path, 60);

    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (att: Attachment) => {
    await supabase.storage.from("intranet-attachments").remove([att.file_path]);
    const { error } = await supabase
      .from("intranet_attachments")
      .delete()
      .eq("id", att.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Attachment removed");
    await fetchAttachments();
  };

  const removePending = (index: number) => {
    const updated = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(updated);
    onPendingFiles?.(updated);
  };

  const allFiles = [
    ...pendingFiles.map((f, i) => ({ pending: true as const, index: i, name: f.name, size: f.size })),
    ...attachments.map((a) => ({ pending: false as const, attachment: a, name: a.file_name, size: a.file_size })),
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Attachments {allFiles.length > 0 && `(${allFiles.length})`}
        </span>
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Paperclip className="h-3 w-3 mr-1" />}
            Attach file
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {allFiles.length === 0 && (
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
      )}

      <ul className="space-y-1">
        {allFiles.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1.5">
            <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate flex-1">{item.name}</span>
            <span className="text-muted-foreground shrink-0">{formatSize(item.size)}</span>
            {item.pending ? (
              <>
                <span className="text-muted-foreground italic">pending</span>
                {!readOnly && (
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removePending(item.index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleDownload(item.attachment)}>
                  <Download className="h-3 w-3" />
                </Button>
                {!readOnly && (
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleDelete(item.attachment)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Upload pending files for a newly created document */
export const uploadPendingFiles = async (
  documentId: string,
  userId: string,
  files: File[]
) => {
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) continue;
    const path = `${documentId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("intranet-attachments")
      .upload(path, file);
    if (uploadError) continue;

    await supabase.from("intranet_attachments").insert({
      document_id: documentId,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      content_type: file.type || "application/octet-stream",
      uploaded_by: userId,
    });
  }
};

export default DocumentAttachments;
