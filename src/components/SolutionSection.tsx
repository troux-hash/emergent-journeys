import RevealSection from "./RevealSection";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.2 8.2 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z"/></svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
);

const BookingIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2.273 0v24h5.62v-8.727h3.437c4.59 0 7.398-2.624 7.398-6.819 0-4.11-2.722-6.727-7.142-6.727H2.273v-1.727zm5.62 4.91h2.584c1.924 0 3.012.9 3.012 2.545 0 1.67-1.088 2.582-3.012 2.582H7.893V4.91zM20.727 24h-5.62v-1.727h5.62V24z"/></svg>
);

const SolutionSection = () => {
  return (
    <section id="solution" className="bg-parchment py-12 md:py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        {/* Fichua vs the status quo */}
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
            Fichua vs. The Status Quo
          </p>
          <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight text-foreground mb-4">
            Most operators go undiscovered — and even when found,<br />
            <em className="text-gold">they fail to convert to bookings and revenue.</em>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed">
            They find you on TikTok. They DM you on Instagram. They chat on WhatsApp. Then they book a chain hotel on Booking.com — because you have no way to close.
          </p>
        </RevealSection>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Without Fichua */}
          <RevealSection>
            <div className="p-8 md:p-10 bg-parchment-dark border border-border h-full text-left">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">Without Fichua</p>
              <div className="space-y-5">
                {[
                  { channel: "TikTok / Instagram", result: "They see you — then forget you.", icon: <><TikTokIcon /><InstagramIcon /></> },
                  { channel: "WhatsApp", result: "They message you — then ghost.", icon: <WhatsAppIcon /> },
                  { channel: "Booking.com", result: "They book someone else — and you pay 20% anyway.", icon: <BookingIcon /> },
                ].map((item) => (
                  <div key={item.channel} className="flex items-start gap-3">
                    <span className="text-destructive font-display text-lg leading-none mt-0.5">✗</span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">{item.icon}</span>
                        <p className="font-label text-xs tracking-wider uppercase text-foreground">{item.channel}</p>
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{item.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* With Fichua */}
          <RevealSection delay={0.12}>
            <div className="p-8 md:p-10 bg-earth-dark text-earth-light border border-gold/20 h-full text-left">
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
                      <p className="font-body text-sm text-earth-light/70">{item.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>

        {/* Day 1 Impact */}
        <RevealSection delay={0.1}>
          <div className="bg-earth-dark text-earth-light p-8 md:p-12 mb-12">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Day 1 Impact</p>
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-8">
              Value you can measure <em className="text-gold">immediately.</em>
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-left">
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
                  <p className="font-body text-sm text-earth-light/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Single Get in Touch CTA */}
        <RevealSection delay={0.15}>
          <div className="text-center">
            <a
              href="mailto:teddy225@mit.edu"
              className="inline-block font-label text-sm tracking-[0.2em] uppercase bg-primary text-primary-foreground px-10 py-4 hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </a>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default SolutionSection;
