import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SupportRequest {
  id: string;
  created_at: string;
  reporter_name: string | null;
  reporter_contact: string;
  message: string;
  status: string;
  operator_id: string | null;
  booking_id: string | null;
  operators: { name: string } | null;
}

const IntranetSupport = () => {
  const [open, setOpen] = useState<SupportRequest[]>([]);
  const [resolved, setResolved] = useState<SupportRequest[]>([]);

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from("support_requests")
      .select("id, created_at, reporter_name, reporter_contact, message, status, operator_id, booking_id, operators(name)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    const rows = (data as unknown as SupportRequest[]) || [];
    setOpen(rows.filter((r) => r.status === "open"));
    setResolved(rows.filter((r) => r.status !== "open"));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleResolve = async (id: string) => {
    const { error } = await supabase
      .from("support_requests")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marked resolved");
    fetchAll();
  };

  const handleReopen = async (id: string) => {
    const { error } = await supabase
      .from("support_requests")
      .update({ status: "open", resolved_at: null })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    fetchAll();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground mb-1">Support Requests</h1>
        <p className="text-sm text-muted-foreground">
          Reports filed directly to Fichua from any operator page — not routed through the operator. Reply to the
          reporter using the contact info below, then mark resolved.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Open ({open.length})
        </h2>
        {open.length === 0 && <p className="text-sm text-muted-foreground">Nothing open right now.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {open.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">
                    {r.reporter_name || "Anonymous"} {r.operators?.name ? `— ${r.operators.name}` : ""}
                  </p>
                  <Badge variant="destructive">open</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.reporter_contact} · {new Date(r.created_at).toLocaleString()}</p>
                <p className="text-sm text-foreground">{r.message}</p>
                <div className="pt-1">
                  <Button size="sm" onClick={() => handleResolve(r.id)}>Mark Resolved</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Resolved ({resolved.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resolved.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">
                    {r.reporter_name || "Anonymous"} {r.operators?.name ? `— ${r.operators.name}` : ""}
                  </p>
                  <Badge variant="outline">resolved</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.reporter_contact} · {new Date(r.created_at).toLocaleString()}</p>
                <p className="text-sm text-foreground">{r.message}</p>
                <div className="pt-1">
                  <Button size="sm" variant="outline" onClick={() => handleReopen(r.id)}>Reopen</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntranetSupport;
