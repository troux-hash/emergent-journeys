import { useState, useEffect } from "react";
import { MessageCircle, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// The handoff to the operator.
//
// WHY IT IS TWO TAPS AND NOT ONE
// A single tap that ran an async insert and then called window.open()
// would be blocked by every mobile browser -- the popup no longer counts
// as user-initiated once you await. So the panel opens on the first tap,
// the enquiry is created while the traveller reads and edits the message,
// and the second tap is a plain <a href> that always works.
//
// The extra tap earns its keep: the traveller sees the exact message
// before it is sent, including the Fichua reference. Nothing is inserted
// into their conversation behind their back, which is the whole point of
// the positioning.
//
// If the enquiry insert fails, the link still opens with no reference.
// Losing attribution is a Fichua problem; it must never become a reason
// a traveller can't reach an operator.

interface Props {
  operatorId: string;
  operatorName: string;
  phone?: string | null;
  email?: string | null;
}

type Channel = "whatsapp" | "email";

// WhatsApp deep links need digits only.
function waNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

const ContactOperator = ({ operatorId, operatorName, phone, email }: Props) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const openPanel = (c: Channel) => {
    setChannel(c);
    setReference(null);
    setMessage(
      `Hi ${operatorName} — I found you on Fichua. Do you have availability for 3 nights? I'd love to know more about your rooms.`
    );
  };

  // Create the enquiry once the traveller has committed to making contact,
  // not on page load -- a page view is not an enquiry.
  useEffect(() => {
    if (!channel) return;
    let cancelled = false;
    setCreating(true);
    (async () => {
      const { data, error } = await supabase.rpc("create_enquiry", {
        p_operator_id: operatorId,
        p_channel: channel,
        p_initial_message: message.slice(0, 2000),
      });
      if (cancelled) return;
      setCreating(false);
      if (error) {
        // Deliberately silent: the traveller can still send their message.
        console.warn("Could not register enquiry", error.message);
        return;
      }
      setReference(data as string);
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally keyed on channel only -- editing the message must not
    // create a second enquiry on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, operatorId]);

  const fullMessage = reference ? `${message}\n\n(Fichua ref ${reference})` : message;

  const href =
    channel === "whatsapp" && phone
      ? `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(fullMessage)}`
      : channel === "email" && email
        ? `mailto:${email}?subject=${encodeURIComponent(
            reference ? `Enquiry via Fichua (${reference})` : "Enquiry via Fichua"
          )}&body=${encodeURIComponent(fullMessage)}`
        : "#";

  return (
    <div className="border border-border p-8">
      <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
        Talk to {operatorName} directly
      </p>
      <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
        Your message goes straight to {operatorName} — Fichua isn't in the middle of the
        conversation. We just make sure you get an answer quickly.
      </p>

      {!channel ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {phone && (
            <button
              onClick={() => openPanel("whatsapp")}
              className="flex-1 flex items-center justify-center gap-2 border border-foreground px-6 py-4 font-label text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <MessageCircle size={14} />
              Message on WhatsApp
            </button>
          )}
          {email && (
            <button
              onClick={() => openPanel("email")}
              className="flex-1 flex items-center justify-center gap-2 border border-border px-6 py-4 font-label text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <Mail size={14} />
              Send an email
            </button>
          )}
        </div>
      ) : (
        <div>
          <label
            htmlFor="enquiry-message"
            className="block font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2"
          >
            Your message — edit it however you like
          </label>
          <textarea
            id="enquiry-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            className="w-full bg-transparent border border-border p-4 font-body text-sm text-foreground focus:border-gold focus:outline-none resize-none"
          />

          <p className="font-body text-xs text-muted-foreground mt-3 mb-5 flex items-center gap-2">
            {creating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Preparing your reference…
              </>
            ) : reference ? (
              <>
                Reference <span className="text-gold">{reference}</span> will be added to your
                message. It's how {operatorName} and Fichua both know this enquiry came from here.
              </>
            ) : (
              <>Ready to send.</>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={href}
              target={channel === "whatsapp" ? "_blank" : undefined}
              rel={channel === "whatsapp" ? "noopener noreferrer" : undefined}
              className="flex-1 flex items-center justify-center gap-2 bg-gold px-6 py-4 font-label text-[11px] tracking-[0.15em] uppercase text-background hover:opacity-90 transition-opacity"
            >
              {channel === "whatsapp" ? <MessageCircle size={14} /> : <Mail size={14} />}
              {channel === "whatsapp" ? "Open WhatsApp" : "Open email"}
            </a>
            <button
              onClick={() => setChannel(null)}
              className="px-6 py-4 font-label text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactOperator;
