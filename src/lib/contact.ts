// Replace with a real scheduling link (e.g. Calendly) when available.
export const BOOK_CALL_URL = "mailto:tr@fichua.co?subject=Book%20a%20call%20with%20Fichua";
// International format, digits only (e.g. "250788123456"). Empty = WhatsApp button hidden.
export const WHATSAPP_NUMBER = "";
export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Fichua, I'd like to list my lodge.")}`
  : "";
