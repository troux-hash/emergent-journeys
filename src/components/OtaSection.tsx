import { Check, X } from "lucide-react";
import RevealSection from "./RevealSection";
import bookingLogo from "@/assets/ota/booking.svg";
import expediaLogo from "@/assets/ota/expedia.svg";
import tripLogo from "@/assets/ota/trip.svg";
import makemytripLogo from "@/assets/ota/makemytrip.svg";

type OtaRow = {
  name: string;
  logo?: string;
  tag?: string;
  commission: string;
  guestAccess: string;
  direct: boolean;
  steps: string[];
  highlight?: boolean;
};

const otaRows: OtaRow[] = [
  {
    name: "Booking.com",
    logo: bookingLogo,
    commission: "15% base — 17–22% in practice",
    guestAccess: "Platform controlled",
    direct: false,
    steps: [
      "Sign up free at the Partner Hub",
      "Submit your property and sign the agreement — this is where your rate is set",
      "Load rooms, rates, photos and policies into the Extranet",
    ],
  },
  {
    name: "Expedia",
    logo: expediaLogo,
    commission: "15–25% (typically 18–20%)",
    guestAccess: "Platform controlled",
    direct: false,
    steps: [
      "Sign up free via Partner Central",
      "Add your property profile, room types, rates and cancellation policy",
      "Choose your payment model and sign the contract",
    ],
  },
  {
    name: "Trip.com (China)",
    logo: tripLogo,
    commission: "15–25% (set in your contract)",
    guestAccess: "Platform controlled",
    direct: false,
    steps: [
      "Register free at the Trip.com partner hub",
      "Submit your property registration and sign the agreement",
      "Load rates and inventory, then pass verification before going live",
    ],
  },
  {
    name: "MakeMyTrip (India)",
    logo: makemytripLogo,
    commission: "15–20% (set in your contract)",
    guestAccess: "Platform controlled",
    direct: false,
    steps: [
      "Register free at the MakeMyTrip partner portal",
      "Submit your property with photos and amenities, then sign the agreement",
      "Load rates and inventory before going live",
    ],
  },
  {
    name: "Fichua",
    tag: "Direct",
    commission: "7% on direct bookings",
    guestAccess: "Yours",
    direct: true,
    highlight: true,
    steps: [
      "Send the form on this page: your rooms, your prices, your WhatsApp",
      "We verify you and publish your booking page for travellers, Google and AI assistants",
      "Guests book with you directly and their details come to you",
    ],
  },
];

const Brand = ({ row }: { row: OtaRow }) => (
  <span className="flex items-center gap-3">
    <span className="flex h-9 w-20 shrink-0 items-center justify-center rounded-sm bg-parchment p-1.5">
      {row.logo ? (
        <img src={row.logo} alt={`${row.name} logo`} className="h-full w-full object-contain" loading="lazy" />
      ) : (
        <span className="font-display text-lg font-semibold leading-none text-foreground">
          Fichua<span className="text-gold">.</span>
        </span>
      )}
    </span>
    {row.logo ? (
      <span className="font-body text-sm font-medium text-foreground">
        {row.name}
        {row.tag && <span className="ml-2 font-label text-[10px] uppercase tracking-[0.15em] text-gold">{row.tag}</span>}
      </span>
    ) : (
      row.tag && <span className="font-label text-[10px] uppercase tracking-[0.15em] text-gold">{row.tag}</span>
    )}
  </span>
);

const AccessMark = ({ row }: { row: OtaRow }) => (
  <span className="inline-flex items-center gap-2">
    {row.direct ? (
      <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
    ) : (
      <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    )}
    {row.guestAccess}
  </span>
);

const Steps = ({ row, className }: { row: OtaRow; className: string }) => (
  <ul className={`list-disc space-y-1.5 pl-4 ${className}`}>
    {row.steps.map((step) => (
      <li key={step}>{step}</li>
    ))}
  </ul>
);

const OtaSection = () => (
  <section id="ota-comparison" className="bg-parchment-dark px-6 py-16 md:px-12 md:py-24 lg:px-20">
    <div className="mx-auto max-w-5xl">
      <RevealSection>
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-gold">The alternatives</p>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">The biggest platforms lodge owners list on, side by side with Fichua.</h2>
          <p className="mt-5 font-body text-muted-foreground">All of them are free to join and take commission on completed bookings. Indicative rates for a small Rwanda property in 2026 — your exact rate is set in each platform's own agreement, and paid visibility programmes can add more.</p>
        </div>
      </RevealSection>
      <RevealSection delay={0.1}>
        <div className="space-y-4 md:hidden">
          {otaRows.map((row) => (
            <div key={row.name} className={`border p-5 ${row.highlight ? "border-gold/60 bg-parchment" : "border-border bg-parchment"}`}>
              <Brand row={row} />
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.15em] text-gold">Commission</dt>
                  <dd className="mt-1 font-display text-lg text-foreground">{row.commission}</dd>
                </div>
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.15em] text-gold">Direct guest access</dt>
                  <dd className="mt-1 font-body text-sm text-muted-foreground">
                    <AccessMark row={row} />
                  </dd>
                </div>
                <div>
                  <dt className="font-label text-xs uppercase tracking-[0.15em] text-gold">How to register</dt>
                  <dd className="mt-1">
                    <Steps row={row} className="font-body text-sm text-muted-foreground" />
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto border border-border md:block">
          <table className="w-full min-w-[760px] border-collapse text-left">
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
                <tr key={row.name} className={row.highlight ? "bg-parchment" : index % 2 ? "bg-parchment" : "bg-parchment-dark"}>
                  <th className={`border-t p-5 ${row.highlight ? "border-gold/60" : "border-border"}`}>
                    <Brand row={row} />
                  </th>
                  <td className={`border-t p-5 font-display text-lg text-foreground ${row.highlight ? "border-gold/60" : "border-border"}`}>{row.commission}</td>
                  <td className={`border-t p-5 font-body text-sm text-muted-foreground ${row.highlight ? "border-gold/60" : "border-border"}`}>
                    <AccessMark row={row} />
                  </td>
                  <td className={`border-t p-5 ${row.highlight ? "border-gold/60" : "border-border"}`}>
                    <Steps row={row} className="font-body text-sm text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RevealSection>
      <RevealSection delay={0.15}>
        <div className="mt-8 space-y-4 border-l-2 border-gold/60 pl-5">
          <p className="font-body text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Direct guest access</span> means the booking reaches you with the
            guest's name, email and WhatsApp, so you can confirm them, thank them and invite them back for their next stay.
            On the platforms above, the guest belongs to the platform: enquiries and messages run through them, and the
            contact details are not shared with you — so the next booking starts at zero again.
          </p>
          <p className="font-body text-sm leading-relaxed text-muted-foreground">
            Every commission above is money a platform keeps from you. Fichua's 7% on direct bookings is less than half of
            all of them — and the guest relationship stays yours.
          </p>
        </div>
      </RevealSection>
    </div>
  </section>
);

export default OtaSection;
