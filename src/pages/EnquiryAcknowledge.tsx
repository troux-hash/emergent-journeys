import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

// One-tap "I've replied", for the operator.
//
// NO LOGIN. The reference is the capability: it's random, it's already in
// the operator's own WhatsApp thread, and the action it authorises is
// marking one enquiry answered. Putting a password in front of this would
// guarantee it never gets used, and then Fichua would have no response
// data at all -- which is worse than the tiny risk that someone who
// somehow obtained a reference marks an enquiry answered.
//
// It is also idempotent-ish by design: acknowledge_enquiry() returns
// false for an unknown or already-acknowledged reference, and we treat
// that as "nothing more to do" rather than as an error, because an
// operator tapping the link twice has done nothing wrong.

const EnquiryAcknowledge = () => {
  const { reference } = useParams<{ reference: string }>();
  const [state, setState] = useState<"working" | "done" | "already" | "error">("working");

  useEffect(() => {
    if (!reference) {
      setState("error");
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("acknowledge_enquiry", {
        p_reference: reference,
        p_via: "link",
      });
      if (cancelled) return;
      if (error) setState("error");
      else setState(data ? "done" : "already");
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-lg mx-auto px-6 text-center">
          {state === "working" && (
            <>
              <Loader2 size={28} className="animate-spin text-gold mx-auto mb-6" />
              <p className="font-body text-sm text-muted-foreground">Recording your reply…</p>
            </>
          )}

          {state === "done" && (
            <>
              <div className="w-14 h-14 border border-gold rounded-full flex items-center justify-center mx-auto mb-8">
                <Check size={22} className="text-gold" />
              </div>
              <h1 className="font-display text-3xl text-foreground mb-4">Thank you</h1>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                We've noted that you replied to enquiry{" "}
                <span className="text-gold">{reference}</span>. You won't get any more reminders
                about it.
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Fast replies are the single biggest thing that turns an enquiry into a booking — and
                your response times build the "typically replies within" signal on your listing.
              </p>
            </>
          )}

          {state === "already" && (
            <>
              <div className="w-14 h-14 border border-border rounded-full flex items-center justify-center mx-auto mb-8">
                <Check size={22} className="text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl text-foreground mb-4">Already recorded</h1>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                This enquiry was already marked as answered — nothing more to do. If the reference
                looks wrong, it may have been mistyped.
              </p>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-14 h-14 border border-border rounded-full flex items-center justify-center mx-auto mb-8">
                <HelpCircle size={22} className="text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl text-foreground mb-4">
                We couldn't record that
              </h1>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                Something went wrong on our side. Your reply to the traveller has still gone
                through — this page only affects our own records.
              </p>
              <Link
                to="/report"
                className="inline-block border border-foreground px-8 py-4 font-label text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Tell us about it
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EnquiryAcknowledge;
