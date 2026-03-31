import RevealSection from "./RevealSection";

const journeys = [
  {
    name: "Maya",
    desc: "36 · Brooklyn · $8,600 budget",
    type: "International Traveller",
    steps: [
      { title: "Searches AI", text: "Opens ChatGPT: 'Authentic boutique lodge, Senegal.' Gets excited — imagines warmth, local food, the beach." },
      { title: "Tries Social", text: "Finds the lodge on Instagram — 2,400 followers. No booking link. No prices. DMs unanswered. 90 minutes lost." },
      { title: "Gives Up", text: "Books a chain hotel through Booking.com. Not her first choice. Authentic option abandoned." },
    ],
  },
  {
    name: "Aminata",
    desc: "29 · Abidjan · entrepreneur",
    type: "Intra-African Traveller",
    steps: [
      { title: "Searches", text: "Friend's TikTok: a Kigali boutique lodge. 'I want that.' Opens Google. Big chain hotels only." },
      { title: "Hits a Wall", text: "No locally-run lodge appears. The infrastructure simply doesn't exist. The TikTok lodge is invisible online." },
      { title: "Abandons", text: "Books a Radisson. Cultural, not corporate — but corporate is all that's findable." },
    ],
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="bg-earth-dark text-earth-light py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Problem</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight mb-16">
            Extraordinary places exist.<br />
            <em className="text-gold">They are simply unfindable.</em>
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {journeys.map((journey, i) => (
            <RevealSection key={journey.name} delay={i * 0.15}>
              <div className="border border-gold/20 p-8 md:p-10">
                <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{journey.type}</p>
                <h3 className="font-display text-2xl md:text-3xl font-medium mb-1">{journey.name}</h3>
                <p className="font-body text-sm text-earth-dark-foreground/60 mb-8">{journey.desc}</p>
                <div className="space-y-6">
                  {journey.steps.map((step, j) => (
                    <div key={j} className="flex gap-4">
                      <span className="font-display text-2xl text-gold/40 leading-none mt-1">{j + 1}</span>
                      <div>
                        <p className="font-label text-xs tracking-[0.15em] uppercase text-gold/80 mb-1">{step.title}</p>
                        <p className="font-body text-sm text-earth-dark-foreground/70 leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>

        <RevealSection delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gold/20 pt-12">
            {[
              { value: "700M+", label: "African middle class by 2030" },
              { value: "+18%", label: "Intra-Africa travel growth" },
              { value: "82%", label: "Pre-decide via AI" },
              { value: "<5%", label: "Operators AI-discoverable" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl md:text-4xl font-semibold text-gold">{stat.value}</p>
                <p className="font-label text-[10px] tracking-[0.15em] uppercase text-earth-dark-foreground/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default ProblemSection;
