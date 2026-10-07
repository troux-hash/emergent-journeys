import RevealSection from "./RevealSection";
import { FlaskConical, ShieldCheck, Sprout } from "lucide-react";

const values = [
  {
    icon: FlaskConical,
    title: "Science & Transparency",
    body: "We make decisions based on evidence, not assumptions. We test our claims, measure real results for our partners, and share what we learn openly, including when something doesn't work.",
    practice:
      "Every partner can see exactly how Fichua is affecting their visibility and bookings.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Integrity",
    body: "Unlike platforms that hold back data and keep people apart, we share data openly and connect travellers directly with operators. We secure every transaction, so both sides are protected from booking to payment.",
    practice:
      "Operators own their customer relationships, and every payment on Fichua is safe for both sides.",
  },
  {
    icon: Sprout,
    title: "Growth & Fairness",
    body: "We pursue big ambitions for the businesses we serve, and we only win when they win. Our pricing stays fair, and value stays with the people who create it.",
    practice:
      "We never charge partners more than we help them earn, and our fees are always clear.",
  },
];

const ValuesSection = () => {
  return (
    <section
      id="values"
      className="bg-earth-dark text-earth-light py-16 md:py-24 px-6 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-5xl">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-6">
            Our Mission
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-earth-light mb-6">
            &ldquo;Fichua&rdquo; means to reveal
            <br />
            <em className="text-gold">or uncover in Swahili.</em>
          </h2>
          <p className="font-body text-base md:text-lg text-earth-dark-foreground/70 max-w-2xl leading-relaxed mb-4">
            Our name is our purpose: making great local businesses visible to
            the travellers looking for them.
          </p>
          <p className="font-body text-base md:text-lg text-earth-dark-foreground/70 max-w-2xl leading-relaxed">
            Fichua uses science and data to reveal great local businesses to
            the world, building trust between travellers and operators, fairly
            and transparently.
          </p>
        </RevealSection>

        <div className="mt-14 md:mt-20">
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-8">
            Core Values
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value, i) => (
              <RevealSection key={value.title} delay={i * 0.1}>
                <div className="flex h-full flex-col border border-earth-dark-foreground/15 bg-earth-dark-foreground/[0.04] p-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                    <value.icon
                      className="h-5 w-5 text-gold"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-display text-xl font-medium text-earth-light mb-3">
                    {value.title}
                  </h3>
                  <p className="font-body text-sm text-earth-dark-foreground/60 leading-relaxed mb-6">
                    {value.body}
                  </p>
                  <p className="mt-auto border-l-2 border-gold/50 pl-4 font-body text-sm text-earth-light/90 leading-relaxed">
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gold block mb-1">
                      In practice
                    </span>
                    {value.practice}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
