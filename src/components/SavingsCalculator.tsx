import { useState } from "react";

const fmt = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;

const Field = ({ id, label, value, inputMode = "decimal", onChange }: { id: string; label: string; value: number; inputMode?: "decimal" | "numeric"; onChange: (v: number) => void }) => (
  <label htmlFor={id} className="block">
    <span className="mb-2 block font-label text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
    <input
      id={id}
      type="number"
      inputMode={inputMode}
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

  const savingLow = bookings * bookingValue * 0.08; // 15% OTA − 7% Fichua
  const savingHigh = bookings * bookingValue * 0.13; // 20% OTA − 7% Fichua
  const subscription = roomRate * 3;
  const netLow = savingLow - subscription;
  const netHigh = savingHigh - subscription;
  const breakEvenBest = bookingValue > 0 ? Math.ceil(subscription / (bookingValue * 0.13)) : 0;
  const breakEvenConservative = bookingValue > 0 ? Math.ceil(subscription / (bookingValue * 0.08)) : 0;

  return (
    <div className="mt-10 border border-border bg-parchment-dark p-6 md:p-8">
      <p className="mb-2 font-label text-xs uppercase tracking-[0.3em] text-gold">Use your numbers</p>
      <h3 className="font-display text-3xl text-foreground">Calculate your monthly savings</h3>
      <p className="mb-6 mt-2 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">Enter your lowest nightly rate and the bookings you expect Fichua to bring.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Field id="calc-room" label="Lowest nightly room rate ($)" value={roomRate} onChange={setRoomRate} />
        <Field id="calc-value" label="Average booking value ($)" value={bookingValue} onChange={setBookingValue} />
        <Field id="calc-count" label="Bookings from Fichua per month" value={bookings} inputMode="numeric" onChange={setBookings} />
      </div>
      <div aria-live="polite" className="mt-6 grid gap-5 border-t border-border pt-6 md:grid-cols-3">
        <div><p className="font-body text-xs text-muted-foreground">Commission saved</p><p className="font-display text-2xl text-foreground">{fmt(savingLow)}–{fmt(savingHigh)}</p><p className="mt-1 font-body text-xs text-muted-foreground">Compared with a 15%–20% platform</p></div>
        <div><p className="font-body text-xs text-muted-foreground">Monthly subscription</p><p className="font-display text-2xl text-foreground">{fmt(subscription)}</p><p className="mt-1 font-body text-xs text-muted-foreground">Three times your lowest nightly rate</p></div>
        <div><p className="font-body text-xs text-muted-foreground">Extra revenue kept</p><p className="font-display text-2xl text-gold">{fmt(netLow)}–{fmt(netHigh)}</p><p className="mt-1 font-body text-xs text-muted-foreground">After the monthly subscription</p></div>
      </div>
      <p className="mt-4 font-body text-sm text-muted-foreground">
        {breakEvenBest > 0 ? `At this average booking value, your subscription pays for itself after ${breakEvenBest}${breakEvenConservative !== breakEvenBest ? `–${breakEvenConservative}` : ""} booking${breakEvenConservative === 1 ? "" : "s"}.` : "Enter your booking value to see your break-even point."}
      </p>
    </div>
  );
};

export default SavingsCalculator;
