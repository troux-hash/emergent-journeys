import RevealSection from "./RevealSection";
import { Users, Zap, HeartHandshake, TrendingUp } from "lucide-react";

const differentiators = [
  {
    icon: Users,
    title: "Direct to customer",
    body: "Your customers interact directly with you. No middlemen, no lost messages.",
  },
  {
    icon: Zap,
    title: "Faster response time",
    body: "Answer once, book faster. We help you respond before guests look elsewhere.",
  },
  {
    icon: HeartHandshake,
    title: "A partner by your side",
    body: "Not another AI app. A real team helping you get found and stay booked.",
  },
  {
    icon: TrendingUp,
    title: "Analytics that grow revenue",
    body: "We help you increase occupancy and optimize pricing. No upfront investment — pay later as revenue rises.",
  },
];

const WhatMakesUsDifferentSection = () => {
  return (
    <section id="why-us" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
            What Makes Us Different
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-6">
            A partner by your side.<br />
            <em className="text-gold">Not another app to manage.</em>
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-2 gap-6 text-left mt-14">
          {differentiators.map((item, i) => (
            <RevealSection key={item.title} delay={i * 0.1}>
              <div className="bg-parchment-dark border border-border p-8 h-full">
                <div className="w-12 h-12 rounded-full bg-background/60 border border-border flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground mb-3">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatMakesUsDifferentSection;
