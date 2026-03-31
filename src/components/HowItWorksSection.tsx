import RevealSection from "./RevealSection";
import { Users, Globe, CalendarCheck, CreditCard, TrendingUp, MessageCircle, Building2, BedDouble, Sparkles, Star, UserCheck } from "lucide-react";

const steps = [
  {
    num: 1,
    label: "We walk you through",
    icon: Users,
    body: "A 20-minute call with someone from Fichua — no pressure, no jargon. We set up your profile together, answer every question, and make sure you're comfortable before anything goes live.",
    note: "Your Fichua Buddy is assigned here — available on WhatsApp anytime, not just today.",
    impact: "You're never alone — support starts before you even go live.",
  },
  {
    num: 2,
    label: "Your hotel goes live",
    icon: Globe,
    body: "Your profile is published and visible to international travel agencies and travelers actively searching for authentic African stays. AI search engines like ChatGPT and Google can now recommend you by name.",
    impact: "Instant global visibility — guests can find and book you from anywhere.",
  },
  {
    num: 3,
    label: "Bookings start arriving",
    icon: CalendarCheck,
    body: "Booking requests come to you in one clear place — no scattered WhatsApp threads, no missed emails. You review, accept, and manage everything simply.",
    impact: "No more missed bookings — every request is captured and organized.",
  },
  {
    num: 4,
    label: "You get paid directly",
    icon: CreditCard,
    body: "Payments go straight to you via Visa — securely and reliably. Your financial data is protected to the highest standards. No middleman holding your money.",
    impact: "Your money hits your account — no commissions, no delays.",
  },
  {
    num: 5,
    label: "You grow, your way",
    icon: TrendingUp,
    body: "More visibility. More bookings. More revenue. You own the guest relationship, the data, and the business you're building — on your terms.",
    impact: "Sustainable growth you control — more revenue, more independence.",
  },
];

const infoCategories = [
  { num: 1, label: "Identity & Contact", icon: UserCheck },
  { num: 2, label: "Property Details", icon: Building2 },
  { num: 3, label: "Room Types & Pricing", icon: BedDouble },
  { num: 4, label: "Experiences & Sustainability", icon: Sparkles },
  { num: 5, label: "Social Proof", icon: Star },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-parchment py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
              How It Works
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight text-foreground">
              Five steps. No surprises.
            </h2>
          </div>
        </RevealSection>

        <div className="relative">
          {/* Vertical connector line — desktop only */}
          <div className="hidden md:block absolute left-8 top-8 bottom-8 w-px bg-border" />

          <div className="space-y-6 md:space-y-8">
            {steps.map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.08}>
                <div className="flex gap-5 md:gap-8 items-start">
                  {/* Step number + icon */}
                  <div className="relative flex-shrink-0 w-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-parchment-dark border border-border flex items-center justify-center relative z-10">
                      <step.icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
                    </div>
                    <span className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
                      Step {step.num}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-parchment-dark border border-border p-6 md:p-8">
                    <h3 className="font-display text-lg md:text-xl font-medium text-foreground mb-2">
                      {step.label}
                    </h3>
                    <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                    {step.note && (
                      <div className="mt-4 flex items-start gap-2 bg-background/60 border border-border px-4 py-3 rounded-sm">
                        <MessageCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">
                          {step.note}
                        </p>
                      </div>
                    )}
                    {step.impact && (
                      <p className="mt-3 font-label text-xs tracking-[0.1em] uppercase text-gold">
                        ⚡ {step.impact}
                      </p>
                    )}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>

        {/* Closing promise */}
        <RevealSection delay={0.5}>
          <p className="text-center font-display text-lg md:text-xl text-foreground mt-14 max-w-2xl mx-auto leading-relaxed">
            More bookings. More revenue. A partner who shows up — <em className="text-gold">every single time.</em>
          </p>
        </RevealSection>

        {/* What do we need from you */}
        <RevealSection delay={0.6}>
          <div className="mt-20 md:mt-28">
            <div className="text-center mb-12">
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
                What Do We Need From You
              </p>
              <h3 className="font-display text-xl md:text-3xl font-medium leading-tight text-foreground mb-3">
                Five categories. Every field has a purpose.
              </h3>
              <p className="font-body text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Every detail helps guests find you — across search engines, AI tools, and booking platforms.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {infoCategories.map((cat, i) => (
                <RevealSection key={cat.num} delay={0.7 + i * 0.08}>
                  <div className="bg-parchment-dark border border-border p-5 h-full flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-background/60 border border-border flex items-center justify-center mb-3">
                      <cat.icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    </div>
                    <span className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      {cat.num} of 5
                    </span>
                    <h4 className="font-display text-sm font-medium text-foreground leading-tight">
                      {cat.label}
                    </h4>
                  </div>
                </RevealSection>
              ))}
            </div>

            <RevealSection delay={1.1}>
              <p className="text-center font-body text-sm text-muted-foreground mt-10 max-w-xl mx-auto leading-relaxed">
                Don't worry if you don't have everything ready — your <span className="text-gold font-medium">Fichua Buddy</span> will walk you through it step by step.
              </p>
            </RevealSection>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default HowItWorksSection;
