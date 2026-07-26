import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Public dispute/support path: reachable from any operator page. Anyone —
// traveler or operator — can file a report here and it goes straight to
// Fichua (support_requests table, admin-visible at /intranet/support), not
// just into a WhatsApp thread between the two parties. This is the concrete
// signal that Fichua stands behind the transaction, not just the
// introduction.

const ReportIssue = () => {
  const [searchParams] = useSearchParams();
  const operatorId = searchParams.get("operatorId") || null;
  const operatorName = searchParams.get("operatorName") || "";
  const bookingId = searchParams.get("bookingId") || null;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.getElementById("report-message")?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim() || !message.trim()) {
      toast.error("Please share how to reach you and what happened");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("support_requests").insert({
      operator_id: operatorId,
      booking_id: bookingId,
      reporter_name: name.trim() || null,
      reporter_contact: contact.trim(),
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send that — please try again or email us directly.");
      return;
    }

    // Fire-and-forget admin notification — never blocks the user's confirmation.
    supabase.functions
      .invoke("send-transactional-email", {
        body: {
          templateName: "support-request",
          templateData: {
            reporterName: name.trim() || undefined,
            reporterContact: contact.trim(),
            operatorName: operatorName || undefined,
            message: message.trim(),
          },
        },
      })
      .catch(() => {
        // Non-fatal: the report is already saved and visible in /intranet/support.
      });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <CheckCircle className="w-10 h-10 text-gold mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-display text-3xl text-foreground mb-4">We've got it.</h1>
          <p className="font-body text-muted-foreground mb-8">
            This went straight to the Fichua team, not just {operatorName || "the operator"}. We'll follow up at{" "}
            {contact}.
          </p>
          <Link to="/" className="font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-6 py-3">
            Back to Fichua
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Report an Issue — Fichua</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-gold" />
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold">Goes Directly to Fichua</p>
          </div>
          <h1 className="font-display text-3xl text-foreground mb-2 text-center">Something not right?</h1>
          <p className="font-body text-sm text-muted-foreground mb-8 text-center">
            {operatorName ? `Tell us what happened with ${operatorName}` : "Tell us what happened"} — this is
            reviewed by the Fichua team directly, not routed through the operator.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or WhatsApp number, so we can follow up"
              required
              className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            <textarea
              id="report-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              required
              placeholder="What happened?"
              className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full font-label text-sm tracking-[0.2em] uppercase bg-gold text-earth-dark py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send to Fichua"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReportIssue;
