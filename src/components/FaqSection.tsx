import RevealSection from "./RevealSection";

export const faqItems = [
  { question: "Who is Fichua for?", answer: "Fichua is for independent lodges, guesthouses, camps and distinctive stays in East and West Africa that want to be found online and take more bookings directly." },
  { question: "What does Fichua cost?", answer: "The monthly subscription is equal to three nights in your least expensive room, plus 7% on bookings Fichua brings. You pay nothing until Fichua has delivered ten bookings." },
  { question: "How does Fichua help guests find my lodge?", answer: "Fichua publishes a verified, structured property page with your rooms, prices, location and contact details so travellers, search engines and AI assistants can understand and cite your lodge." },
  { question: "Do I keep the guest relationship?", answer: "Yes. Your lodge owns the guest relationship. There is no exclusivity or lock-in, and your real price is shown clearly to the traveller." },
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