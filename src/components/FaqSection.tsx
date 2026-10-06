import RevealSection from "./RevealSection";

export const faqItems = [
  { question: "Who is Fichua for?", answer: "Fichua is for independent lodges, guesthouses, camps and distinctive stays in East and West Africa that want to be found online and take more bookings directly." },
  { question: "What does Fichua cost?", answer: "The monthly subscription is equal to three nights in your least expensive room, plus 7% on bookings Fichua brings. You pay nothing until Fichua has delivered ten bookings." },
  { question: "How does Fichua help guests find my lodge?", answer: "Fichua publishes a verified, structured property page with your rooms, prices, location and contact details so travellers, search engines and AI assistants can understand and cite your lodge." },
  { question: "Do I keep the guest relationship?", answer: "Yes. Your lodge owns the guest relationship. There is no exclusivity or lock-in, and your real price is shown clearly to the traveller." },
  { question: "Can I stay on Booking.com and other platforms?", answer: "Yes. Fichua has no exclusivity, so you can keep every listing you have today. Fichua adds a direct channel alongside them, and each direct booking costs you 7% instead of 15–20%." },
  { question: "How and when do I get paid? Can I use mobile money?", answer: "Fichua confirms your payout method before your page goes live. Available bank or mobile-money options, payout timing and any processor fees depend on your country and are confirmed with you during onboarding." },
  { question: "How long does it take to go live?", answer: "There is no fixed promise because verification time depends on how quickly we can confirm your identity, ownership, photos, GPS location, WhatsApp number and payout details. We tell you what is still needed at each step." },
  { question: "Which countries does Fichua cover?", answer: "Fichua is starting with a pilot in Rwanda and is recruiting independent stays across East and West Africa. Outside Rwanda, contact us and we will confirm whether onboarding and payouts are ready in your country." },
  { question: "What does Fichua Verified mean for guests?", answer: "It means Fichua has confirmed the operator’s identity and ownership, checked property photos against its GPS location, reached a real person on WhatsApp, and confirmed a payout account before publishing the listing." },
];

const FaqSection = () => (
  <section id="faq" className="bg-parchment px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[0.7fr_1.3fr]">
      <RevealSection><div><p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">Questions</p><h2 className="font-display text-4xl text-foreground md:text-5xl">What lodge owners ask first.</h2></div></RevealSection>
      <div className="border-t border-border">{faqItems.map((item, index) => <RevealSection key={item.question} delay={index * 0.05}><details className="group border-b border-border py-6"><summary className="cursor-pointer list-none pr-8 font-display text-xl text-foreground marker:hidden">{item.question}<span className="float-right font-body text-gold group-open:rotate-45">+</span></summary><p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">{item.answer}</p></details></RevealSection>)}</div>
    </div>
  </section>
);

export default FaqSection;