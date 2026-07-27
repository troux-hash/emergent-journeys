import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Clock, Bell, Wallet, Moon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// Operator lifecycle dashboard (Stage 1 -- visibility only, no money moves).
//
// The panel that matters most here is "Approaching billing": an operator
// who is surprised by their first invoice churns and tells other
// operators. Contacting them before the 10th booking is the single
// highest-leverage trust moment in the whole lifecycle, so it's given
// top placement and its own alert styling.

interface Row {
  operator_id: string;
  name: string;
  slug: string;
  status: string;
  lifecycle_stage: string;
  lifecycle_changed_at: string;
  days_in_stage: number;
  delivered_bookings: number;
  bookings_until_billing: number;
  subscription_price: number | null;
  subscription_currency: string | null;
  projected_price: number | null;
  projected_uncapped: number | null;
  projected_currency: string | null;
  cap_amount: number | null;
  cap_applied: boolean;
  room_type_count: number;
  billing_started_at: string | null;
  last_booking_at: string | null;
  is_verified: boolean | null;
}

interface BookingDetail {
  booking_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
  currency: string;
  counted_at: string;
}

const STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  verifying: "Verifying",
  ready: "Ready to publish",
  live_free: "Live · free",
  live_subscribed: "Live · subscribed",
  dormant: "Dormant",
  paused: "Paused",
};

const STAGE_VARIANT: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  lead: "outline",
  verifying: "secondary",
  ready: "secondary",
  live_free: "default",
  live_subscribed: "default",
  dormant: "destructive",
  paused: "outline",
};

const money = (amount: number | null, currency: string | null) =>
  amount == null ? "—" : `${currency ?? ""}${Number(amount).toLocaleString()}`;

const IntranetLifecycle = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailFor, setDetailFor] = useState<Row | null>(null);
  const [details, setDetails] = useState<BookingDetail[]>([]);

  const fetchAll = async () => {
    const { data, error } = await supabase.rpc("operator_lifecycle_overview");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setRows((data as unknown as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openDetail = async (row: Row) => {
    setDetailFor(row);
    setDetails([]);
    const { data, error } = await supabase.rpc("delivered_bookings_detail", {
      p_operator_id: row.operator_id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDetails((data as unknown as BookingDetail[]) || []);
  };

  const stuckInVerification = rows.filter(
    (r) => (r.lifecycle_stage === "verifying" || r.lifecycle_stage === "lead") && r.days_in_stage >= 3
  );
  const approachingBilling = rows.filter(
    (r) => r.lifecycle_stage === "live_free" && r.delivered_bookings >= 8
  );
  const subscribed = rows.filter((r) => r.lifecycle_stage === "live_subscribed");
  const dormant = rows.filter((r) => r.lifecycle_stage === "dormant");
  // Reached billing but no price could be computed (no room types) --
  // these need attention or they'll sit in limbo.
  const needsPrice = rows.filter(
    (r) => r.delivered_bookings >= 10 && r.subscription_price == null
  );

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground mb-1">Operator Lifecycle</h1>
        <p className="text-sm text-muted-foreground">
          Where every operator stands, how close they are to billing, and what they'll pay.
          Tracking only — no payments are taken or sent from this page.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Approaching billing", value: approachingBilling.length, icon: Bell },
          { label: "Subscribed", value: subscribed.length, icon: Wallet },
          { label: "Stuck in verification", value: stuckInVerification.length, icon: Clock },
          { label: "Dormant", value: dormant.length, icon: Moon },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Needs a price -- blocking issue */}
      {needsPrice.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="flex items-center gap-2 font-medium text-sm text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              Reached 10 bookings but no price could be calculated ({needsPrice.length})
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              These operators have no room types with rates, so there's no average nightly rate to bill
              from. Add their room pricing in Operators, and billing will start automatically.
            </p>
            {needsPrice.map((r) => (
              <p key={r.operator_id} className="text-sm text-foreground">
                {r.name} — {r.delivered_bookings} bookings, {r.room_type_count} room types
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approaching billing -- the key panel */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Approaching billing ({approachingBilling.length}) — contact before their first charge
        </h2>
        {approachingBilling.length === 0 && (
          <p className="text-sm text-muted-foreground">Nobody within two bookings of billing.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {approachingBilling.map((r) => (
            <Card key={r.operator_id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm text-foreground">{r.name}</p>
                  <Badge>{r.bookings_until_billing} to go</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {r.delivered_bookings} of 10 delivered bookings
                </p>
                <p className="text-sm text-foreground">
                  Will pay <strong>{money(r.projected_price, r.projected_currency)}</strong> / month
                </p>
                {r.cap_applied && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    capped — 3 nights would be {money(r.projected_uncapped, r.projected_currency)}
                  </p>
                )}
                <Button variant="outline" size="sm" className="mt-3" onClick={() => openDetail(r)}>
                  See the {r.delivered_bookings} bookings
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stuck in verification */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Stuck in verification 3+ days ({stuckInVerification.length})
        </h2>
        {stuckInVerification.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing stalled.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stuckInVerification.map((r) => (
            <Card key={r.operator_id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {STAGE_LABEL[r.lifecycle_stage]} · {r.days_in_stage} days
                  </p>
                </div>
                <Badge variant="secondary">{r.days_in_stage}d</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All operators */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          All operators ({rows.length})
        </h2>
        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3 font-medium">Operator</th>
                <th className="p-3 font-medium">Stage</th>
                <th className="p-3 font-medium text-right">Bookings</th>
                <th className="p-3 font-medium text-right">Monthly</th>
                <th className="p-3 font-medium">Since</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.operator_id} className="border-t border-border">
                  <td className="p-3">
                    <span className="text-foreground">{r.name}</span>
                    {r.is_verified && (
                      <Badge variant="outline" className="ml-2 text-[10px]">Verified</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={STAGE_VARIANT[r.lifecycle_stage] || "outline"}>
                      {STAGE_LABEL[r.lifecycle_stage] || r.lifecycle_stage}
                    </Badge>
                  </td>
                  <td className="p-3 text-right tabular-nums">{r.delivered_bookings}</td>
                  <td className="p-3 text-right tabular-nums">
                    {r.subscription_price != null ? (
                      <span className="text-foreground">
                        {money(r.subscription_price, r.subscription_currency)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {money(r.projected_price, r.projected_currency)}
                        <span className="text-[10px] ml-1">{r.cap_applied ? "(capped)" : "(est.)"}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{r.days_in_stage}d</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(r)}>
                        Bookings
                      </Button>
                      {r.status === "published" && (
                        <a
                          href={`/operators/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit drawer: the bookings behind the count */}
      <Dialog open={!!detailFor} onOpenChange={(o) => { if (!o) setDetailFor(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailFor?.name} — counted bookings</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Every booking behind the count of {detailFor?.delivered_bookings}. Cancelled and refunded
            bookings are excluded and never count toward the first ten.
          </p>
          {details.length === 0 ? (
            <p className="text-sm text-muted-foreground">No counted bookings yet.</p>
          ) : (
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2">#</th>
                  <th className="py-2">Guest</th>
                  <th className="py-2">Stay</th>
                  <th className="py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d, i) => (
                  <tr key={d.booking_id} className="border-t border-border">
                    <td className="py-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2">{d.guest_name}</td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {d.check_in} → {d.check_out}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {money(d.total_price, d.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntranetLifecycle;
