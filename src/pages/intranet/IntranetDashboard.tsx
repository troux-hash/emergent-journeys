import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, FolderKanban, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IntranetDashboard = () => {
  const [stats, setStats] = useState({ documents: 0, tasks: 0, projects: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const [docs, tasks, projects] = await Promise.all([
        supabase.from("intranet_documents").select("id", { count: "exact", head: true }),
        supabase.from("intranet_tasks").select("id, status, due_date, title, priority", { count: "exact" }),
        supabase.from("intranet_projects").select("id", { count: "exact", head: true }),
      ]);

      const taskData = tasks.data || [];
      const overdue = taskData.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
      ).length;

      setStats({
        documents: docs.count || 0,
        tasks: tasks.count || 0,
        projects: projects.count || 0,
        overdue,
      });

      setRecentTasks(taskData.slice(0, 5));
    };

    fetchStats();
  }, []);

  const cards = [
    { label: "Documents", value: stats.documents, icon: FileText, href: "/intranet/documents", color: "text-blue-600" },
    { label: "Tasks", value: stats.tasks, icon: CheckSquare, href: "/intranet/tasks", color: "text-green-600" },
    { label: "Projects", value: stats.projects, icon: FolderKanban, href: "/intranet/projects", color: "text-purple-600" },
    { label: "Overdue", value: stats.overdue, icon: Clock, href: "/intranet/tasks", color: "text-destructive" },
  ];

  const priorityColor: Record<string, string> = {
    urgent: "bg-destructive/10 text-destructive",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-primary/10 text-primary",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-display text-2xl text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card
            key={c.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(c.href)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-label tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                <c.icon className={`h-4 w-4 ${c.color}`} />
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-label tracking-wider uppercase text-muted-foreground">
            Recent Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet. Create your first task to get started.</p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-label ${priorityColor[task.priority] || ""}`}>
                    {task.priority}
                  </span>
                  <span className="flex-1 text-foreground">{task.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">{task.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntranetDashboard;
