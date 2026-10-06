import RevealSection from "./RevealSection";
import OperatorLeadForm from "./OperatorLeadForm";

const OperatorSignupSection = () => {
  return (
    <section id="contact" className="bg-earth-dark text-earth-light py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left: Copy */}
          <RevealSection>
            <div>
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
                Make me visible
              </p>
              <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight text-earth-light mb-6">
                Ready? <em className="text-gold">Tell us about your place.</em>
              </h2>
              <p className="font-body text-sm md:text-base text-earth-dark-foreground/70 leading-relaxed mb-4">
                Just the basics — we'll reach out on WhatsApp within 24 hours to set up your Fichua page.
              </p>
              <p className="font-body text-sm text-earth-dark-foreground/60 leading-relaxed">
                No contracts. No upfront fees. No obligation.
              </p>
            </div>
          </RevealSection>

          {/* Right: Form */}
          <RevealSection delay={0.1}>
            <div className="border border-earth-dark-foreground/10 bg-earth-dark-foreground/5 p-8 md:p-10"><OperatorLeadForm /></div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
};

export default OperatorSignupSection;
