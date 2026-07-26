import { useState } from "react";
import RevealSection from "./RevealSection";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OperatorSignupSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    entityName: "",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    numRooms: "",
    priceMin: "",
    priceMax: "",
  });

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("operator_leads").insert({
      property_name: formData.entityName.trim(),
      phone: formData.whatsapp.trim(),
      instagram_handle: formData.instagram.trim() || null,
      tiktok_handle: formData.tiktok.trim() || null,
      facebook_handle: formData.facebook.trim() || null,
      num_rooms: formData.numRooms ? parseInt(formData.numRooms, 10) : null,
      price_min: formData.priceMin ? parseFloat(formData.priceMin) : null,
      price_max: formData.priceMax ? parseFloat(formData.priceMax) : null,
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
                Tell us about your place. We'll reach out on WhatsApp within 24 hours to set up your Fichua page.
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
                  A member of the Fichua team will message you on WhatsApp within 24 hours to schedule your onboarding call.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-earth-dark-foreground/5 border border-earth-dark-foreground/10 p-8 md:p-10 space-y-5">
                <h3 className="font-display text-lg font-medium text-earth-light mb-2">
                  Make me visible — it takes 2 minutes
                </h3>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    Name of Entity
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.entityName}
                    onChange={handleChange("entityName")}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="e.g. Kilima Lodge"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={40}
                    value={formData.whatsapp}
                    onChange={handleChange("whatsapp")}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.instagram}
                      onChange={handleChange("instagram")}
                      className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                      TikTok
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.tiktok}
                      onChange={handleChange("tiktok")}
                      className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                      Facebook
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.facebook}
                      onChange={handleChange("facebook")}
                      className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="@handle"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={formData.numRooms}
                    onChange={handleChange("numRooms")}
                    className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="e.g. 12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                      Min Price / Night
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.priceMin}
                      onChange={handleChange("priceMin")}
                      className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="e.g. 80"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] tracking-[0.2em] uppercase text-earth-dark-foreground/50 block mb-2">
                      Max Price / Night
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.priceMax}
                      onChange={handleChange("priceMax")}
                      className="w-full bg-transparent border border-earth-dark-foreground/20 px-4 py-3 font-body text-sm text-earth-light placeholder:text-earth-dark-foreground/30 focus:border-gold focus:outline-none transition-colors"
                      placeholder="e.g. 250"
                    />
                  </div>
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
