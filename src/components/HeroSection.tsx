import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import rwandaHills from "@/assets/rwanda-hills.jpg";
import OperatorLeadForm from "./OperatorLeadForm";
import ContactButtons from "./ContactButtons";

const trust = [
  { icon: MapPin, label: "Pilot live in Rwanda" },
  { icon: ShieldCheck, label: "Every lodge verified before it goes live" },
  { icon: Sparkles, label: "Built for Google and AI search" },
  { icon: Users, label: "Recruiting across East & West Africa" },
];

const HeroSection = () => (
  <section className="relative overflow-hidden bg-earth-dark text-earth-light">
    <img src={rwandaHills} alt="Lodge among Rwanda's rolling terraced green hills at sunrise" className="absolute inset-0 h-full w-full object-cover opacity-30" width={1920} height={1024} />
    <div className="absolute inset-0 bg-earth-dark/70" />
    <div className="relative z-10 mx-auto grid min-h-[88vh] max-w-7xl items-center gap-8 px-6 pb-8 pt-32 md:gap-10 md:px-12 md:pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:px-20">
      <div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="mb-6 font-label text-xs uppercase tracking-[0.25em] text-gold">
          <span className="inline-flex border border-gold/60 px-3 py-2 text-earth-light">Not another booking platform · Direct bookings for independent lodges</span>
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mb-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] text-earth-light md:text-5xl lg:text-6xl">
          More bookings,<br />
          <em className="text-gold">less commissions,</em><br />
          more transparency,<br />
          <em className="text-gold">more revenues.</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mb-5 font-display text-2xl text-gold md:text-3xl">
          Up to 3x cheaper than Booking.com.
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="mb-8 max-w-xl font-body text-lg leading-relaxed text-earth-light md:text-xl">
          You put care into every stay. We help more guests find you. Fichua takes 7% on direct bookings — not the 15–20% big platforms charge — and you keep the guest relationship.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          <ContactButtons />
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="border border-earth-dark-foreground/20 bg-earth-dark/90 p-5 backdrop-blur-sm md:p-8">
        <p className="mb-2 font-label text-xs uppercase tracking-[0.25em] text-gold">List your lodge</p>
        <h2 className="mb-5 font-display text-2xl text-earth-light md:text-3xl">Put your lodge where guests can find it.</h2>
        <OperatorLeadForm compact />
        <p className="mt-4 text-center font-display text-lg text-gold">Your first 10 bookings are free.</p>
      </motion.div>
    </div>
    <div className="relative z-10 border-t border-earth-dark-foreground/20 bg-earth-dark/80">
      <ul aria-label="Why trust Fichua" className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4 md:px-12 lg:px-20">
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 font-body text-sm text-earth-light"><Icon className="h-4 w-4 shrink-0 text-gold" />{label}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default HeroSection;
