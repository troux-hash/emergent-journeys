import RevealSection from "./RevealSection";
import { Eye, TrendingUp, Eye as EyeIcon, ShieldCheck, HandCoins } from "lucide-react";

// Pricing + value section. The pricing model is deliberately stated in the
// operator's own terms -- three nights at their own rate -- rather than a
// flat dollar figure, because a number that's trivial for a lodge in one
// market can be a month's margin in another. The "nothing until ten
// bookings" term is the actual proof point behind every other claim on
// this page, so it's given the most visual weight.

const PROMISES = [
  {
    icon: Eye,
    title: "We make you visible",
    body: "A verified page built to be found — by travellers, by Google, and by the AI assistants people now plan trips with.",
  },
  {
    icon: TrendingUp,
    title: "We grow your revenue",
    body: "Direct bookings at your own rates, on 7% commission instead of the 15–20% large platforms charge. No auction to win, no bidding for your own guests.",
  },
  {
    icon: EyeIcon,
    title: "We're transparent with everyone",
    body: "The traveller sees your real price. You see exactly what you pay us. No markup hidden in the middle.",
  },
  {
    icon: ShieldCheck,
    title: "We secure the payment",
    body: "Money is held safely and released properly — so the guest books with confidence and you're never chasing a payment.",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <div className="text-center mb-14">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Pricing</p>
            <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-5">
              Three nights a month, plus 7%.<br />
              <em className="text-gold">And nothing until we've earned it.</em>
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Two parts, both stated plainly: a monthly subscription to be visible — three nights in your
              cheapest room — and 7% on the bookings we bring you, against the 15–20% the large platforms
              take. You pay neither until Fichua has delivered you ten bookings.
            </p>
          </div>
        </RevealSection>

        {/* The offer */}
        <RevealSection delay={0.08}>
          <div className="border border-border bg-parchment-dark p-8 md:p-12 mb-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
                  What it costs
                </p>
                <p className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-3">
                  3 nights in your<br />cheapest room
                </p>
                <p className="font-label text-xs tracking-[0.15em] uppercase text-muted-foreground mb-5">
                  per month, to be found and stay visible
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  Take your least expensive room, multiply its nightly rate by three — that's your month. A small
                  guesthouse pays less than a safari lodge, because a flat fee that's fair to one is unfair to the
                  other.
                </p>
                <p className="font-body text-sm text-foreground border-l-2 border-gold pl-3">
                  <strong>You can work it out in your head</strong>, and it's the same number whether you take
                  twelve bookings that month or eighty.
                </p>
              </div>

              <div className="border-l-0 md:border-l border-border md:pl-10">
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
                  When you start paying
                </p>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-display text-4xl md:text-5xl font-semibold text-foreground">10</span>
                  <span className="font-body text-sm text-muted-foreground">bookings first</span>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  Nothing to pay until Fichua has delivered ten real bookings to your property. No setup fee, no
                  card on file, no trial that quietly starts charging. If we never bring you those ten bookings,
                  you never pay us anything.
                </p>
                <div className="flex items-start gap-2 border-t border-border pt-5">
                  <HandCoins className="w-4 h-4 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                  <p className="font-body text-sm text-foreground">
                    <strong>You pay only when we deliver.</strong> That's the whole model — the risk sits with us,
                    not with you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection delay={0.12}>
          <div className="border border-border bg-parchment-dark p-8 md:p-10 mb-6">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
              And on each booking
            </p>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-end gap-4 mb-3">
                  <div>
                    <p className="font-display text-4xl md:text-5xl font-semibold text-foreground">7%</p>
                    <p className="font-label text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Fichua</p>
                  </div>
                  <p className="font-display text-xl text-muted-foreground/40 mb-2">vs</p>
                  <div>
                    <p className="font-display text-4xl md:text-5xl font-semibold text-muted-foreground/40">15–20%</p>
                    <p className="font-label text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40">Large platforms</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  On a $3,000 booking, a 20% platform takes $600. Fichua takes $210 — leaving{" "}
                  <strong className="text-foreground">$390 more with you</strong>, on that booking alone.
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection delay={0.14}>
          <p className="text-center font-body text-xs text-muted-foreground mb-14">
            No lock-in and no exclusivity. Leave whenever you like — your guests were always yours.
          </p>
        </RevealSection>

        {/* What you get for it */}
        <div className="grid md:grid-cols-2 gap-6">
          {PROMISES.map((p, i) => (
            <RevealSection key={p.title} delay={0.18 + i * 0.06}>
              <div className="flex gap-4 bg-parchment-dark border border-border p-6 h-full">
                <p.icon className="w-5 h-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-base font-medium text-foreground mb-1.5">{p.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>

        <RevealSection delay={0.45}>
          <div className="text-center mt-14">
            <a
              href="#contact"
              className="inline-block font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:opacity-90 transition-opacity"
            >
              Start free — get listed
            </a>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default PricingSection;
