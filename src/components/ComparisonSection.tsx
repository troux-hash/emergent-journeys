import { ArrowUpRight, Check, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import RevealSection from "./RevealSection";
import SavingsCalculator from "./SavingsCalculator";

const rows = [
  ["Commission on a $1,000 booking", "$70", "$150 (15%) – $200 (20%)"],
  ["Revenue you keep", "$930", "$800–$850"],
  ["Saving with Fichua", "$80–$130", "—"],
  ["Guest relationship", "Yours", "Platform controlled"],
  ["AI-search visibility", "Included", "Not built for you"],
];

const ComparisonSection = () => (
  <section id="comparison" className="bg-parchment px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-5xl">
      <RevealSection>
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">The margin difference</p>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-6xl">Your subscription pays for itself after three to four bookings.</h2>
          <p className="mt-5 max-w-2xl font-body text-muted-foreground">On a $1,000 booking, Fichua saves $80–$130 compared with a platform charging 15%–20%. The exact break-even point depends on your lowest room rate.</p>
          <div className="mt-6 max-w-2xl overflow-x-auto border border-border">
            <table className="w-full min-w-[520px] border-collapse text-left font-body text-sm">
              <thead className="bg-earth-dark text-earth-light"><tr><th className="p-3 font-label text-[10px] uppercase tracking-[0.15em]">Month</th><th className="p-3 font-label text-[10px] uppercase tracking-[0.15em]">Bookings</th><th className="p-3 font-label text-[10px] uppercase tracking-[0.15em]">Savings</th><th className="p-3 font-label text-[10px] uppercase tracking-[0.15em]">Subscription</th><th className="p-3 font-label text-[10px] uppercase tracking-[0.15em] text-gold">Kept</th></tr></thead>
              <tbody>
                <tr className="bg-parchment"><th className="border-t border-border p-3 font-normal">Modest</th><td className="border-t border-border p-3">4 × $1,000</td><td className="border-t border-border p-3">$320–$520</td><td className="border-t border-border p-3">$300</td><td className="border-t border-border p-3 font-semibold">$20–$220</td></tr>
                <tr className="bg-parchment-dark"><th className="border-t border-border p-3 font-normal">Busy</th><td className="border-t border-border p-3">10 × $1,000</td><td className="border-t border-border p-3">$800–$1,300</td><td className="border-t border-border p-3">$300</td><td className="border-t border-border p-3 font-semibold">$500–$1,000</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-body text-xs text-muted-foreground">These examples use a $100 lowest room rate. Your subscription is three times your own lowest nightly rate; use the calculator below for your lodge.</p>
        </div>
      </RevealSection>
      <RevealSection delay={0.1}>
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="bg-earth-dark text-earth-light"><tr><th className="p-5 font-label text-xs uppercase tracking-[0.15em]">On each booking</th><th className="p-5 font-label text-xs uppercase tracking-[0.15em] text-gold">Fichua</th><th className="p-5 font-label text-xs uppercase tracking-[0.15em]">Large platforms</th></tr></thead>
            <tbody>{rows.map(([label, fichua, ota], index) => <tr key={label} className={index % 2 ? "bg-parchment-dark" : "bg-parchment"}><th className="border-t border-border p-5 font-body text-sm font-normal text-muted-foreground">{label}</th><td className="border-t border-border p-5 font-display text-xl text-foreground"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-gold" />{fichua}</span></td><td className="border-t border-border p-5 font-body text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><Minus className="h-4 w-4" />{ota}</span></td></tr>)}</tbody>
          </table>
        </div>
      </RevealSection>
      <RevealSection delay={0.12}>
        <Link to="/sample-lodge" className="mt-6 inline-flex items-center gap-2 font-label text-xs uppercase tracking-[0.15em] text-foreground underline decoration-gold underline-offset-4">
          See a fictional sample lodge page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </RevealSection>
      <RevealSection delay={0.15}><SavingsCalculator /></RevealSection>
    </div>
  </section>
);

export default ComparisonSection;