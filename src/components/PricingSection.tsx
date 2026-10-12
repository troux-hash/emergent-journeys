import RevealSection from "./RevealSection";
import SavingsCalculator from "./SavingsCalculator";
import ContactButtons from "./ContactButtons";

const PricingSection = () => (
  <section id="pricing" className="bg-parchment px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-5xl">
      <RevealSection>
        <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">Honest pricing</p>
        <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">$99 a month + 7% on the bookings we bring.</h2>
        <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
          No setup fee, no contract, no exclusivity. Your subscription is covered once the commission you save beats $99 — about 1–2 bookings at $1,000, or 6–9 bookings at $150.
        </p>
      </RevealSection>
      <RevealSection delay={0.08}>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="border-2 border-gold bg-parchment-dark p-6"><p className="font-display text-5xl text-foreground">10</p><p className="mt-2 font-display text-2xl text-foreground">free bookings first</p><p className="mt-2 font-body text-base text-muted-foreground">You pay nothing — no subscription, no commission — until Fichua has delivered ten bookings.</p></div>
          <div className="border border-border bg-parchment-dark p-6"><p className="font-display text-5xl text-foreground">3</p><p className="mt-2 font-display text-2xl text-foreground">month trial option</p><p className="mt-2 font-body text-base text-muted-foreground">Prefer to test on time rather than bookings? Ask us about a 3-month trial when we talk.</p></div>
        </div>
      </RevealSection>
      <RevealSection delay={0.12}><div className="mt-6"><SavingsCalculator /></div></RevealSection>
      <RevealSection delay={0.16}><div className="mt-10 flex justify-center"><ContactButtons dark={false} /></div></RevealSection>
    </div>
  </section>
);

export default PricingSection;
