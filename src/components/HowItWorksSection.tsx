import RevealSection from "./RevealSection";

const steps = [
  {
    num: "01",
    title: "Tell us about your place",
    body: "A quick call or chat. We gather what we need — no forms, no jargon.",
  },
  {
    num: "02",
    title: "We build your Fichua page",
    body: "Mobile-ready and search-friendly. You review it before it goes live.",
  },
  {
    num: "03",
    title: "Take direct bookings",
    body: "Guests find you, book you, and pay you — directly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <div className="text-center mb-14">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
              How It Works
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground">
              Three steps. <em className="text-gold">You're live today.</em>
            </h2>
          </div>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <RevealSection key={step.num} delay={i * 0.1}>
              <div className="bg-parchment-dark border border-border p-8 h-full">
                <span className="font-display text-4xl font-semibold text-gold/40">{step.num}</span>
                <h3 className="font-display text-xl font-medium text-foreground mt-3 mb-3">{step.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        <RevealSection delay={0.4}>
          <div className="text-center mt-14">
            <a
              href="#contact"
              className="inline-block font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:opacity-90 transition-opacity"
            >
              Make me visible
            </a>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default HowItWorksSection;
