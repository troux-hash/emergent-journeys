import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Why Now", href: "#why-now" },
  { label: "Solution", href: "#solution" },
  { label: "Model", href: "#model" },
  { label: "Traction", href: "#traction" },
  { label: "Vision", href: "#vision" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-parchment/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <a href="#" className="font-display text-2xl font-semibold tracking-tight text-foreground">
          fichua
        </a>
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-label text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="font-label text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-5 py-2 hover:opacity-90 transition-opacity"
          >
            For Operators
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
