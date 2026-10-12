import { BedDouble, Check, MapPin, MessageCircle, Search, ShieldCheck } from "lucide-react";
import RevealSection from "./RevealSection";
import lodgeRoom from "@/assets/lodge-room.jpg";
import hostWelcome from "@/assets/host-welcome.jpg";

const verified = ["Identity and ownership confirmed", "Photos checked against GPS location", "WhatsApp answered by a real person", "Payout account confirmed"];
const journey = [
  { icon: Search, title: "Guests find you", body: "On Google or through an AI assistant." },
  { icon: ShieldCheck, title: "See your rooms", body: "Your photos, prices and verified location." },
  { icon: MessageCircle, title: "Book directly", body: "On WhatsApp, with you." },
];

const ProductMockup = () => (
  <section id="product" className="bg-parchment px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-6xl">
      <RevealSection>
        <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">Your lodge, online</p>
        <h2 className="max-w-3xl font-display text-4xl leading-tight text-foreground md:text-6xl">A feel for your place. A way to book.</h2>
        <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">Your rooms, your setting, your welcome — all on one verified page.</p>
      </RevealSection>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <RevealSection delay={0.1}>
          <div className="border border-border bg-parchment-dark shadow-xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2"><span className="h-2.5 w-2.5 rounded-full bg-muted" /><span className="h-2.5 w-2.5 rounded-full bg-muted" /><span className="h-2.5 w-2.5 rounded-full bg-muted" /><span className="ml-3 font-body text-xs text-muted-foreground">fichua.co/operators/your-lodge</span></div>
            <img src={lodgeRoom} alt="Example guest room with woven baskets and a hill view" loading="lazy" width={1280} height={864} className="aspect-[16/9] w-full object-cover" />
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 border border-gold px-3 py-1.5 font-label text-[10px] uppercase tracking-[0.15em] text-foreground"><ShieldCheck className="h-4 w-4 text-gold" /> Fichua Verified</span><span className="inline-flex items-center gap-1 font-body text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Musanze, Rwanda</span></div>
              <p className="mt-4 font-display text-3xl text-foreground">Your Lodge Name</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">{["Garden Room · $120/night", "Family Cottage · $210/night"].map((r) => <p key={r} className="flex items-center gap-2 border border-border bg-parchment p-3 font-body text-sm text-foreground"><BedDouble className="h-4 w-4 text-gold" />{r}</p>)}</div>
              <p className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2.5 font-label text-xs uppercase tracking-[0.15em] text-primary-foreground"><MessageCircle className="h-4 w-4" /> Book on WhatsApp</p>
              <p className="mt-3 font-body text-xs text-muted-foreground">Example page — illustrative only.</p>
            </div>
          </div>
        </RevealSection>
        <RevealSection delay={0.15}>
          <div className="space-y-6">
            <figure>
              <img src={hostWelcome} alt="Illustration of a lodge host welcoming two guests, with Rwanda’s green hills behind them" loading="lazy" width={1280} height={864} className="aspect-[3/2] w-full object-cover" />
              <figcaption className="mt-2 font-body text-xs text-muted-foreground">Hospitality illustration.</figcaption>
            </figure>
            <div className="border border-border p-6">
              <p className="mb-4 font-label text-xs uppercase tracking-[0.2em] text-gold">What "Verified" means</p>
              <ul className="space-y-3">{verified.map((v) => <li key={v} className="flex gap-2 font-body text-base text-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-gold" />{v}</li>)}</ul>
            </div>
          </div>
        </RevealSection>
      </div>
      <RevealSection delay={0.2}>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {journey.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="border border-border bg-parchment-dark p-6"><span className="font-label text-xs text-gold">0{i + 1}</span><Icon className="mt-3 h-5 w-5 text-gold" /><h3 className="mt-3 font-display text-2xl text-foreground">{title}</h3><p className="mt-2 font-body text-base text-muted-foreground">{body}</p></li>
          ))}
        </ol>
      </RevealSection>
    </div>
  </section>
);

export default ProductMockup;
