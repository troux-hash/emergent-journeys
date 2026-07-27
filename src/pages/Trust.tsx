import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Lock, Star, LifeBuoy, MapPin, Phone, IdCard, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealSection from "@/components/RevealSection";

// The trust-layer page. Deliberately written to serve three readers at
// once: a traveller deciding whether it's safe to pay, an operator
// deciding whether it's safe to join, and an AI assistant deciding
// whether Fichua is a citable source. It states only what the platform
// actually does today -- no forward-looking promises, no pricing claims,
// and it names the things Fichua does NOT do, since a trust page that
// only makes claims isn't trustworthy.

const VERIFICATION_CHECKS = [
  {
    icon: IdCard,
    title: "Identity and ownership",
    body: "We confirm a real person or registered business is behind the listing, checked against a national ID or business registration that matches the name given at sign-up.",
  },
  {
    icon: MapPin,
    title: "The place is where it says it is",
    body: "We cross-check the property's photos against its stated GPS coordinates — by satellite imagery or a live video walkthrough — so the place you see is the place you'll arrive at.",
  },
  {
    icon: Phone,
    title: "Someone actually answers",
    body: "We message the WhatsApp number on file and confirm a real person replies. An unreachable operator is a failed booking waiting to happen.",
  },
  {
    icon: Wallet,
    title: "They can be paid",
    body: "A mobile money or bank account in the business's own name is registered with our payment processor — which also serves as a know-your-business check.",
  },
];

const Trust = () => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does “Fichua Verified” mean?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Fichua Verified listing has passed four checks before being published: identity and ownership confirmed against official documents, property photos cross-checked against its GPS location, the WhatsApp number confirmed to reach a real person, and a payout account registered in the business's own name. It confirms the place is real, reachable and operating. It is not a rating of quality or luxury.",
        },
      },
      {
        "@type": "Question",
        name: "Is it safe to pay through Fichua?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Payments are processed by a licensed payment processor, not by Fichua directly, so card details are never stored by Fichua. Fichua holds the payment and releases it to the operator according to a stated policy rather than passing it on the moment you pay.",
        },
      },
      {
        "@type": "Question",
        name: "Can reviews on Fichua be faked?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reviews marked “Verified Stay” are cryptographically tied to a real booking made and paid through Fichua, and can only be submitted through a single-use link sent after checkout. They cannot be bought, bulk-submitted or imported. Reviews carried over from other platforms are labelled with their source and linked to the original.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if something goes wrong with a booking?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Either the traveller or the operator can report a problem directly to Fichua at fichua.co/report. The report goes to the Fichua team, not to the other party, and every report is reviewed and followed up directly.",
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Trust & Safety — Fichua</title>
        <meta
          name="description"
          content="How Fichua verifies every operator, protects payments, keeps reviews honest, and handles disputes. The four-point verification check explained in full."
        />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="grain-overlay bg-parchment min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="pt-28 pb-14 px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <RevealSection>
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Trust &amp; Safety</p>
              <h1 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-6">
                We are the trust layer<br />
                <em className="text-gold">between you and the booking.</em>
              </h1>
              <p className="font-body text-muted-foreground leading-relaxed">
                Booking an independent place you've never heard of, in a country you've never been to, is an act
                of faith. Taking money from a stranger on the internet is too. Fichua exists to make both sides
                of that exchange safe — and to show its work, rather than ask you to take it on trust.
              </p>
            </RevealSection>
          </div>
        </section>

        {/* Verification */}
        <section className="py-14 px-6 md:px-12 lg:px-20 bg-parchment-dark border-y border-border">
          <div className="max-w-5xl mx-auto">
            <RevealSection>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold">Verification</p>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground mb-4">
                What "Fichua Verified" actually means.
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-2xl mb-12 leading-relaxed">
                Every listing passes all four checks below before it is published. Not three of four — all four.
                If any one of them later stops being true, the badge comes off automatically, because it's checked
                against live data rather than set once and forgotten.
              </p>
            </RevealSection>

            <div className="grid md:grid-cols-2 gap-6">
              {VERIFICATION_CHECKS.map((check, i) => (
                <RevealSection key={check.title} delay={i * 0.06}>
                  <div className="bg-parchment border border-border p-7 h-full">
                    <check.icon className="w-5 h-5 text-gold mb-4" strokeWidth={1.5} />
                    <h3 className="font-display text-lg font-medium text-foreground mb-2">{check.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{check.body}</p>
                  </div>
                </RevealSection>
              ))}
            </div>

            <RevealSection delay={0.3}>
              <p className="font-body text-sm text-muted-foreground mt-8 border-l-2 border-gold pl-4 max-w-2xl">
                <strong className="text-foreground">What the badge is not:</strong> it is not a star rating, a
                quality score, or an endorsement of luxury. It means the place is real, reachable, and operating.
                Judging whether it's right for you is what the photos, prices and reviews are for.
              </p>
            </RevealSection>
          </div>
        </section>

        {/* Payments */}
        <section className="py-14 px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto">
            <RevealSection>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold">Payments</p>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground mb-6">
                Your money doesn't go straight to a stranger.
              </h2>
            </RevealSection>

            <div className="grid md:grid-cols-2 gap-8">
              <RevealSection delay={0.05}>
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground mb-3">For travellers</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                    Payments are handled by a licensed payment processor — Fichua never sees or stores your card
                    details. Fichua holds the payment and releases it to the operator according to a stated
                    policy, rather than handing it over the moment you click pay. If something goes wrong before
                    that release, there is something to hold.
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    You always see the full price before you commit. Fichua does not add a markup to the
                    operator's rate.
                  </p>
                </div>
              </RevealSection>
              <RevealSection delay={0.12}>
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground mb-3">For operators</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                    You're not chasing a guest for a bank transfer, and you're not exposed to a no-show who never
                    intended to pay. The money is confirmed before the guest arrives, and it reaches the payout
                    account registered in your own business's name.
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Our commission is a single percentage, disclosed to you before you ever list, and materially
                    below what large booking platforms charge. There is no lock-in and no exclusivity — your
                    guests remain your guests.
                  </p>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-14 px-6 md:px-12 lg:px-20 bg-parchment-dark border-y border-border">
          <div className="max-w-5xl mx-auto">
            <RevealSection>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold">Reviews</p>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground mb-6">
                Reviews that can't be bought.
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">Verified Stay reviews</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Tied to a real booking made and paid through Fichua. They can only be submitted through a
                    single-use link sent after checkout, so they cannot be written by someone who never stayed,
                    submitted in bulk, or purchased. This is enforced by the database itself, not by a policy
                    someone could quietly ignore.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">Imported reviews</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Many good operators have years of history on other platforms. Where we carry those reviews
                    over, they are labelled with their source and linked to the original, and never presented as
                    though they were earned on Fichua. You can always see which is which.
                  </p>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* Disputes */}
        <section className="py-14 px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <RevealSection>
              <div className="flex items-center justify-center gap-2 mb-3">
                <LifeBuoy className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <p className="font-label text-xs tracking-[0.3em] uppercase text-gold">When something goes wrong</p>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground mb-5">
                You can reach us, not just each other.
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                A marketplace that only connects two parties and disappears isn't a trust layer. If a booking goes
                wrong, either side — traveller or operator — can report it straight to the Fichua team, separately
                from any conversation between them. Every report is read and followed up directly with the person
                who filed it.
              </p>
              <Link
                to="/report"
                className="inline-block font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:opacity-90 transition-opacity"
              >
                Report a problem
              </Link>
            </RevealSection>
          </div>
        </section>

        {/* Honesty section */}
        <section className="py-14 px-6 md:px-12 lg:px-20 bg-earth-dark text-earth-light">
          <div className="max-w-3xl mx-auto">
            <RevealSection>
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Being straight with you</p>
              <h2 className="font-display text-2xl md:text-4xl font-medium mb-6">
                What we don't claim.
              </h2>
              <ul className="space-y-4 font-body text-sm text-earth-light/75 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-gold">—</span>
                  <span>
                    We're early. Fichua is running its first pilot, and we'd rather tell you that than invent
                    numbers about how many bookings we've handled.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold">—</span>
                  <span>
                    We verify that a place is real, reachable and operating. We do not inspect the linens or grade
                    the breakfast — no verification badge anywhere can promise you'll enjoy your stay.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold">—</span>
                  <span>
                    Fichua is not the accommodation provider. Your stay is with the operator; our job is to make
                    sure they're real, that you can reach them, that the money is handled properly, and that
                    someone answers if it isn't.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold">—</span>
                  <span>
                    Photos on our listings are the operator's own. We check them against the property's real
                    location, and we don't allow edits that would misrepresent a place — no added pools, no
                    invented views.
                  </span>
                </li>
              </ul>
            </RevealSection>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Trust;
