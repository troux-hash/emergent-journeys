import { X } from "lucide-react";
import RevealSection from "./RevealSection";
import bookingLogo from "@/assets/ota/booking.svg";
import expediaLogo from "@/assets/ota/expedia.svg";
import tripLogo from "@/assets/ota/trip.svg";
import makemytripLogo from "@/assets/ota/makemytrip.svg";

const otaRows = [
  {
    name: "Booking.com",
    logo: bookingLogo,
    commission: "15% base — 17–22% in practice",
    guestAccess: "Platform controlled",
    process: "Free signup at the Partner Hub: submit your property, sign the agreement (this is where your rate is set), then load rooms, rates, photos and policies into the Extranet.",
  },
  {
    name: "Expedia",
    logo: expediaLogo,
    commission: "15–25% (typically 18–20%)",
    guestAccess: "Platform controlled",
    process: "Free signup via Partner Central: property profile, room types, rates and cancellation policy, then choose your payment model and sign the contract.",
  },
  {
    name: "Trip.com (China)",
    logo: tripLogo,
    commission: "15–25% (set in your contract)",
    guestAccess: "Platform controlled",
    process: "Register free at the Trip.com partner hub: property registration and agreement, load rates and inventory, then verification before going live.",
  },
  {
    name: "MakeMyTrip (India)",
    logo: makemytripLogo,
    commission: "15–20% (set in your contract)",
    guestAccess: "Platform controlled",
    process: "Register free at the MakeMyTrip partner portal: submit your property with photos and amenities, sign the agreement, then load rates and inventory before going live.",
  },
];

const OtaSection = () => (
  <section id="ota-comparison" className="bg-parchment-dark px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-5xl">
      <RevealSection>
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">The alternatives</p>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">The biggest platforms lodge owners list on.</h2>
          <p className="mt-5 font-body text-muted-foreground">All of them are free to join and take commission on completed bookings. Indicative rates for a small Rwanda property in 2026 — your exact rate is set in each platform's own agreement, and paid visibility programmes can add more.</p>
        </div>
      </RevealSection>
      <RevealSection delay={0.1}>
        <div className="space-y-4 md:hidden">
          {otaRows.map((row) => (
            <div key={row.name} className="border border-border bg-parchment p-5">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-20 shrink-0 items-center justify-center rounded-sm bg-parchment-dark p-1.5">
                  <img src={row.logo} alt={`${row.name} logo`} className="h-full w-full object-contain" loading="lazy" />
                </span>
                <span className="font-body text-sm font-medium text-foreground">{row.name}</span>
              </span>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.15em] text-gold">Indicative commission</dt>
                  <dd className="mt-1 font-display text-lg text-foreground">{row.commission}</dd>
                </div>
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.15em] text-gold">Direct guest access</dt>
                  <dd className="mt-1 inline-flex items-center gap-2 font-body text-sm text-muted-foreground">
                    <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {row.guestAccess}
                  </dd>
                </div>
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.15em] text-gold">How to register</dt>
                  <dd className="mt-1 font-body text-sm text-muted-foreground">{row.process}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto border border-border md:block">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-earth-dark text-earth-light">
              <tr>
                <th className="p-5 font-label text-xs uppercase tracking-[0.15em]">Platform</th>
                <th className="p-5 font-label text-xs uppercase tracking-[0.15em] text-gold">Indicative commission</th>
                <th className="p-5 font-label text-xs uppercase tracking-[0.15em]">Direct guest access</th>
                <th className="p-5 font-label text-xs uppercase tracking-[0.15em]">How to register</th>
              </tr>
            </thead>
            <tbody>
              {otaRows.map((row, index) => (
                <tr key={row.name} className={index % 2 ? "bg-parchment" : "bg-parchment-dark"}>
                  <th className="border-t border-border p-5">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-20 shrink-0 items-center justify-center rounded-sm bg-parchment p-1.5">
                        <img src={row.logo} alt={`${row.name} logo`} className="h-full w-full object-contain" loading="lazy" />
                      </span>
                      <span className="font-body text-sm font-medium text-foreground">{row.name}</span>
                    </span>
                  </th>
                  <td className="border-t border-border p-5 font-display text-lg text-foreground">{row.commission}</td>
                  <td className="border-t border-border p-5 font-body text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {row.guestAccess}
                    </span>
                  </td>
                  <td className="border-t border-border p-5 font-body text-sm text-muted-foreground">{row.process}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RevealSection>
      <RevealSection delay={0.15}>
        <p className="mt-8 font-body text-sm text-muted-foreground">
          Fichua's 7% on direct bookings is less than half of every rate on this table — and the guest relationship stays yours.
        </p>
      </RevealSection>
    </div>
  </section>
);

export default OtaSection;
