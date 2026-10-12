import { Bot, Repeat, Download, Search, ShieldCheck } from "lucide-react";
import RevealSection from "./RevealSection";
import hostWelcome from "@/assets/host-welcome.jpg";

const keep = [
  { icon: Repeat, title: "Repeat bookings", body: "Past guests can rebook with you directly — no commission war." },
  { icon: Download, title: "Your guest list, exportable", body: "Real names, emails and WhatsApp numbers you can download." },
  { icon: Search, title: "Ongoing discovery", body: "Your verified page keeps getting found on Google and by AI." },
  { icon: ShieldCheck, title: "Trust that travels", body: "The Fichua Verified badge gives new guests confidence." },
];

const AudienceSection = () => (
  <>
    <section id="ai-visibility" className="bg-earth-dark px-6 py-16 text-earth-light md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <RevealSection>
          <p className="mb-4 flex items-center gap-2 font-label text-xs uppercase tracking-[0.3em] text-gold"><Bot className="h-4 w-4" /> AI visibility</p>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">Travellers now ask ChatGPT where to stay. <em className="text-gold">Will it name you?</em></h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-earth-light">Fichua publishes your rooms, prices and location in the structured format Google and AI assistants read — so when someone asks for a lodge like yours, you can be the answer.</p>
        </RevealSection>
        <RevealSection delay={0.1}><img src={hostWelcome} alt="Lodge host welcoming two travellers at the door" loading="lazy" width={1280} height={864} className="aspect-[4/3] w-full object-cover" /></RevealSection>
      </div>
      <p className="mx-auto mt-6 max-w-6xl font-body text-base text-earth-light">Every booking that comes through your Fichua page is tracked to its source, so you see exactly what Fichua brought you — and pay only on those.</p>
    </section>
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
  </>
);

export default AudienceSection;
