import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export interface BookableRoom {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
}

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  whatsapp: z.string().trim().min(1, "WhatsApp number is required").max(20),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  roomId: z.string().min(1, "Please select a room"),
  guests: z.coerce.number().min(1).max(20),
  specialRequests: z.string().max(1000).optional(),
});

type BookingData = z.infer<typeof bookingSchema>;

const BookDirectForm = ({
  rooms,
  operatorName,
  operatorId,
}: {
  rooms: BookableRoom[];
  operatorName: string;
  operatorId: string;
}) => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const raw = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
      roomId: formData.get("roomId") as string,
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

    if (new Date(result.data.checkOut) <= new Date(result.data.checkIn)) {
      setErrors({ checkOut: "Check-out must be after check-in" });
      return;
    }

    const room = rooms.find((r) => r.id === result.data.roomId);
    if (!room) {
      toast.error("Please select a valid room");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const nights = Math.round(
      (new Date(result.data.checkOut).getTime() - new Date(result.data.checkIn).getTime()) / 86400000
    );

    const { error } = await supabase.from("bookings").insert({
      operator_id: operatorId,
      room_type_id: room.id,
      guest_name: result.data.name,
      guest_email: result.data.email,
      guest_whatsapp: result.data.whatsapp,
      guests: result.data.guests,
      special_requests: result.data.specialRequests || null,
      check_in: result.data.checkIn,
      check_out: result.data.checkOut,
      price_per_night_snapshot: room.pricePerNight,
      currency_snapshot: room.currency,
      total_price: room.pricePerNight * nights,
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "",
      utm_campaign: searchParams.get("utm_campaign") || "",
    });

    setIsSubmitting(false);

    if (error) {
      // 23P01 = Postgres exclusion_violation — someone else already has
      // this room booked for an overlapping date range.
      if (error.code === "23P01") {
        toast.error("Those dates just got booked", {
          description: "Please try different dates for this room.",
        });
      } else {
        toast.error("Failed to send booking request", { description: error.message });
      }
      return;
    }

    setSubmitted(true);
    toast.success("Booking request sent!", {
      description: `${operatorName} will confirm your stay via WhatsApp within 24 hours.`,
    });
    (e.target as HTMLFormElement).reset();
  };

  const inputClass =
    "w-full bg-parchment border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors";

  if (submitted) {
    return (
      <div className="text-center py-10 border border-border bg-parchment-dark">
        <p className="font-display text-xl text-foreground mb-2">Request sent!</p>
        <p className="font-body text-sm text-muted-foreground">
          {operatorName} will confirm your stay via WhatsApp within 24 hours.
        </p>
      </div>
    );
  }

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
        <input name="whatsapp" type="tel" placeholder="+250 700 000 000" className={inputClass} />
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
          <select name="roomId" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a room
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — {room.currency}{room.pricePerNight}/night
              </option>
            ))}
          </select>
          {errors.roomId && <p className="text-destructive text-xs mt-1">{errors.roomId}</p>}
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
        disabled={isSubmitting || rooms.length === 0}
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
