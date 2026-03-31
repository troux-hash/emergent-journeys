import RevealSection from "./RevealSection";

const steps = [
  { num: "01", title: "Build", desc: "Schema.org AI profile — live in 48 hours" },
  { num: "02", title: "Discover", desc: "ChatGPT, Perplexity, Google surface the lodge" },
  { num: "03", title: "Book", desc: "Direct booking engine — 8% Fichua fee, operator owns guest" },
  { num: "04", title: "Own", desc: "Intelligence: who found them, why, what converts" },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="bg-parchment py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Solution</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-4">
            A machine-readable identity<br />
            <em className="text-gold">for every African lodge.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mb-16">
            Findable by AI. Bookable direct. Intelligence for the operator. Not another OTA — the operating system independent African operators have never had.
          </p>
        </RevealSection>

        {/* 4-step flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {steps.map((step, i) => (
            <RevealSection key={step.num} delay={i * 0.1}>
              <div className="text-center p-6 bg-parchment-dark border border-border relative">
                <p className="font-display text-4xl font-bold text-gold/20 mb-4">{step.num}</p>
                <h3 className="font-display text-xl font-medium text-foreground mb-2">{step.title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <span className="hidden md:block absolute top-1/2 -right-3 text-gold/30 font-display text-2xl">→</span>
                )}
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Brutal Truth callout */}
        <RevealSection delay={0.3}>
          <div className="bg-earth-dark text-earth-light p-8 md:p-12">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Brutal Truth</p>
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-4">
              Yokan Lodge — Senegal's most prominent independent lodge.
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {["Modern website ✓", "Professional photography ✓", "11 years operating ✓", "Zero AI discoverability ✗"].map((item) => (
                <p key={item} className="font-label text-xs tracking-wider text-earth-dark-foreground/70">{item}</p>
              ))}
            </div>
            <p className="font-body text-sm text-earth-dark-foreground/60 leading-relaxed mb-4">
              No Schema.org. No JSON-LD. No structured data. ChatGPT cannot see it — at all.
            </p>
            <p className="font-display text-lg italic text-gold">
              The consequence: ChatGPT recommends chain hotels instead. The lodge loses every AI-referred traveller — forever.
            </p>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default SolutionSection;
