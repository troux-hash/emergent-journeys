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

        {/* Brutal Truth callout */}
        <RevealSection delay={0.3}>
          <div className="bg-earth-dark text-earth-light p-8 md:p-12">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Brutal Truth</p>
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-4">
              Yokan Lodge — Senegal's most prominent independent lodge.
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {["Modern website ✓", "Professional photography ✓", "11 years operating ✓", "Zero AI discoverability ✗"].map((item) => (
                <p key={item} className="font-label text-xs tracking-wider text-earth-dark-foreground/70">{item}</p>
              ))}
            </div>
            <p className="font-display text-lg italic text-gold">
              ChatGPT recommends chain hotels instead. The lodge loses every AI-referred traveller — forever.
            </p>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default SolutionSection;
