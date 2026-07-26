import { useState } from "react";
import RevealSection from "./RevealSection";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OperatorSignupSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    property: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("operator_leads").insert({
      name: formData.name.trim(),
      property_name: formData.property.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Failed to submit operator lead:", error);
      toast.error("Something went wrong sending that. Please try again, or reach us directly.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <section id="contact" className="bg-earth-dark text-earth-light py-16 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left: Copy */}
          <RevealSection>
            <div>
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">
                Make me visible
              </p>
              <h2 className="font-display text-2xl md:text-4xl font-medium leading-tight text-earth-light mb-6">
                Ready? <em className="text-gold">It takes 2 minutes.</em>
              </h2>
              <p className="font-body text-sm md:text-base text-earth-dark-foreground/70 leading-relaxed mb-4">
                Fill in four fields. We'll reach out within 24 hours to set up your Fichua page — on WhatsApp, call, or email, whatever suits you.
              </p>
              <p className="font-body text-sm text-earth-dark-foreground/60 leading-relaxed">
                No contracts. No upfront fees. No obligation.
              </p>
            </div>
          </RevealSection>

          {/* Right: Form */}
          <RevealSection delay={0.1}>
            {submitted ? (
              <div className="bg-earth-dark-foreground/5 border border-earth-dark-foreground/10 p-8 md:p-10 text-center">
                <CheckCircle className="w-10 h-10 text-gold mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-medium text-earth-light mb-2">
                  We'll be in touch!
                </h3>
                <p className="font-body text-sm text-earth-dark-foreground/60">
                  A member of the Fichua team will reach out within 24 hours to schedule your onboarding call.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-earth-dark-foreground/5 border border-earth-dark-foreground/10 p-8 md:p-10 space-y-5">
                <h3 className="font-display text-lg font-medium text-earth-light mb-2">
                  Make me visible — it takes 2 minutes
                </h3>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="e.g. Sarah Njeri"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    Property or Business Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.property}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="e.g. Kilima Lodge"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={255}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="sarah@kilimalodge.com"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    maxLength={20}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 font-label text-xs tracking-[0.2em] uppercase bg-gold text-earth-dark px-6 py-4 hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  {isSubmitting ? "Sending..." : "Make me visible"}
                </button>

                <p className="font-body text-[11px] text-earth-dark-foreground/40 text-center">
                  No contracts. No upfront fees. Cancel anytime.
                </p>
              </form>
            )}
          </RevealSection>
        </div>
      </div>
    </section>
  );
};

export default OperatorSignupSection;
