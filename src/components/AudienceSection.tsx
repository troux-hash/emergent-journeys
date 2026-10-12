import { Repeat, Download, Search, ShieldCheck } from "lucide-react";
import RevealSection from "./RevealSection";

const keep = [
  { icon: Repeat, title: "Repeat bookings", body: "Past guests can rebook with you directly — no commission war." },
  { icon: Download, title: "Your guest list, exportable", body: "Real names, emails and WhatsApp numbers you can download." },
  { icon: Search, title: "Ongoing discovery", body: "Your verified page keeps getting found on Google and by AI." },
  { icon: ShieldCheck, title: "Trust that travels", body: "The Fichua Verified badge gives new guests confidence." },
];

const AudienceSection = () => (
  <section id="why-stay" className="bg-parchment-dark px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-6xl">
      <RevealSection>
        <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">After the first booking</p>
        <h2 className="max-w-3xl font-display text-4xl leading-tight text-foreground md:text-5xl">Why lodges keep using Fichua.</h2>
      </RevealSection>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {keep.map(({ icon: Icon, title, body }) => (
          <div key={title} className="border border-border bg-parchment p-6"><Icon className="h-5 w-5 text-gold" /><h3 className="mt-3 font-display text-xl text-foreground">{title}</h3><p className="mt-2 font-body text-base text-muted-foreground">{body}</p></div>
        ))}
      </div>
    </div>
  </section>
);

export default AudienceSection;
