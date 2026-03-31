import RevealSection from "./RevealSection";

const SolutionSection = () => {
  return (
    <section id="solution" className="bg-parchment py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Solution</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-4">
            Visible. Bookable.<br />
            <em className="text-gold">Profitable from Day 1.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mb-16 leading-relaxed">
            Your guests discover you on TikTok. They message you on WhatsApp. But they book somewhere else — because there's nothing in between. Fichua is that bridge.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              label: "Where they find you",
              title: "TikTok · Instagram · AI Search",
              text: "Your guests are already looking. They just can't find you where it matters.",
            },
            {
              label: "Where they talk to you",
              title: "WhatsApp · DMs · Email",
              text: "Conversations happen — but conversations don't convert without infrastructure.",
            },
            {
              label: "Where they should book you",
              title: "Direct. Not through an OTA.",
              text: "Fichua turns interest into revenue — on your terms, not Booking.com's.",
            },
          ].map((card, i) => (
            <RevealSection key={card.title} delay={i * 0.12}>
              <div className="p-8 md:p-10 bg-parchment-dark border border-border h-full">
                <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{card.label}</p>
                <h3 className="font-display text-xl md:text-2xl font-medium text-foreground mb-4">{card.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.text}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* What to expect */}
        <RevealSection delay={0.3}>
          <div className="bg-earth-dark text-earth-light p-8 md:p-12">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">What You Should Expect</p>
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-6">
              How Fichua impacts your business.
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "More direct bookings", text: "Guests find and book you without a middleman taking 20%." },
                { title: "AI visibility from Day 1", text: "ChatGPT, Perplexity, and Google surface your lodge — not the chain hotel down the road." },
                { title: "You own your guest", text: "Every booking, every conversation, every relationship stays yours." },
              ].map((item) => (
                <div key={item.title}>
                  <h4 className="font-display text-xl font-medium text-gold mb-2">{item.title}</h4>
                  <p className="font-body text-sm text-earth-dark-foreground/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default SolutionSection;
