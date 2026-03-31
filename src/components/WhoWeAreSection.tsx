import RevealSection from "./RevealSection";
import { Shield, MapPin, GraduationCap, Briefcase } from "lucide-react";

const pillars = [
  {
    icon: GraduationCap,
    title: "Rooted at MIT — the #1 university in the world",
    description:
      "Our founder is an MIT Sloan Fellow MBA (Class of 2026), embedded in one of the most vibrant entrepreneurial ecosystems on the planet — including the Martin Trust Center for Entrepreneurship and the Kuo Center. The thinking, the network, and the rigour inform everything we build.",
  },
  {
    icon: Briefcase,
    title: "15 years supporting Africa's tourism and hospitality firms",
    description:
      "We have advised governments and directly supported over 500 tourism and hospitality businesses across Sub-Saharan Africa. That track record is not a claim — it is the foundation Fichua was built on.",
  },
  {
    icon: MapPin,
    title: "Boots on the ground",
    description:
      "We are not building for Africa from the outside. Our team is present across the continent — operators know us, trust us, and helped shape what we built.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    description:
      "Operator and traveler data is protected first — held to the highest standards of privacy and compliance. Payments follow the same rigour, with end-to-end security built in from day one.",
  },
];

const WhoWeAreSection = () => {
  return (
    <section id="who-we-are" className="py-8 md:py-12 bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
            Who We Are
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-4">
            Born from Africa's most enduring tourism networks.{" "}
            <span className="text-primary">
              Powered by the world's most innovative university.
            </span>
          </h2>
        </RevealSection>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {pillars.map((pillar, i) => (
            <RevealSection key={pillar.title} delay={i * 0.1}>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <pillar.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;
