import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Doc {
  id: string;
  title: string;
  content: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const categories = ["general", "sop", "guide", "policy", "template"];

const IntranetDocuments = () => {
  const { user } = useAdminAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [viewing, setViewing] = useState<Doc | null>(null);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("intranet_documents")
      .select("*")
      .order("updated_at", { ascending: false });
    setDocs(data || []);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;
    if (!currentUser) { toast.error("You must be logged in"); return; }
    if (editing) {
      const { error } = await supabase
        .from("intranet_documents")
        .update({ title: form.title, content: form.content, category: form.category })
        .eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Document updated");
    } else {
      const { error } = await supabase
        .from("intranet_documents")
        .insert({ title: form.title, content: form.content, category: form.category, created_by: user!.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Document created");
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ title: "", content: "", category: "general" });
    fetchDocs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("intranet_documents").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Document deleted");
    setViewing(null);
    fetchDocs();
  };

  const openEdit = (doc: Doc) => {
    setEditing(doc);
    setForm({ title: doc.title, content: doc.content, category: doc.category });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", content: "", category: "general" });
    setDialogOpen(true);
  };

  const filtered = docs.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "all" || d.category === filterCat;
    return matchesSearch && matchesCat;
  });

  if (viewing) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewing(null)}>← Back</Button>
          <span className="text-xs font-label uppercase tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground">
            {viewing.category}
          </span>
        </div>
        <h1 className="font-display text-2xl text-foreground">{viewing.title}</h1>
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(viewing.updated_at).toLocaleDateString()}
        </p>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground font-body">
          {viewing.content || "No content yet."}
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => openEdit(viewing)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(viewing.id)}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Documents</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> New Document
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No documents found. Create your first document to get started.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewing(doc)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-label">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.content || "No content"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                    {doc.category}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Document" : "New Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Content (supports plain text / markdown)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
            />
            <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntranetDocuments;
