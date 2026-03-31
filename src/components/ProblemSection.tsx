import RevealSection from "./RevealSection";

const ProblemSection = () => {
  return (
    <section id="problem" className="bg-earth-dark text-earth-light py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Problem</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight">
            Extraordinary places exist.<br />
            <em className="text-gold">They are simply unfindable.</em>
          </h2>
        </RevealSection>
      </div>
    </section>
  );
};

export default ProblemSection;
