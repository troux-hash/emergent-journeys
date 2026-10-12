import RevealSection from "./RevealSection";
import OperatorLeadForm from "./OperatorLeadForm";
import ContactButtons from "./ContactButtons";

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
                Let's talk <em className="text-gold">about your place.</em>
              </h2>
              <p className="font-body text-sm md:text-base text-earth-light leading-relaxed mb-4">
                Tell us the basics. We’ll reach out on WhatsApp within 24 hours.
              </p>
              <p className="font-body text-sm text-earth-light leading-relaxed">
                No contracts. No upfront fees. No obligation.
              </p>
              <div className="mt-6"><ContactButtons /></div>
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
