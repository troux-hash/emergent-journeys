import RevealSection from "./RevealSection";
import { Mail, Instagram, Linkedin } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/fichua", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/fichua", label: "LinkedIn" },
  {
    label: "TikTok",
    href: "https://tiktok.com/@fichua",
    custom: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/fichua",
    custom: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="bg-earth-dark text-earth-dark-foreground">
      {/* CTA section */}
      <div className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <RevealSection>
            <p className="font-display text-2xl md:text-4xl italic text-gold/80 mb-8 leading-relaxed">
              "What is hidden is not absent —<br />
              it is simply not yet revealed."
            </p>
            <p className="font-body text-sm text-earth-dark-foreground/50 mb-12">
              From Swahili · Bantu root: ficha (to hide) → fichua (to reveal)
            </p>
            <a
              href="mailto:teddy225@mit.edu"
              className="inline-block font-label text-sm tracking-[0.2em] uppercase bg-gold text-earth-dark px-10 py-4 hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </a>
          </RevealSection>
        </div>
      </div>

      {/* Footer bar */}
      <div className="border-t border-earth-dark-foreground/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Contact */}
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gold" />
            <a
              href="mailto:teddy225@mit.edu"
              className="font-body hover:text-gold transition-colors"
            >
              teddy225@mit.edu
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-earth-dark-foreground/60 hover:text-gold transition-colors"
              >
                {link.custom ? link.custom : <link.icon className="w-5 h-5" strokeWidth={1.5} />}
              </a>
            ))}
          </div>

          {/* Legal */}
          <div className="flex items-center gap-6 font-label text-[10px] tracking-[0.15em] uppercase text-earth-dark-foreground/40">
            <span>© {new Date().getFullYear()} Fichua</span>
            <a href="#" className="hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
