import RevealSection from "./RevealSection";
import { Search, CreditCard, Users } from "lucide-react";

const outcomes = [
  {
    icon: Search,
    title: "Get found on ChatGPT & Google",
    body: "We structure your lodge the way AI search engines read the web. When travellers ask, your name comes up — by name.",
  },
  {
    icon: CreditCard,
    title: "Take bookings directly",
    body: "Guests book you through your own Fichua page. Secure payments via Visa. No OTA middleman standing between you and your guest.",
  },
  {
    icon: Users,
    title: "Keep 100% of your revenue",
    body: "No 20% commission. No hidden fees. The relationship with your guest — and every shilling they pay — stays with you.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
            The Solution
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-6">
            One page. One link.<br />
            <em className="text-gold">Every booking direct.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed">
            Fichua gives your lodge a home on the internet that AI can find, travellers trust, and you fully own.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {outcomes.map((item, i) => (
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

export default SolutionSection;
