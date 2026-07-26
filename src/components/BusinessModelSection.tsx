import RevealSection from "./RevealSection";

const BusinessModelSection = () => {
  return (
    <section id="model" className="bg-parchment-dark py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Business Model</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-4">
            More money.<br />
            <em className="text-gold">For the operator.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-md mb-16">
            Fichua costs less per month than one night's booking — and keeps $360 more on every $3,000 booking.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-2 gap-8">
          {/* SaaS card */}
          <RevealSection>
            <div className="border border-border bg-parchment p-8 md:p-10 h-full">
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-6">01 — SaaS Subscription</p>
              <p className="font-display text-5xl md:text-6xl font-semibold text-foreground mb-2">$150</p>
              <p className="font-label text-xs tracking-[0.15em] uppercase text-muted-foreground mb-8">/ month</p>
              <p className="font-body text-sm text-muted-foreground mb-6">Less than one night's booking. Pays for itself on Day 1.</p>
              <ul className="space-y-3 font-body text-sm text-muted-foreground">
                {["Schema.org AI profile — live in 48h", "Direct booking engine", "WhatsApp CRM integration", "Guest intelligence dashboard"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </RevealSection>

          {/* Commission card */}
          <RevealSection delay={0.15}>
            <div className="border border-border bg-parchment p-8 md:p-10 h-full">
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-6">02 — Marketplace Commission</p>
              <div className="flex items-end gap-4 mb-8">
                <div>
                  <p className="font-display text-5xl md:text-6xl font-semibold text-foreground">8%</p>
                  <p className="font-label text-xs tracking-[0.15em] uppercase text-muted-foreground">Fichua</p>
                </div>
                <p className="font-display text-2xl text-muted-foreground/40 mb-2">vs</p>
                <div>
                  <p className="font-display text-5xl md:text-6xl font-semibold text-muted-foreground/40">20%</p>
                  <p className="font-label text-xs tracking-[0.15em] uppercase text-muted-foreground/40">OTA</p>
                </div>
              </div>

              {/* Visual bar comparison */}
              <div className="space-y-4">
                <div>
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">On a $3,000 booking — OTA takes</p>
                  <div className="h-8 bg-muted-foreground/20 flex">
                    <div className="h-full bg-muted-foreground/40 flex items-center justify-center" style={{ width: "20%" }}>
                      <span className="font-label text-[10px] text-parchment">$600</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Fichua takes</p>
                  <div className="h-8 bg-gold/10 flex">
                    <div className="h-full bg-gold flex items-center justify-center" style={{ width: "8%" }}>
                    </div>
                    <div className="flex items-center ml-3">
                      <span className="font-label text-[10px] text-foreground">$240 — <strong>$360 stays with the operator</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
};

export default BusinessModelSection;
