import { Helmet } from "react-helmet-async";
import { ArrowLeft, BedDouble, Check, MapPin, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import sampleLodge from "@/assets/safari-lodge.jpg";

const SampleLodge = () => (
  <main className="min-h-screen bg-parchment text-foreground">
    <Helmet>
      <title>Fictional sample lodge page | Fichua</title>
      <meta name="description" content="A fictional demonstration of the verified lodge pages Fichua creates for independent operators." />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href="https://fichua.co/sample-lodge" />
    </Helmet>

    <div className="bg-earth-dark px-6 py-3 text-center font-label text-[10px] uppercase tracking-[0.2em] text-earth-light">
      Fictional demonstration — not a real property and not available to book
    </div>
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/" className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-[0.15em]"><ArrowLeft className="h-4 w-4" /> Fichua</Link>
      <span className="font-display text-2xl">Fichua</span>
    </nav>

    <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 pt-4 lg:grid-cols-[1.35fr_0.65fr]">
      <div>
        <img src={sampleLodge} alt="Fictional lodge among green hills" className="aspect-[16/10] w-full object-cover" />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 border border-gold px-3 py-2 font-label text-[10px] uppercase tracking-[0.15em]"><ShieldCheck className="h-4 w-4 text-gold" /> Fichua Verified</span>
          <span className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Musanze, Rwanda</span>
        </div>
        <h1 className="mt-5 font-display text-5xl leading-none md:text-7xl">Imara Hills Lodge</h1>
        <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">A quiet, locally run base for volcanic landscapes, community walks and unhurried mornings. This fictional listing shows how Fichua presents a lodge’s real story, rooms and direct booking path.</p>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-3xl">Rooms and real prices</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="border border-border bg-parchment-dark p-6"><BedDouble className="h-5 w-5 text-gold" /><h3 className="mt-4 font-display text-2xl">Garden Room</h3><p className="mt-2 font-body text-sm text-muted-foreground">Breakfast included · Private terrace</p><p className="mt-5 font-display text-2xl">$120 <span className="font-body text-xs text-muted-foreground">per night</span></p></article>
            <article className="border border-border bg-parchment-dark p-6"><Users className="h-5 w-5 text-gold" /><h3 className="mt-4 font-display text-2xl">Family Cottage</h3><p className="mt-2 font-body text-sm text-muted-foreground">Sleeps four · Mountain view</p><p className="mt-5 font-display text-2xl">$210 <span className="font-body text-xs text-muted-foreground">per night</span></p></article>
          </div>
        </div>
      </div>

      <aside className="self-start border border-border bg-parchment-dark p-6 lg:sticky lg:top-6">
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-gold">Direct booking</p>
        <h2 className="mt-3 font-display text-3xl">Request your stay</h2>
        <div className="mt-6 space-y-3 font-body text-sm text-muted-foreground">
          <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Real room prices, with no hidden OTA markup</p>
          <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Operator confirmation by WhatsApp</p>
          <p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Verified identity, location and payout details</p>
        </div>
        <Button asChild className="mt-8 w-full rounded-none font-label text-xs uppercase tracking-[0.15em]"><Link to="/#contact">Build my lodge page</Link></Button>
        <p className="mt-4 text-center font-body text-xs text-muted-foreground">Demo only. No booking will be created.</p>
      </aside>
    </section>
  </main>
);

export default SampleLodge;