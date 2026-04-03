import { motion } from "framer-motion";
import heroImage from "@/assets/hero-lodge.jpg";
import safariLodge from "@/assets/safari-lodge.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex">
      {/* Left: Content */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24 z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-8"
        >
          From Swahili · Bantu root
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-4xl md:text-5xl lg:text-7xl font-medium leading-[1.1] text-foreground mb-6"
        >
          What is hidden<br />
          is not absent —<br />
          <em className="text-gold">it is simply<br />
          not yet revealed.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-body text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
        >
          Independent lodges are invisible to AI travel search.
          Fichua makes them findable, bookable, and profitable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="flex flex-wrap gap-12"
        >
          {[
            { value: "$170B", label: "Africa tourism market" },
            { value: "82%", label: "Travellers decide via AI" },
            { value: "<5%", label: "Operators AI-visible" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl md:text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: Image panel with safari lodge */}
      <div className="hidden lg:block w-[40%] relative overflow-hidden">
        <div className="absolute inset-0 bg-earth-dark/20 z-10" />
        <img
          src={safariLodge}
          alt="Cheetah hidden in golden savanna grass"
          className="absolute inset-0 w-full h-full object-cover object-[30%_center]"
          width={1280}
          height={720}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="absolute bottom-20 right-8 font-display text-[12rem] font-bold leading-none text-primary-foreground select-none pointer-events-none z-20"
        >
          ficha
        </motion.span>
      </div>
    </section>
  );
};

export default HeroSection;
