import RevealSection from "./RevealSection";

const tractionItems = [
  { value: "350+", label: "Operators Surveyed", desc: "Rwanda · Senegal · Kenya · Benin · CIV" },
  { value: "✓", label: "Technical Hypothesis Confirmed", desc: "Schema.org JSON-LD surfaces in AI queries" },
  { value: "Jun 2026", label: "Pilot Launches", desc: "50 operators · CEO-led · 3 months free" },
  { value: "MIT", label: "Institutional Backing", desc: "Sloan Fellows · Martin Trust · Sandbox · E14 · CSAIL" },
];

const compRows = [
  { need: "AI Profile (Schema.org)", booking: "Partial", channel: "—", little: "—", fichua: "✓" },
  { need: "LLM Discoverability", booking: "Partial", channel: "—", little: "—", fichua: "✓" },
  { need: "Direct Booking Engine", booking: "—", channel: "Partial", little: "—", fichua: "✓" },
  { need: "Commission Rate", booking: "18%", channel: "Varies", little: "Low", fichua: "8%" },
  { need: "Guest Data Ownership", booking: "—", channel: "Partial", little: "—", fichua: "✓" },
  { need: "Africa-Native Rails", booking: "—", channel: "—", little: "—", fichua: "✓" },
];

const TractionSection = () => {
  return (
    <section id="traction" className="bg-earth-dark text-earth-light py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Traction */}
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Traction</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight mb-4">
            Pre-revenue.<br />
            <em className="text-gold">Proof of everything that matters.</em>
          </h2>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 mt-12">
          {tractionItems.map((item, i) => (
            <RevealSection key={item.label} delay={i * 0.1}>
              <div className="border border-gold/20 p-6 md:p-8">
                <p className="font-display text-2xl md:text-3xl font-semibold text-gold mb-2">{item.value}</p>
                <p className="font-label text-xs tracking-[0.15em] uppercase text-earth-dark-foreground/80 mb-2">{item.label}</p>
                <p className="font-body text-xs text-earth-dark-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Competition */}
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Competition</p>
          <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight mb-12">
            No existing platform<br />
            <em className="text-gold">was built for Africa.</em>
          </h2>
        </RevealSection>

        <RevealSection delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="font-label text-[10px] tracking-[0.2em] uppercase text-gold/60 pb-4 pr-6">Operator Need</th>
                  <th className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/40 pb-4 pr-6">Booking.com</th>
                  <th className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/40 pb-4 pr-6">Channel Mgr</th>
                  <th className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/40 pb-4 pr-6">Little Hotelier</th>
                  <th className="font-label text-[10px] tracking-[0.2em] uppercase text-gold pb-4">Fichua</th>
                </tr>
              </thead>
              <tbody>
                {compRows.map((row) => (
                  <tr key={row.need} className="border-b border-gold/10">
                    <td className="font-body text-sm text-earth-dark-foreground/80 py-4 pr-6">{row.need}</td>
                    <td className="font-body text-sm text-earth-dark-foreground/40 py-4 pr-6">{row.booking}</td>
                    <td className="font-body text-sm text-earth-dark-foreground/40 py-4 pr-6">{row.channel}</td>
                    <td className="font-body text-sm text-earth-dark-foreground/40 py-4 pr-6">{row.little}</td>
                    <td className="font-body text-sm text-gold font-medium py-4">{row.fichua}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default TractionSection;
