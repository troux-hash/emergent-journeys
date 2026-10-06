import { motion } from "framer-motion";
import safariLodge from "@/assets/safari-lodge.jpg";
import OperatorLeadForm from "./OperatorLeadForm";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-earth-dark text-earth-light">
      <img src={safariLodge} alt="Independent safari lodge in the African landscape" className="absolute inset-0 h-full w-full object-cover opacity-25" width={1280} height={720} />
      <div className="absolute inset-0 bg-earth-dark/70" />
      <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl items-center gap-6 px-6 pb-10 pt-20 md:gap-10 md:px-12 md:pb-16 md:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-20">
        <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6 font-label text-xs uppercase tracking-[0.3em] text-gold"
        >
          For independent lodges in East &amp; West Africa
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-5 max-w-3xl font-display text-4xl font-medium leading-[0.98] text-earth-light sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl"
        >
          Keep <em className="text-gold">up to $65 more</em><br />
          on every $500 booking.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-8 max-w-xl font-body text-base leading-relaxed text-earth-dark-foreground/80 md:text-lg"
        >
          Fichua helps independent lodges get found by travellers, Google and AI — then take verified direct bookings at 7%, not the 15–20% charged by large platforms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="hidden max-w-lg grid-cols-3 border-y border-earth-dark-foreground/20 py-5 sm:grid">
            <div><strong className="block font-display text-3xl text-gold">7%</strong><span className="font-body text-xs text-earth-dark-foreground/60">Fichua booking fee</span></div>
            <div className="border-x border-earth-dark-foreground/20 px-4"><strong className="block font-display text-3xl text-earth-light">10</strong><span className="font-body text-xs text-earth-dark-foreground/60">bookings before fees</span></div>
            <div className="pl-4"><strong className="block font-display text-3xl text-earth-light">3×</strong><span className="font-body text-xs text-earth-dark-foreground/60">lowest nightly rate monthly</span></div>
          </div>
        </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="border border-earth-dark-foreground/15 bg-earth-dark/85 p-5 backdrop-blur-sm md:p-8">
          <p className="mb-2 font-label text-xs uppercase tracking-[0.25em] text-gold">Start here</p>
          <h2 className="mb-5 font-display text-2xl text-earth-light md:text-3xl">Put your lodge where guests can find it.</h2>
          <OperatorLeadForm compact />
          <p className="mt-4 text-center font-display text-lg text-gold">You pay nothing until Fichua has delivered 10 bookings.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
