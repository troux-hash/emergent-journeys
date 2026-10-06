import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OperatorLeadFormProps = {
  compact?: boolean;
};

const OperatorLeadForm = ({ compact = false }: OperatorLeadFormProps) => {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    entityName: "",
    whatsapp: "",
    email: "",
    numRooms: "",
    priceMin: "",
    priceMax: "",
  });

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => setFormData((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const utm = (key: string) => searchParams.get(key)?.slice(0, 200) || null;
    const { error } = await supabase.from("operator_leads").insert({
      property_name: formData.entityName.trim(),
      phone: formData.whatsapp.trim(),
      email: formData.email.trim() || null,
      num_rooms: formData.numRooms ? Number.parseInt(formData.numRooms, 10) : null,
      price_min: formData.priceMin ? Number.parseFloat(formData.priceMin) : null,
      price_max: formData.priceMax ? Number.parseFloat(formData.priceMax) : null,
      utm_source: utm("utm_source"),
      utm_medium: utm("utm_medium"),
      utm_campaign: utm("utm_campaign"),
      utm_content: utm("utm_content"),
    });

    setIsSubmitting(false);
    if (error) {
      console.error("Failed to submit operator lead:", error);
      toast.error("Something went wrong. Please try again or email tr@fichua.co.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="border border-earth-dark-foreground/15 bg-earth-dark-foreground/5 p-8 text-center" role="status">
        <CheckCircle className="mx-auto mb-4 h-9 w-9 text-gold" strokeWidth={1.5} />
        <h3 className="mb-2 font-display text-2xl text-earth-light">Your place is on our list.</h3>
        <p className="font-body text-sm leading-relaxed text-earth-dark-foreground/70">
          We’ll message you on WhatsApp within one working day.
        </p>
      </div>
    );
  }

  const inputClass = "w-full border border-earth-dark-foreground/20 bg-transparent px-4 py-3 font-body text-sm text-earth-light outline-none placeholder:text-earth-dark-foreground/35 focus:border-gold";
  const labelClass = "mb-2 block font-label text-[10px] uppercase tracking-[0.2em] text-earth-dark-foreground/60";
  const utmValue = (key: string) => searchParams.get(key)?.slice(0, 200) || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="List your lodge with Fichua">
      <input type="hidden" name="utm_source" value={utmValue("utm_source")} readOnly />
      <input type="hidden" name="utm_medium" value={utmValue("utm_medium")} readOnly />
      <input type="hidden" name="utm_campaign" value={utmValue("utm_campaign")} readOnly />
      <input type="hidden" name="utm_content" value={utmValue("utm_content")} readOnly />
      <div>
        <label htmlFor={`${compact ? "hero" : "signup"}-entity`} className={labelClass}>Lodge or property name</label>
        <input id={`${compact ? "hero" : "signup"}-entity`} required maxLength={150} value={formData.entityName} onChange={handleChange("entityName")} className={inputClass} placeholder="Your property name" />
      </div>
      <div className={compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor={`${compact ? "hero" : "signup"}-whatsapp`} className={labelClass}>WhatsApp number</label>
          <input id={`${compact ? "hero" : "signup"}-whatsapp`} type="tel" required maxLength={40} value={formData.whatsapp} onChange={handleChange("whatsapp")} className={inputClass} placeholder="+254 700 000 000" />
        </div>
        <div>
          <label htmlFor={`${compact ? "hero" : "signup"}-email`} className={labelClass}>Email <span className="normal-case tracking-normal">(optional)</span></label>
          <input id={`${compact ? "hero" : "signup"}-email`} type="email" maxLength={320} value={formData.email} onChange={handleChange("email")} className={inputClass} placeholder="you@yourproperty.com" />
        </div>
      </div>
      {!compact && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="signup-rooms" className={labelClass}>Rooms</label>
            <input id="signup-rooms" type="number" min={0} max={10000} value={formData.numRooms} onChange={handleChange("numRooms")} className={inputClass} placeholder="12" />
          </div>
          <div>
            <label htmlFor="signup-min" className={labelClass}>Lowest rate</label>
            <input id="signup-min" type="number" min={0} step="0.01" value={formData.priceMin} onChange={handleChange("priceMin")} className={inputClass} placeholder="80" />
          </div>
          <div>
            <label htmlFor="signup-max" className={labelClass}>Highest rate</label>
            <input id="signup-max" type="number" min={0} step="0.01" value={formData.priceMax} onChange={handleChange("priceMax")} className={inputClass} placeholder="250" />
          </div>
        </div>
      )}
      <Button type="submit" disabled={isSubmitting} className="h-auto w-full rounded-none bg-gold px-6 py-4 font-label text-xs uppercase tracking-[0.2em] text-earth-dark hover:bg-gold/90">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
        {isSubmitting ? "Sending…" : "Make me visible"}
      </Button>
      <p className="text-center font-body text-[11px] text-earth-dark-foreground/50">No upfront fee. No contract. Nothing to pay until 10 bookings.</p>
    </form>
  );
};

export default OperatorLeadForm;