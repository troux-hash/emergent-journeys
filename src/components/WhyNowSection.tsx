import RevealSection from "./RevealSection";

const forces = [
  { num: "01", title: "AI Replaced Google" },
  { num: "02", title: "Africa's Cultural Moment Is Now" },
  { num: "03", title: "Travellers Prioritise Authentic, Locally-Owned Experiences" },
];

const WhyNowSection = () => {
  return (
    <section id="why-now" className="bg-parchment py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Why Now</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-16">
            Three forces.<br />
            <em className="text-gold">All peaked in 2025–26.</em>
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-8">
          {forces.map((force, i) => (
            <RevealSection key={force.num} delay={i * 0.12}>
              <div className="relative p-8 md:p-10 bg-parchment-dark border border-border">
                <span className="font-display text-[6rem] font-bold text-foreground/[0.04] absolute top-2 right-4 leading-none select-none">
                  {force.num}
                </span>
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-3">{force.num}</p>
                <h3 className="font-display text-xl md:text-2xl font-medium text-foreground">{force.title}</h3>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNowSection;
