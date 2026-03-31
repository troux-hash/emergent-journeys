import RevealSection from "./RevealSection";

const FooterCTA = () => {
  return (
    <section id="contact" className="bg-earth-dark text-earth-light py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-3xl mx-auto text-center">
        <RevealSection>
          <p className="font-display text-2xl md:text-4xl italic text-gold/80 mb-8 leading-relaxed">
            "What is hidden is not absent —<br />
            it is simply not yet revealed."
          </p>
          <p className="font-body text-sm text-earth-dark-foreground/50 mb-12">
            From Swahili · Bantu root: ficha (to hide) → fichua (to reveal)
          </p>
          <a
            href="mailto:teddy225@mit.edu"
            className="inline-block font-label text-sm tracking-[0.2em] uppercase bg-gold text-earth-dark px-10 py-4 hover:opacity-90 transition-opacity mb-6"
          >
            Get in Touch
          </a>
        </RevealSection>
      </div>
    </section>
  );
};

export default FooterCTA;
