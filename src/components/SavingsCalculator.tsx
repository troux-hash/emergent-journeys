import { useState } from "react";
import { CURRENCIES, Currency, SUBSCRIPTION_USD, breakEven, formatMoney, monthlySavings } from "@/lib/pricing";

const Field = ({ id, label, value, inputMode = "decimal", onChange }: { id: string; label: string; value: number; inputMode?: "decimal" | "numeric"; onChange: (v: number) => void }) => (
  <label htmlFor={id} className="block">
    <span className="mb-2 block font-label text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
    <input id={id} type="number" inputMode={inputMode} min={0} value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} className="w-full border border-border bg-parchment px-4 py-3 font-display text-xl text-foreground focus:border-gold focus:outline-none" />
  </label>
);

const SavingsCalculator = () => {
  const [cur, setCur] = useState<Currency>("USD");
  const [valueUsd, setValueUsd] = useState(300);
  const [bookings, setBookings] = useState(10);
  const rate = CURRENCIES[cur].rate;
  const s = monthlySavings(valueUsd, bookings);
  const be = breakEven(valueUsd);
  const m = (n: number) => formatMoney(n, cur);

  return (
    <div className="border border-border bg-parchment-dark p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-label text-xs uppercase tracking-[0.3em] text-gold">Use your numbers</p>
          <h3 className="font-display text-3xl text-foreground">Your monthly savings, after the $99</h3>
        </div>
        <div role="group" aria-label="Currency" className="flex border border-border">
          {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
            <button key={c} type="button" onClick={() => setCur(c)} aria-pressed={cur === c} className={`px-3 py-2 font-label text-xs ${cur === c ? "bg-primary text-primary-foreground" : "text-foreground"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field id="calc-value" label={`Average booking value (${cur})`} value={Math.round(valueUsd * rate)} onChange={(v) => setValueUsd(v / rate)} />
        <Field id="calc-count" label="Bookings from Fichua per month" value={bookings} inputMode="numeric" onChange={setBookings} />
      </div>
      <div aria-live="polite" className="mt-6 grid gap-5 border-t border-border pt-6 md:grid-cols-3">
        <div><p className="font-body text-sm text-muted-foreground">Commission saved</p><p className="font-display text-2xl text-foreground">{m(s.savedLow)}–{m(s.savedHigh)}</p><p className="mt-1 font-body text-xs text-muted-foreground">vs a 15%–20% platform</p></div>
        <div><p className="font-body text-sm text-muted-foreground">Subscription</p><p className="font-display text-2xl text-foreground">−{m(SUBSCRIPTION_USD)}</p><p className="mt-1 font-body text-xs text-muted-foreground">Flat, every month</p></div>
        <div><p className="font-body text-sm text-muted-foreground">You keep</p><p className="font-display text-2xl text-gold">{m(s.keptLow)}–{m(s.keptHigh)}</p><p className="mt-1 font-body text-xs text-muted-foreground">Extra, per month</p></div>
      </div>
      <p className="mt-4 font-body text-base text-foreground">
        {be ? `Break-even: ${be.best}${be.conservative !== be.best ? `–${be.conservative}` : ""} bookings a month at this booking value.` : "Enter your booking value to see your break-even point."}
      </p>
      {cur !== "USD" && <p className="mt-2 font-body text-xs text-muted-foreground">Approximate conversion from USD; not a live exchange rate.</p>}
    </div>
  );
};

export default SavingsCalculator;
