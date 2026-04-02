import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  project_id: string | null;
  due_date: string | null;
  created_by: string;
}

interface Project {
  id: string;
  name: string;
}

const columns = [
  { key: "todo", label: "To Do", color: "border-muted-foreground/30" },
  { key: "in_progress", label: "In Progress", color: "border-primary/50" },
  { key: "done", label: "Done", color: "border-green-500/50" },
];

const priorities = ["low", "medium", "high", "urgent"];

const priorityColor: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

const IntranetTasks = () => {
  const { user } = useAdminAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", status: "todo", priority: "medium",
    project_id: "", due_date: "",
  });

  const fetchData = async () => {
    const [t, p] = await Promise.all([
      supabase.from("intranet_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("intranet_projects").select("id, name").order("name"),
    ]);
    setTasks(t.data || []);
    setProjects(p.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload: any = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      project_id: form.project_id || null,
      due_date: form.due_date || null,
    };

    if (editing) {
      const { error } = await supabase.from("intranet_tasks").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Task updated");
    } else {
      payload.created_by = user!.id;
      const { error } = await supabase.from("intranet_tasks").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Task created");
    }
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await supabase.from("intranet_tasks").update({ status: newStatus }).eq("id", taskId);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("intranet_tasks").delete().eq("id", id);
    toast.success("Task deleted");
    setDialogOpen(false);
    setEditing(null);
    fetchData();
  };

  const openNew = (status = "todo") => {
    setEditing(null);
    setForm({ title: "", description: "", status, priority: "medium", project_id: "", due_date: "" });
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      project_id: task.project_id || "",
      due_date: task.due_date || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Tasks</h1>
        <Button size="sm" onClick={() => openNew()}>
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={`border-t-2 ${col.color} pt-3 space-y-2`}>
              <div className="flex items-center justify-between px-1">
                <span className="font-label text-xs tracking-wider uppercase text-muted-foreground">
                  {col.label} ({colTasks.length})
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openNew(col.key)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {colTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openEdit(task)}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColor[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className={`text-xs ${
                          new Date(task.due_date) < new Date() && task.status !== "done"
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        }`}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="No project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No project</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
              {editing && (
                <Button variant="destructive" onClick={() => handleDelete(editing.id)}>Delete</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntranetTasks;
