import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  created_at: string;
}

const statuses = ["active", "on_hold", "completed", "archived"];

const IntranetProjects = () => {
  const { user } = useAdminAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active", color: "#6366f1" });

  const fetchData = async () => {
    const { data } = await supabase.from("intranet_projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);

    const { data: tasks } = await supabase.from("intranet_tasks").select("project_id");
    const counts: Record<string, number> = {};
    (tasks || []).forEach((t) => { if (t.project_id) counts[t.project_id] = (counts[t.project_id] || 0) + 1; });
    setTaskCounts(counts);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editing) {
      const { error } = await supabase.from("intranet_projects").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Project updated");
    } else {
      const { error } = await supabase.from("intranet_projects").insert({ ...form, created_by: user!.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Project created");
    }
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("intranet_projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted");
    fetchData();
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", status: p.status, color: p.color });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", status: "active", color: "#6366f1" });
    setDialogOpen(true);
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    on_hold: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Projects</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No projects yet. Create your first project to organize tasks.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t" style={{ backgroundColor: p.color }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-label flex items-center justify-between">
                  <span>{p.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(p)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description || "No description"}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColor[p.status] || ""}`}>
                    {p.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {taskCounts[p.id] || 0} tasks
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Color</label>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded border border-input cursor-pointer" />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntranetProjects;
