import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Bookings, and the Confirm action.
//
// Until now nothing in the product set status = 'confirmed'. A traveller
// booked, the row sat at pending_operator, and the operator agreed verbally
// on WhatsApp -- so neither party held a written record and the calendar was
// never actually held. Confirming here does both: it takes the dates out of
// inventory via the exclusion constraint, and it sends the SAME record to
// the traveller and the operator.

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_whatsapp: string;
  guests: number;
  check_in: string;
  check_out: string;
  total_price: number;
  currency_snapshot: string;
  status: string;
  created_at: string;
  operators: { name: string } | null;
  room_types: { name: string } | null;
}

const STATUS_VARIANT: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  confirmed: "default",
  pending_operator: "destructive",
  awaiting_payment: "secondary",
  expired: "outline",
  cancelled: "outline",
};

const CONFIRMABLE = ["pending_operator", "awaiting_payment"];

const IntranetBookings = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, guest_name, guest_email, guest_whatsapp, guests, check_in, check_out, total_price, currency_snapshot, status, created_at, operators(name), room_types(name)"
      )
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) {
      toast.error("Could not load bookings", { description: error.message });
      return;
    }
    setRows((data ?? []) as unknown as Booking[]);
  };

  useEffect(() => {
    load();
  }, []);

  const confirm = async (b: Booking) => {
    setConfirming(b.id);
    const { data, error } = await supabase.rpc("confirm_booking", { p_booking_id: b.id });
    setConfirming(null);
    if (error) {
      // create_booking-style 22023 errors arrive here as readable sentences,
      // including the double-sell refusal remapped from 23P01.
      toast.error("Could not confirm", { description: error.message });
      return;
    }
    const r = (data ?? [])[0] as
      | { reference: string; notified_traveller: boolean; notified_operator: boolean }
      | undefined;
    if (r && (!r.notified_traveller || !r.notified_operator)) {
      toast.warning(`Confirmed ${r.reference}, but not everyone was emailed`, {
        description:
          "An alert has been raised on the dashboard — send the record manually to the missing party.",
      });
    } else {
      toast.success(`Confirmed ${r?.reference ?? ""}`, {
        description: "Traveller and operator both hold the same written record.",
      });
    }
    load();
  };

  const pending = rows.filter((r) => CONFIRMABLE.includes(r.status));
  const rest = rows.filter((r) => !CONFIRMABLE.includes(r.status));

  const renderRow = (b: Booking) => {
    const canConfirm = CONFIRMABLE.includes(b.status);
    return (
      <div key={b.id} className="flex flex-col gap-2 border-b py-4 last:border-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs">
            FCH-B-{b.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
          </span>
          <span className="text-sm font-medium">{b.operators?.name ?? "—"}</span>
          <span className="text-sm text-muted-foreground">{b.room_types?.name ?? "—"}</span>
          <Badge variant={STATUS_VARIANT[b.status] ?? "outline"}>{b.status}</Badge>
          <span className="ml-auto text-sm font-medium">
            {b.currency_snapshot} {Number(b.total_price).toFixed(2)}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>
            {b.check_in} → {b.check_out}
          </span>
          <span>· {b.guests} guest(s)</span>
          <span>· {b.guest_name}</span>
          <span>· {b.guest_email}</span>
          <span>· {b.guest_whatsapp}</span>
        </div>

        {canConfirm && (
          <div>
            <Button size="sm" onClick={() => confirm(b)} disabled={confirming === b.id}>
              <CalendarCheck size={14} className="mr-1" />
              {confirming === b.id ? "Confirming…" : "Confirm booking"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Confirming holds the dates and sends both parties the same record.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <AlertTriangle size={12} className="mr-1 inline" />
            Only confirm once the operator has actually agreed. Confirmation takes the room out
            of inventory for those nights and puts Fichua&rsquo;s name on a written promise to the
            traveller — a second guest turning up on the same night is the most damaging failure
            this product has.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-sm font-semibold">Awaiting confirmation ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              {loading ? "Loading…" : "Nothing waiting on a confirmation."}
            </p>
          ) : (
            pending.map(renderRow)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-sm font-semibold">Everything else</h2>
          {rest.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              {loading ? "Loading…" : "No other bookings yet."}
            </p>
          ) : (
            rest.map(renderRow)
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntranetBookings;
