import RevealSection from "./RevealSection";

const metrics = [
  { value: "50+", label: "Operators Onboarded" },
  { value: "1,200+", label: "Bookings Completed" },
  { value: "$320K+", label: "Revenue Distributed to Operators" },
];

const testimonials = [
  {
    quote: "Fichua changed everything for us. We went from invisible to fully booked in three months.",
    name: "Grace M.",
    role: "Owner, Kenya",
  },
  {
    quote: "For the first time, international guests find us directly — no middleman, no commission drain.",
    name: "Jean-Pierre K.",
    role: "Boutique Hotel, Rwanda",
  },
  {
    quote: "The onboarding was effortless. My Fichua Buddy made sure I was never lost.",
    name: "Amara D.",
    role: "Independent Operator, Tanzania",
  },
];

const partnerLogos = [
  "Safari Connect",
  "AfriStay",
  "Kilimanjaro Tours",
  "Ubuntu Travel",
  "Savanna Hotels",
  "Baobab Ventures",
];

const TrustSection = () => {
  return (
    <section id="trust" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
              They Trust Us
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight text-foreground">
              Trusted across the continent.
            </h2>
          </div>
        </RevealSection>

        {/* Metrics */}
        <RevealSection delay={0.05}>
          <div className="grid grid-cols-3 gap-6 md:gap-12 mb-16">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <p className="font-display text-3xl md:text-5xl font-semibold text-gold">
                  {m.value}
                </p>
                <p className="font-label text-[10px] md:text-xs tracking-[0.15em] uppercase text-muted-foreground mt-2">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Partner logos */}
        <RevealSection delay={0.1}>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mb-16">
            {partnerLogos.map((name) => (
              <div
                key={name}
                className="h-16 md:h-20 bg-parchment-dark border border-border flex items-center justify-center"
              >
                <span className="font-label text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <RevealSection key={t.name} delay={0.12 + i * 0.06}>
              <div className="bg-parchment-dark border border-border p-6 md:p-8">
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-display text-sm font-medium text-foreground">
                    {t.name}
                  </p>
                  <p className="font-label text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60 mt-1">
                    {t.role}
                  </p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
