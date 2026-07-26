import RevealSection from "./RevealSection";

const problems = [
  {
    number: "01",
    title: "You're invisible on AI search",
    description: "When travellers ask ChatGPT or Google for lodges in your region, your name never comes up. The chain hotel down the road does.",
  },
  {
    number: "02",
    title: "You're losing guests on WhatsApp",
    description: "They find you on Instagram, DM you, ask about rates — then book a chain hotel because you have no way to close the sale.",
  },
  {
    number: "03",
    title: "You're paying OTAs 20% to be found",
    description: "Booking.com and Expedia take a fifth of every reservation. You're renting visibility from middlemen who own your guest relationship.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="bg-earth-dark text-earth-light py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Problem</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight mb-10">
            You're invisible.<br />
            <em className="text-gold">That's not your fault — but it is costing you.</em>
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {problems.map((item, i) => (
            <RevealSection key={item.number} delay={i * 0.1}>
              <div>
                <span className="font-display text-4xl font-semibold text-gold/30">{item.number}</span>
                <h3 className="font-display text-xl md:text-2xl font-medium text-gold mt-2 mb-3">{item.title}</h3>
                <p className="font-body text-sm text-earth-light/70 leading-relaxed">{item.description}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
