import RevealSection from "./RevealSection";
import { FlaskConical, ShieldCheck, Sprout } from "lucide-react";

const values = [
  { icon: FlaskConical, title: "Science & Transparency", practice: "Every partner can see exactly how Fichua is affecting their visibility and bookings." },
  { icon: ShieldCheck, title: "Trust & Integrity", practice: "Operators own their customer relationships, and every payment on Fichua is safe for both sides." },
  { icon: Sprout, title: "Growth & Fairness", practice: "We never charge partners more than we help them earn, and our fees are always clear." },
];

const ValuesSection = () => (
  <section id="values" className="bg-earth-dark px-6 py-16 text-earth-light md:px-12 md:py-20 lg:px-20">
    <div className="mx-auto max-w-5xl">
      <RevealSection>
        <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">Our mission</p>
        <h2 className="mb-4 font-display text-3xl leading-tight md:text-5xl">&ldquo;Fichua&rdquo; means to reveal or uncover in Swahili.</h2>
        <p className="max-w-2xl font-body text-lg leading-relaxed text-earth-light">We use science and data to reveal great local businesses to the world, building trust between travellers and operators, fairly and transparently.</p>
      </RevealSection>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {values.map(({ icon: Icon, title, practice }) => (
          <div key={title} className="border border-earth-dark-foreground/20 p-6"><Icon className="h-5 w-5 text-gold" /><h3 className="mt-3 font-display text-2xl">{title}</h3><p className="mt-2 font-body text-base text-earth-light">{practice}</p></div>
        ))}
      </div>
    </div>
  </section>
);

export default ValuesSection;
