import { Check, Minus } from "lucide-react";
import RevealSection from "./RevealSection";

const rows = [
  ["Commission on a $500 booking", "$35", "$75 (15%) – $100 (20%)"],
  ["Revenue you keep", "$465", "$400–$425"],
  ["Saving with Fichua", "$40–$65", "—"],
  ["Guest relationship", "Yours", "Platform controlled"],
  ["AI-search visibility", "Included", "Not built for you"],
];

const ComparisonSection = () => (
  <section id="comparison" className="bg-parchment px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-5xl">
      <RevealSection>
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">The margin difference</p>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-6xl">One booking pays the difference.</h2>
          <p className="mt-5 max-w-2xl font-body text-muted-foreground">At a typical 20% OTA commission, a $500 reservation costs you $100. Fichua’s 7% costs $35. Up to $65 stays with your lodge.</p><p className="mt-3 max-w-2xl border-l-2 border-gold pl-3 font-body text-sm text-foreground">Net of the subscription: ten $500 bookings a month with a $50 lowest room rate saves $650, minus a $150 subscription — <strong>$500 kept</strong>.</p>
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
    </div>
  </section>
);

export default ComparisonSection;