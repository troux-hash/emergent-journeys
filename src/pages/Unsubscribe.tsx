import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid" | "success" | "error">("loading");
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await resp.json();
        if (!resp.ok) setStatus("invalid");
        else if (data.valid === false && data.reason === "already_unsubscribed") setStatus("used");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) setStatus("error");
      else setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">Email Preferences</h1>
        {status === "loading" && <p className="text-muted-foreground">Validating your request...</p>}
        {status === "valid" && (
          <>
            <p className="text-muted-foreground mb-6">Click below to unsubscribe from future emails.</p>
            <button
              onClick={handleUnsubscribe}
              className="bg-primary text-primary-foreground px-6 py-3 font-label text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}
        {status === "used" && <p className="text-muted-foreground">You have already unsubscribed.</p>}
        {status === "success" && <p className="text-muted-foreground">You have been successfully unsubscribed.</p>}
        {status === "invalid" && <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>}
        {status === "error" && <p className="text-destructive">Something went wrong. Please try again later.</p>}
      </div>
    </div>
  );
};

export default Unsubscribe;
