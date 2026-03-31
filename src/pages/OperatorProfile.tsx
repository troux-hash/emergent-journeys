import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getOperatorBySlug } from "@/data/operators";
import BookDirectForm from "@/components/BookDirectForm";
import RevealSection from "@/components/RevealSection";
import { Sun, Users, Heart, Droplets, MapPin, Phone, Mail, Star, Clock, ArrowLeft } from "lucide-react";

const OperatorProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const operator = slug ? getOperatorBySlug(slug) : undefined;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: operator.name,
    description: operator.description,
    url: operator.website,
    image: [operator.heroImage, ...operator.images],
    address: {
      "@type": "PostalAddress",
      streetAddress: operator.location.address,
      addressLocality: operator.location.city,
      addressCountry: operator.location.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: operator.location.lat,
      longitude: operator.location.lng,
    },
    telephone: operator.phone,
    priceRange: operator.priceRange,
    starRating: {
      "@type": "Rating",
      ratingValue: operator.starRating,
    },
    checkinTime: operator.checkIn,
    checkoutTime: operator.checkOut,
    currenciesAccepted: operator.currenciesAccepted.join(", "),
    paymentAccepted: operator.paymentAccepted.join(", "),
    amenityFeature: operator.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    numberOfRooms: operator.rooms.length,
    ...(operator.socialLinks.instagram || operator.socialLinks.tripadvisor
      ? {
          sameAs: [operator.socialLinks.instagram, operator.socialLinks.tripadvisor].filter(
            Boolean
          ),
        }
      : {}),
  };

  const sustainabilitySignals = [
    operator.sustainability.solarPowered && {
      icon: Sun,
      label: "Solar Powered",
    },
    {
      icon: Users,
      label: `${operator.sustainability.localHirePercent}% Local Hires`,
    },
    {
      icon: Heart,
      label: `${operator.sustainability.communityPercent}% to Community`,
    },
    operator.sustainability.waterConservation && {
      icon: Droplets,
      label: "Water Conservation",
    },
  ].filter(Boolean) as { icon: typeof Sun; label: string }[];

  return (
    <>
      <Helmet>
        <title>{operator.name} — Fichua</title>
        <meta
          name="description"
          content={`Book ${operator.name} direct. ${operator.tagline}. ${operator.location.city}, ${operator.location.country}.`}
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
            <img
              src={operator.heroImage}
              alt={`${operator.name} — ${operator.location.city}, ${operator.location.country}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-dark/80 via-earth-dark/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20">
              <p className="font-label text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                {operator.location.city}, {operator.location.country}
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-medium text-primary-foreground mb-2">
                {operator.name}
              </h1>
              <p className="font-display text-lg md:text-xl italic text-gold/80">
                {operator.tagline}
              </p>
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
                  {operator.location.city}, {operator.location.country}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star size={14} className="text-gold" />
                <span className="font-label text-xs tracking-wider">
                  {operator.starRating} Star · {operator.yearsOperating} Years
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} className="text-gold" />
                <span className="font-label text-xs tracking-wider">
                  Check-in {operator.checkIn} · Out {operator.checkOut}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="text-gold" />
                <span className="font-label text-xs tracking-wider">{operator.phone}</span>
              </div>
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
          </div>

          {/* Gallery */}
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

          {/* Rooms */}
          <RevealSection className="mb-20">
            <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">Rooms</p>
            <div className="space-y-4">
              {operator.rooms.map((room) => (
                <div
                  key={room.name}
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 bg-parchment-dark border border-border gap-4"
                >
                  <div>
                    <h3 className="font-display text-xl font-medium text-foreground mb-1">
                      {room.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">{room.description}</p>
                    <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground mt-2">
                      Up to {room.maxGuests} guests · Contact for availability
                    </p>
                  </div>
                  <div className="text-left md:text-right shrink-0">
                    <p className="font-display text-2xl font-semibold text-foreground">
                      ${room.pricePerNight}
                    </p>
                    <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground">
                      per night
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>

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
                  rooms={operator.rooms}
                  operatorName={operator.name}
                  operatorSlug={operator.slug}
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
                <a
                  href={`mailto:${operator.email}`}
                  className="flex items-center gap-2 font-body text-sm text-foreground hover:text-gold transition-colors"
                >
                  <Mail size={14} />
                  {operator.email}
                </a>
                <a
                  href={`tel:${operator.phone}`}
                  className="flex items-center gap-2 font-body text-sm text-foreground hover:text-gold transition-colors"
                >
                  <Phone size={14} />
                  {operator.phone}
                </a>
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </>
  );
};

export default OperatorProfile;
