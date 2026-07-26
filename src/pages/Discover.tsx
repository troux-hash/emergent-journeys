import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin } from "lucide-react";

interface OperatorListItem {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  price_range: string | null;
  hero_image: string | null;
  is_verified: boolean | null;
}

const AFRICA_CENTER: [number, number] = [1.5, 20];

const Discover = () => {
  const [operators, setOperators] = useState<OperatorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("operators")
        .select("slug, name, tagline, city, country, lat, lng, price_range, hero_image, is_verified")
        .eq("status", "published")
        .order("name");
      setOperators((data as OperatorListItem[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const withCoords = operators.filter((o) => o.lat != null && o.lng != null);

  return (
    <>
      <Helmet>
        <title>Discover — Fichua</title>
        <meta name="description" content="Explore independent, Fichua-verified operators you can book direct." />
      </Helmet>
      <div className="grain-overlay bg-parchment min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-3">Discover</p>
          <h1 className="font-display text-3xl md:text-5xl font-medium text-foreground mb-10">
            Verified operators, ready to book direct.
          </h1>

          {loading ? (
            <p className="font-body text-sm text-muted-foreground">Loading...</p>
          ) : operators.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">
              Nothing published yet — check back soon.
            </p>
          ) : (
            <>
              {withCoords.length > 0 && (
                <div className="mb-12 border border-border overflow-hidden">
                  <MapContainer center={AFRICA_CENTER} zoom={4} scrollWheelZoom style={{ height: "420px", width: "100%" }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {withCoords.map((op) => (
                      <Marker key={op.slug} position={[op.lat as number, op.lng as number]}>
                        <Popup>
                          <strong>{op.name}</strong>
                          <br />
                          {[op.city, op.country].filter(Boolean).join(", ")}
                          <br />
                          <Link to={`/operators/${op.slug}`} className="text-gold underline">
                            View profile
                          </Link>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operators.map((op) => (
                  <Link
                    key={op.slug}
                    to={`/operators/${op.slug}`}
                    className="block border border-border bg-parchment-dark hover:shadow-md transition-shadow"
                  >
                    {op.hero_image && (
                      <img src={op.hero_image} alt={op.name} className="w-full h-40 object-cover" loading="lazy" />
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-display text-lg font-medium text-foreground">{op.name}</h3>
                        {op.is_verified && (
                          <Badge className="gap-1 shrink-0">
                            <ShieldCheck size={11} />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {(op.city || op.country) && (
                        <p className="flex items-center gap-1 font-label text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
                          <MapPin size={11} />
                          {[op.city, op.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {op.tagline && <p className="font-body text-sm text-muted-foreground">{op.tagline}</p>}
                      {op.price_range && (
                        <p className="font-label text-xs tracking-wider text-gold mt-2">{op.price_range}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Discover;
