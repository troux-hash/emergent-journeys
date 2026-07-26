import { motion } from "framer-motion";
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
          For Independent Operators
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-4xl md:text-5xl lg:text-7xl font-medium leading-[1.1] text-foreground mb-6"
        >
          You deserve<br />
          to be found.<br />
          <em className="text-gold">We make sure you are.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-body text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
        >
          You run a great place. But guests can't find you. Fichua puts you in front of the right people and keeps every booking direct.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <a
            href="#contact"
            className="inline-block font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Make me visible
          </a>
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
      </div>
    </section>
  );
};

export default HeroSection;
