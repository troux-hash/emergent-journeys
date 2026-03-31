import RevealSection from "./RevealSection";

const SolutionSection = () => {
  return (
    <section id="solution" className="bg-parchment py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Fichua vs the status quo */}
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
            Fichua vs. The Status Quo
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-4">
            You already have the guests.<br />
            <em className="text-gold">You just keep losing them.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mb-16 leading-relaxed">
            They find you on TikTok. They DM you on Instagram. They chat on WhatsApp. Then they book a chain hotel on Booking.com — because you have no way to close.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {/* Without Fichua */}
          <RevealSection>
            <div className="p-8 md:p-10 bg-parchment-dark border border-border h-full">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Without Fichua</p>
              <div className="space-y-5">
                {[
                  { channel: "TikTok / Instagram", result: "They see you — then forget you." },
                  { channel: "WhatsApp", result: "They message you — then ghost." },
                  { channel: "Booking.com", result: "They book someone else — and you pay 20% anyway." },
                ].map((item) => (
                  <div key={item.channel} className="flex items-start gap-3">
                    <span className="text-destructive font-display text-lg leading-none mt-0.5">✗</span>
                    <div>
                      <p className="font-label text-xs tracking-wider uppercase text-foreground">{item.channel}</p>
                      <p className="font-body text-sm text-muted-foreground">{item.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* With Fichua */}
          <RevealSection delay={0.12}>
            <div className="p-8 md:p-10 bg-earth-dark text-earth-light border border-gold/20 h-full">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-4">With Fichua</p>
              <div className="space-y-5">
                {[
                  { channel: "AI Search", result: "ChatGPT and Google recommend you — by name." },
                  { channel: "Direct Booking", result: "Guests book you instantly. No middleman. No 20% cut." },
                  { channel: "Your Guest, Your Data", result: "Every conversation, every booking, every relationship — yours." },
                ].map((item) => (
                  <div key={item.channel} className="flex items-start gap-3">
                    <span className="text-gold font-display text-lg leading-none mt-0.5">✓</span>
                    <div>
                      <p className="font-label text-xs tracking-wider uppercase text-gold/80">{item.channel}</p>
                      <p className="font-body text-sm text-earth-dark-foreground/70">{item.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>

        {/* CTA */}
        <RevealSection delay={0.15}>
          <div className="text-center mb-20">
            <a
              href="mailto:teddy225@mit.edu"
              className="inline-block font-label text-sm tracking-[0.2em] uppercase bg-primary text-primary-foreground px-10 py-4 hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </a>
          </div>
        </RevealSection>

        {/* Value from Day 1 */}
        <RevealSection delay={0.2}>
          <div className="bg-earth-dark text-earth-light p-8 md:p-12">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Day 1 Impact</p>
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-8">
              Value you can measure <em className="text-gold">immediately.</em>
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI finds you",
                  text: "Your lodge appears in ChatGPT, Perplexity, and Google — not the chain hotel down the road.",
                },
                {
                  title: "Guests book direct",
                  text: "No OTA commission. No middleman. You keep 92% of every booking.",
                },
                {
                  title: "You own the relationship",
                  text: "Guest data, repeat visits, referrals — all yours. Build a business, not a listing.",
                },
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
