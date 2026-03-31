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
    <section id="solution" className="bg-parchment py-8 md:py-12 px-6 md:px-12 lg:px-20">
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
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Increase your Revenues</p>
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

        {/* Social & CTA */}
        <RevealSection delay={0.15}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-5 mb-8">
              {[
                { label: "Instagram", href: "#", icon: <InstagramIcon /> },
                { label: "TikTok", href: "#", icon: <TikTokIcon /> },
                { label: "X / Twitter", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "LinkedIn", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                { label: "WeChat", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.033 13.36c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.97.983.976.976 0 0 1-.968-.983c0-.542.434-.982.969-.982z"/></svg> },
                { label: "Weibo", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.583.631.283.821.986.442 1.574zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.321.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.581-.178-.402-.641.388-1.009.428-1.878.002-2.497-.8-1.164-2.983-1.1-5.475-.031l.002-.001c0-.001-.621.269-.462-.218.303-.93.258-1.708-.214-2.158-.1.074-3.427-1.357-6.454 2.611 0 0-1.632 2.218-1.632 5.807l.077.148C4.17 17.985 7.415 20 11.236 20c5.036 0 8.382-2.912 8.382-5.229 0-1.397-1.178-2.188-2.459-2.542zM21.698 8.266c-.705-.89-1.742-1.277-2.324-1.076-.298.105-.381.396-.281.694.105.287.4.413.693.309.21-.074.576.031.842.367.255.321.327.725.22 1.003-.105.29.015.613.309.717.3.105.617-.015.72-.305.227-.627.097-1.4-.48-2.022l-.004.004-.695.309z"/></svg> },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  {item.icon}
                </a>
              ))}
            </div>
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
