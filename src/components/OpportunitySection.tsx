import RevealSection from "./RevealSection";

const trends = [
  {
    title: "AI is replacing search",
    stat: "82%",
    caption: "of travellers will use AI to plan trips by 2026",
  },
  {
    title: "Africa's cultural moment",
    stat: "$170B",
    caption: "continent-wide tourism market, growing 12% YoY",
  },
  {
    title: "Guests demand authenticity",
    stat: "73%",
    caption: "prefer unique stays over chain hotels",
  },
  {
    title: "Direct booking is winning",
    stat: "20%",
    caption: "of revenue lost to OTA commissions — operators want out",
  },
];

const OpportunitySection = () => {
  return (
    <section id="opportunity" className="bg-parchment py-8 md:py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-12">
            This is <em className="text-gold">Africa Time.</em>
          </h2>
        </RevealSection>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {trends.map((item, i) => (
            <RevealSection key={item.title} delay={i * 0.08}>
              <div>
                <p className="font-display text-4xl md:text-5xl font-semibold text-gold">{item.stat}</p>
                <h3 className="font-display text-lg font-medium text-foreground mt-3 mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.caption}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpportunitySection;
