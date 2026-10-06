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
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-6xl">Be visible. Be bookable. Increase your revenue.</h2>
          <p className="mt-5 max-w-2xl font-body text-muted-foreground">And keep more when you do. On a $1,000 booking, Fichua saves $80–$130 compared with a platform charging 15%–20% — so your $99 subscription pays for itself after one or two bookings.</p>
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
      <RevealSection delay={0.15}><SavingsCalculator /></RevealSection>
    </div>
  </section>
);

export default ComparisonSection;