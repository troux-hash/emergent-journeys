import { CalendarDays, MessageCircle } from "lucide-react";
import { BOOK_CALL_URL, WHATSAPP_URL } from "@/lib/contact";

const ContactButtons = ({ dark = true }: { dark?: boolean }) => (
  <div className="flex flex-wrap gap-3">
    <a href={BOOK_CALL_URL} className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 font-label text-xs uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90">
      <CalendarDays className="h-4 w-4" /> Book a Call
    </a>
    {WHATSAPP_URL && (
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 border px-6 py-3.5 font-label text-xs uppercase tracking-[0.15em] transition-colors ${dark ? "border-earth-dark-foreground/40 text-earth-light hover:border-gold" : "border-foreground/30 text-foreground hover:border-gold"}`}>
        <MessageCircle className="h-4 w-4" /> WhatsApp us
      </a>
    )}
  </div>
);

export default ContactButtons;
