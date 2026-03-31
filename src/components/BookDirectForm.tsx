import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import type { Room } from "@/data/operators";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  whatsapp: z.string().trim().min(1, "WhatsApp number is required").max(20),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  roomType: z.string().min(1, "Please select a room"),
  guests: z.coerce.number().min(1).max(20),
  specialRequests: z.string().max(1000).optional(),
});

type BookingData = z.infer<typeof bookingSchema>;

const BookDirectForm = ({
  rooms,
  operatorName,
  operatorSlug,
}: {
  rooms: Room[];
  operatorName: string;
  operatorSlug: string;
}) => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const raw = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
      roomType: formData.get("roomType") as string,
      guests: formData.get("guests") as string,
      specialRequests: (formData.get("specialRequests") as string) || "",
    };

    const result = bookingSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookingData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof BookingData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Capture UTM parameters
    const utmData = {
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "",
      utm_campaign: searchParams.get("utm_campaign") || "",
    };

    // Log booking data (in production this goes to Airtable/Sheets)
    console.log("Booking submission:", {
      ...result.data,
      operator: operatorSlug,
      ...utmData,
      timestamp: new Date().toISOString(),
    });

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Booking request sent!", {
        description: `${operatorName} will confirm your stay via WhatsApp within 24 hours.`,
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  const inputClass =
    "w-full bg-parchment border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
            Full Name
          </label>
          <input name="name" type="text" placeholder="Your name" className={inputClass} />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
            Email
          </label>
          <input name="email" type="email" placeholder="you@email.com" className={inputClass} />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
          WhatsApp Number
        </label>
        <input name="whatsapp" type="tel" placeholder="+221 77 123 4567" className={inputClass} />
        {errors.whatsapp && <p className="text-destructive text-xs mt-1">{errors.whatsapp}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
            Check-in
          </label>
          <input name="checkIn" type="date" className={inputClass} />
          {errors.checkIn && <p className="text-destructive text-xs mt-1">{errors.checkIn}</p>}
        </div>
        <div>
          <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
            Check-out
          </label>
          <input name="checkOut" type="date" className={inputClass} />
          {errors.checkOut && <p className="text-destructive text-xs mt-1">{errors.checkOut}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
            Room Type
          </label>
          <select name="roomType" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a room
            </option>
            {rooms.map((room) => (
              <option key={room.name} value={room.name}>
                {room.name} — ${room.pricePerNight}/night
              </option>
            ))}
          </select>
          {errors.roomType && <p className="text-destructive text-xs mt-1">{errors.roomType}</p>}
        </div>
        <div>
          <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
            Guests
          </label>
          <input name="guests" type="number" min={1} max={20} defaultValue={2} className={inputClass} />
          {errors.guests && <p className="text-destructive text-xs mt-1">{errors.guests}</p>}
        </div>
      </div>

      <div>
        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 block">
          Special Requests
        </label>
        <textarea
          name="specialRequests"
          rows={3}
          placeholder="Dietary needs, airport transfer, celebrations..."
          className={inputClass + " resize-none"}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-label text-sm tracking-[0.2em] uppercase bg-gold text-earth-dark py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Book Direct"}
      </button>

      <p className="text-center font-body text-xs text-muted-foreground">
        No payment required now. {operatorName} will confirm availability via WhatsApp.
      </p>
    </form>
  );
};

export default BookDirectForm;
