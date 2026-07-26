import RevealSection from "./RevealSection";
import { ShieldCheck, Lock, Star } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Every listing verified",
    body: "Identity, property location, WhatsApp reachability, and payout details are all confirmed before anything goes live — not a self-reported checkbox.",
  },
  {
    icon: Lock,
    title: "Payments protected",
    body: "Fichua holds your payment through a licensed processor and only releases it to the operator per a clear policy — never blind, never upfront to a stranger.",
  },
  {
    icon: Star,
    title: "Reviews you can trust",
    body: "Verified Stay reviews are tied to a real, paid booking. They can't be bought, faked, or imported — that's what makes them worth reading.",
  },
];

const TrustSection = () => {
  return (
    <section id="trust" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
              Built On Trust
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight text-foreground mb-4">
              Trust isn't a badge. It's how we're built.
            </h2>
            <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
              We're onboarding our first verified operators now, starting with a pilot in Rwanda. Here's what
              protects you from day one.
            </p>
          </div>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <RevealSection key={p.title} delay={0.08 + i * 0.06}>
              <div className="bg-parchment-dark border border-border p-6 md:p-8 h-full">
                <p.icon className="w-6 h-6 text-gold mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-medium text-foreground mb-2">{p.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
