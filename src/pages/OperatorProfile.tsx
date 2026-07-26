import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import BookDirectForm from "@/components/BookDirectForm";
import RevealSection from "@/components/RevealSection";
import { Sun, Users, Heart, Droplets, MapPin, Phone, Mail, Star, Clock, ArrowLeft, ShieldCheck } from "lucide-react";

interface OperatorRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_range: string | null;
  star_rating: number | null;
  years_operating: number | null;
  hero_image: string | null;
  images: string[];
  check_in: string | null;
  check_out: string | null;
  currencies_accepted: string[];
  payment_accepted: string[];
  solar_powered: boolean;
  local_hire_percent: number | null;
  community_percent: number | null;
  water_conservation: boolean;
  amenities: string[];
  instagram_url: string | null;
  tripadvisor_url: string | null;
  is_verified: boolean | null;
}

interface RoomTypeRow {
  id: string;
  name: string;
  description: string | null;
  price_per_night: number;
  currency: string;
  max_guests: number;
}

interface ReviewRow {
  id: string;
  source: string;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  review_date: string;
}

const VERIFICATION_CHECKLIST = [
  "Identity & ownership confirmed against ID / business registration",
  "Property photos cross-checked against its GPS location",
  "WhatsApp contact confirmed live with a real reply",
  "Payout account on file with the payment processor",
];

const OperatorProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [operator, setOperator] = useState<OperatorRow | null>(null);
  const [rooms, setRooms] = useState<RoomTypeRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      const { data: op } = await supabase
        .from("operators")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!active) return;

      if (op) {
        setOperator(op as OperatorRow);
        const [{ data: roomData }, { data: reviewData }] = await Promise.all([
          supabase
            .from("room_types")
            .select("id, name, description, price_per_night, currency, max_guests")
            .eq("operator_id", op.id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("reviews")
            .select("id, source, reviewer_name, rating, review_text, review_date")
            .eq("operator_id", op.id)
            .order("review_date", { ascending: false }),
        ]);
        if (active) {
          setRooms((roomData as RoomTypeRow[]) || []);
          setReviews((reviewData as ReviewRow[]) || []);
        }
      }
      if (active) setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <p className="font-body text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Lodge not found</h1>
          <p className="font-body text-muted-foreground mb-8">
            The operator you're looking for doesn't exist yet.
          </p>
          <Link
            to="/"
            className="font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-6 py-3"
          >
            Back to Fichua
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: operator.name,
    description: operator.description,
    url: operator.website,
    image: [operator.hero_image, ...(operator.images || [])].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: operator.address,
      addressLocality: operator.city,
      addressCountry: operator.country,
    },
    ...(operator.lat && operator.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: operator.lat,
            longitude: operator.lng,
          },
        }
      : {}),
    telephone: operator.phone,
    priceRange: operator.price_range,
    ...(operator.star_rating
      ? { starRating: { "@type": "Rating", ratingValue: operator.star_rating } }
      : {}),
    checkinTime: operator.check_in,
    checkoutTime: operator.check_out,
    currenciesAccepted: (operator.currencies_accepted || []).join(", "),
    paymentAccepted: (operator.payment_accepted || []).join(", "),
    amenityFeature: (operator.amenities || []).map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    numberOfRooms: rooms.length,
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
    ...(operator.instagram_url || operator.tripadvisor_url
      ? { sameAs: [operator.instagram_url, operator.tripadvisor_url].filter(Boolean) }
      : {}),
  };

  const sustainabilitySignals = [
    operator.solar_powered && { icon: Sun, label: "Solar Powered" },
    operator.local_hire_percent != null && {
      icon: Users,
      label: `${operator.local_hire_percent}% Local Hires`,
    },
    operator.community_percent != null && {
      icon: Heart,
      label: `${operator.community_percent}% to Community`,
    },
    operator.water_conservation && { icon: Droplets, label: "Water Conservation" },
  ].filter(Boolean) as { icon: typeof Sun; label: string }[];

  const roomsForForm = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || "",
    pricePerNight: r.price_per_night,
    currency: r.currency,
    maxGuests: r.max_guests,
  }));

  return (
    <>
      <Helmet>
        <title>{operator.name} — Fichua</title>
        <meta
          name="description"
          content={`Book ${operator.name} direct. ${operator.tagline || ""} ${operator.city || ""}, ${operator.country || ""}.`}
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="grain-overlay bg-parchment">
        {/* Back nav */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-parchment/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-foreground"
            >
              <ArrowLeft size={18} />
              fichua
            </Link>
            <a
              href="#book"
              className="font-label text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-5 py-2 hover:opacity-90 transition-opacity"
            >
              Book Direct
            </a>
          </div>
        </div>

        {/* Hero */}
        <section className="relative pt-16">
          <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
            {operator.hero_image && (
              <img
                src={operator.hero_image}
                alt={`${operator.name} — ${operator.city}, ${operator.country}`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-earth-dark/80 via-earth-dark/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                {operator.city}, {operator.country}
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-display text-4xl md:text-6xl font-medium text-primary-foreground">
                  {operator.name}
                </h1>
                {operator.is_verified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="gap-1 cursor-help">
                        <ShieldCheck size={12} />
                        Fichua Verified
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">What this means:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {VERIFICATION_CHECKLIST.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {operator.tagline && (
                <p className="font-display text-lg md:text-xl italic text-gold/80">
                  {operator.tagline}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Trust signals bar */}
        <RevealSection>
          <div className="bg-parchment-dark border-b border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-wrap gap-6 md:gap-10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} className="text-gold" />
                <span className="font-label text-xs tracking-wider">
                  {operator.city}, {operator.country}
                </span>
              </div>
              {operator.star_rating != null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star size={14} className="text-gold" />
                  <span className="font-label text-xs tracking-wider">
                    {operator.star_rating} Star
                    {operator.years_operating ? ` · ${operator.years_operating} Years` : ""}
                  </span>
                </div>
              )}
              {(operator.check_in || operator.check_out) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} className="text-gold" />
                  <span className="font-label text-xs tracking-wider">
                    Check-in {operator.check_in} · Out {operator.check_out}
                  </span>
                </div>
              )}
              {operator.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} className="text-gold" />
                  <span className="font-label text-xs tracking-wider">{operator.phone}</span>
                </div>
              )}
            </div>
          </div>
        </RevealSection>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
          {/* Description + Sustainability */}
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <RevealSection className="md:col-span-2">
              <p className="font-body text-base md:text-lg text-foreground leading-relaxed">
                {operator.description}
              </p>
            </RevealSection>
            {sustainabilitySignals.length > 0 && (
              <RevealSection delay={0.15}>
                <div className="space-y-4">
                  <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                    Sustainability
                  </p>
                  {sustainabilitySignals.map((signal) => (
                    <div key={signal.label} className="flex items-center gap-3">
                      <signal.icon size={16} className="text-gold" />
                      <span className="font-body text-sm text-foreground">{signal.label}</span>
                    </div>
                  ))}
                </div>
              </RevealSection>
            )}
          </div>

          {/* Gallery */}
          {operator.images.length > 0 && (
            <RevealSection className="mb-20">
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {operator.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${operator.name} — photo ${i + 1}`}
                    className="w-full h-48 md:h-64 object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            </RevealSection>
          )}

          {/* Rooms */}
          {rooms.length > 0 && (
            <RevealSection className="mb-20">
              <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Rooms</p>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 bg-parchment-dark border border-border gap-4"
                  >
                    <div>
                      <h3 className="font-display text-xl font-medium text-foreground mb-1">
                        {room.name}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">{room.description}</p>
                      <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground mt-2">
                        Up to {room.max_guests} guests · Contact for availability
                      </p>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <p className="font-display text-2xl font-semibold text-foreground">
                        {room.currency}{room.price_per_night}
                      </p>
                      <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground">
                        per night
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (() => {
            const verified = reviews.filter((r) => r.source === "fichua_verified");
            const imported = reviews.filter((r) => r.source !== "fichua_verified");
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            return (
              <RevealSection className="mb-20">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-label text-xs tracking-[0.3em] uppercase text-gold">Reviews</p>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="font-display text-3xl font-semibold text-foreground">{avg.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={14} className={n <= Math.round(avg) ? "text-gold fill-gold" : "text-muted-foreground"} />
                      ))}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                      {verified.length > 0 && ` · ${verified.length} Verified Fichua ${verified.length !== 1 ? "Stays" : "Stay"}`}
                      {imported.length > 0 && ` · ${imported.length} from other platforms`}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.slice(0, 6).map((r) => (
                    <div key={r.id} className="border border-border p-5 bg-parchment-dark">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground">{r.reviewer_name}</span>
                        {r.source === "fichua_verified" ? (
                          <span className="font-label text-[9px] tracking-wider uppercase text-gold border border-gold/40 px-2 py-0.5 rounded-full">
                            Verified Stay
                          </span>
                        ) : (
                          <span className="font-label text-[9px] tracking-wider uppercase text-muted-foreground">
                            via {r.source.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={11} className={n <= r.rating ? "text-gold fill-gold" : "text-muted-foreground"} />
                        ))}
                      </div>
                      {r.review_text && <p className="font-body text-sm text-muted-foreground">{r.review_text}</p>}
                    </div>
                  ))}
                </div>
              </RevealSection>
            );
          })()}

          {/* Book Direct Form */}
          <section id="book">
            <RevealSection>
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                  <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-3">
                    Book Direct
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-3">
                    Stay at {operator.name}
                  </h2>
                  <p className="font-body text-muted-foreground">
                    No middleman. No markup. Your booking goes straight to the lodge.
                  </p>
                </div>
                <BookDirectForm
                  rooms={roomsForForm}
                  operatorName={operator.name}
                  operatorId={operator.id}
                />
              </div>
            </RevealSection>
          </section>

          {/* Contact footer */}
          <RevealSection className="mt-20">
            <div className="text-center border-t border-border pt-12">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Questions?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {operator.email && (
                  <a
                    href={`mailto:${operator.email}`}
                    className="flex items-center gap-2 font-body text-sm text-foreground hover:text-gold transition-colors"
                  >
                    <Mail size={14} />
                    {operator.email}
                  </a>
                )}
                {operator.phone && (
                  <a
                    href={`tel:${operator.phone}`}
                    className="flex items-center gap-2 font-body text-sm text-foreground hover:text-gold transition-colors"
                  >
                    <Phone size={14} />
                    {operator.phone}
                  </a>
                )}
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </>
  );
};

export default OperatorProfile;
