import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface PropertyMapProps {
  lat: number;
  lng: number;
  name: string;
  city?: string | null;
  country?: string | null;
}

const PropertyMap = ({ lat, lng, name, city, country }: PropertyMapProps) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="border border-border overflow-hidden">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "320px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <strong>{name}</strong>
            {(city || country) && (
              <>
                <br />
                {[city, country].filter(Boolean).join(", ")}
              </>
            )}
          </Popup>
        </Marker>
      </MapContainer>
      <div className="bg-parchment-dark px-4 py-2 text-center">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label text-[10px] tracking-[0.2em] uppercase text-gold hover:opacity-80 transition-opacity"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
};

export default PropertyMap;
