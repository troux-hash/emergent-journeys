import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, MessageCircle, Mail, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Enquiry queue.
//
// The number that matters on this page is time-to-first-reply, because it
// is the only part of Fichua's "almost instantly" promise that is
// measurable. Everything is therefore sorted by how long someone has been
// waiting, unanswered first -- a queue sorted by recency would bury the
// enquiry that has been ignored for two hours under one from a minute ago.
//
// Honest caveat, repeated here because it is easy to forget when reading
// a dashboard: responded_at is what the operator TOLD us. Fichua cannot
// see their WhatsApp. An operator who replies but never taps the link
// looks slow here and isn't. That's the cost of not intercepting the
// conversation, and it is the right trade.

interface Row {
  id: string;
  reference: string;
  operator_id: string;
  operator_name: string;
  channel: string;
  initial_message: string | null;
  created_at: string;
  responded_at: string | null;
  minutes_waiting: number;
  operator_nudged_at: string | null;
  team_escalated_at: string | null;
  outcome: string;
}

const CHANNEL_ICON: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  email: Mail,
  chat: MessageCircle,
  phone: Phone,
};

const OUTCOME_VARIANT: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  open: "destructive",
  responded: "secondary",
  booked: "default",
  lost: "outline",
  spam: "outline",
};

function humanMinutes(m: number): string {
  if (m < 60) return `${Math.round(m)} min`;
  if (m < 1440) return `${(m / 60).toFixed(1)} hr`;
  return `${Math.round(m / 1440)} d`;
}

const IntranetEnquiries = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("enquiry_queue");
    setLoading(false);
    if (error) {
      toast.error("Could not load enquiries", { description: error.message });
      return;
    }
    setRows((data ?? []) as Row[]);
  };

  useEffect(() => {
    load();
  }, []);

  // Manual trigger for the same job pg_cron runs every 5 minutes. Useful
  // for testing the nudge path without waiting, and for a human who spots
  // a stalled enquiry and wants to push now.
  const runEscalation = async () => {
    setRunning(true);
    const { data, error } = await supabase.rpc("run_enquiry_escalation");
    setRunning(false);
    if (error) {
      toast.error("Escalation run failed", { description: error.message });
      return;
    }
    const r = (data ?? [])[0] as { nudged: number; escalated: number } | undefined;
    toast.success(
      `Nudged ${r?.nudged ?? 0} operator(s), escalated ${r?.escalated ?? 0} to the team.`
    );
    load();
  };

  const unanswered = rows.filter((r) => !r.responded_at);
  const answered = rows.filter((r) => r.responded_at);
  const medianAnswered =
    answered.length > 0
      ? [...answered].map((r) => r.minutes_waiting).sort((a, b) => a - b)[
          Math.floor(answered.length / 2)
        ]
      : null;

  const renderRow = (r: Row) => {
    const Icon = CHANNEL_ICON[r.channel] ?? MessageCircle;
    const overdue = !r.responded_at && r.minutes_waiting > 60;
    return (
      <div
        key={r.id}
        className={`flex flex-col gap-2 border-b py-4 last:border-0 ${overdue ? "border-l-2 border-l-destructive pl-4" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Icon size={14} className="text-muted-foreground shrink-0" />
          <span className="font-mono text-xs">{r.reference}</span>
          <span className="text-sm font-medium">{r.operator_name}</span>
          <Badge variant={OUTCOME_VARIANT[r.outcome] ?? "outline"}>{r.outcome}</Badge>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {r.responded_at
              ? `answered in ${humanMinutes(r.minutes_waiting)}`
              : `waiting ${humanMinutes(r.minutes_waiting)}`}
          </span>
        </div>

        {r.initial_message && (
          <p className="text-sm text-muted-foreground line-clamp-2">{r.initial_message}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{new Date(r.created_at).toLocaleString()}</span>
          {r.operator_nudged_at && <span>· operator nudged</span>}
          {r.team_escalated_at && (
            <span className="text-destructive">· escalated to team</span>
          )}
          {r.responded_at && <span>· operator confirmed reply</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Enquiries</h1>
          <p className="text-sm text-muted-foreground">
            Every traveller who reached out, and how long they waited.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button size="sm" onClick={runEscalation} disabled={running}>
            {running ? "Running…" : "Run nudge check now"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Waiting</p>
            <p className="text-3xl font-semibold">{unanswered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Median reply time
            </p>
            <p className="text-3xl font-semibold">
              {medianAnswered !== null ? humanMinutes(medianAnswered) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total enquiries
            </p>
            <p className="text-3xl font-semibold">{rows.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="mb-2 text-xs text-muted-foreground">
            <AlertTriangle size={12} className="mr-1 inline" />
            &ldquo;Answered&rdquo; means the operator told us they replied — by tapping the link in
            their nudge. Fichua cannot see messages sent on an operator&rsquo;s own WhatsApp, so an
            operator who replies without confirming will look slower here than they are.
          </p>
        </CardContent>
      </Card>

      {unanswered.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-2 text-sm font-semibold">Still waiting</h2>
            {unanswered.map(renderRow)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-sm font-semibold">Answered</h2>
          {answered.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              {loading ? "Loading…" : "No answered enquiries yet."}
            </p>
          ) : (
            answered.map(renderRow)
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntranetEnquiries;
