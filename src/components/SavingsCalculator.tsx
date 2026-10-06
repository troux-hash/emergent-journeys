import { useState } from "react";

const fmt = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;

const Field = ({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) => (
  <label htmlFor={id} className="block">
    <span className="mb-2 block font-label text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
    <input
      id={id}
      type="number"
      inputMode="decimal"
      min={0}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      className="w-full border border-border bg-parchment px-4 py-3 font-display text-xl text-foreground focus:border-gold focus:outline-none"
    />
  </label>
);

const SavingsCalculator = () => {
  const [roomRate, setRoomRate] = useState(100);
  const [bookingValue, setBookingValue] = useState(1000);
  const [bookings, setBookings] = useState(4);

  const saving = bookings * bookingValue * 0.13; // 20% OTA − 7% Fichua
  const subscription = roomRate * 3;
  const net = saving - subscription;
  const breakEven = bookingValue > 0 ? Math.ceil(subscription / (bookingValue * 0.13)) : 0;

  return (
    <div className="mt-12 border border-border bg-parchment-dark p-6 md:p-8">
      <p className="mb-2 font-label text-xs uppercase tracking-[0.3em] text-gold">Your numbers</p>
      <h3 className="mb-6 font-display text-3xl text-foreground">What would you keep?</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <Field id="calc-room" label="Lowest nightly room rate ($)" value={roomRate} onChange={setRoomRate} />
        <Field id="calc-value" label="Average booking value ($)" value={bookingValue} onChange={setBookingValue} />
        <Field id="calc-count" label="Fichua bookings per month" value={bookings} onChange={setBookings} />
      </div>
      <div className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-3">
        <div><p className="font-body text-xs text-muted-foreground">Saved vs a 20% platform</p><p className="font-display text-2xl text-foreground">{fmt(saving)}</p></div>
        <div><p className="font-body text-xs text-muted-foreground">Subscription (3 nights)</p><p className="font-display text-2xl text-foreground">{fmt(subscription)}</p></div>
        <div><p className="font-body text-xs text-muted-foreground">Kept each month</p><p className="font-display text-2xl text-gold">{fmt(net)}</p></div>
      </div>
      <p className="mt-4 font-body text-sm text-muted-foreground">
        {breakEven > 0 ? `Your subscription pays for itself after ${breakEven} booking${breakEven === 1 ? "" : "s"} a month.` : "Enter your booking value to see your break-even point."}
      </p>
    </div>
  );
};

export default SavingsCalculator;
