import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

const GuestPrivacy = () => {
  return (
    <>
      <Helmet>
        <title>Guest Privacy — How Fichua Handles Your Booking Details</title>
        <meta
          name="description"
          content="What booking details Fichua collects from guests, how lodges may use them, how marketing consent works, and how to request access or deletion of your data."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-parchment">
        <div className="fixed top-0 left-0 right-0 z-50 bg-parchment/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center h-16">
            <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-foreground">
              <ArrowLeft size={18} />
              fichua
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-28 pb-20">
          <p className="font-label text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">For guests</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">Guest Privacy</h1>
          <p className="font-body text-sm text-muted-foreground mb-12">Last updated: October 7, 2026</p>

          <div className="prose-fichua space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">1. Who this page is for</h2>
              <p>
                This page explains what happens to your personal details when you enquire about a stay or book through Fichua.
                It sits alongside our <Link to="/privacy" className="text-gold hover:underline">general privacy policy</Link>, which covers everything else.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">2. Booking details Fichua collects</h2>
              <p className="mb-2">When you send an enquiry or make a booking, we collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your name, email address, and WhatsApp number.</li>
                <li>Your stay details: dates, number of guests, room or cottage selected, and any special requests you include.</li>
                <li>The messages you exchange through our chat widget or WhatsApp, including with our AI assistant, kept so conversations stay continuous.</li>
                <li>Reviews you leave, tied to a booking reference for verified stays.</li>
              </ul>
              <p className="mt-3">
                Fichua does not ask for, process, or store your card details. Payment is arranged directly between you and the lodge.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">3. How lodges may use your details</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To confirm your booking and communicate with you before your stay.</li>
                <li>To prepare for your arrival: room setup, transfers, meals, and special requests.</li>
                <li>To contact you during or after your stay about that specific booking.</li>
              </ul>
              <p className="mt-3">
                A lodge may not use your contact details for its own marketing unless you separately agree to it. Lodges are
                responsible for keeping the guest details they receive safe, and Fichua audits how operator accounts access them.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">4. How marketing consent works</h2>
              <p className="mb-2">
                Fichua only emails you about offers, destinations, or partner lodges if you have opted in. Consent is a clear,
                separate choice — it is never bundled into a booking confirmation.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Every marketing email carries an unsubscribe link. One click removes you from the list.</li>
                <li>You can also opt out any time at our <Link to="/unsubscribe" className="text-gold hover:underline">unsubscribe page</Link>.</li>
                <li>Booking-related messages (confirmations, reminders, review requests) are not marketing, but you can still ask us to stop them.</li>
              </ul>
              <p className="mt-3">We do not sell your personal data or share it with third parties for their marketing.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">5. Requesting access or deletion</h2>
              <p className="mb-2">
                You can ask us at any time to show you the personal details we hold about you, correct them, or delete them.
                Email <a href="mailto:tr@fichua.co" className="text-gold hover:underline">tr@fichua.co</a> with your request — include the
                email address or booking reference you used so we can find your records.
              </p>
              <p className="mb-2">What happens next:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We confirm your identity and respond within 30 days.</li>
                <li>On a deletion request, we remove your personal details and ask the lodge to do the same, except where we must keep records for accounting or legal reasons.</li>
                <li>Deleting your data does not affect a completed stay or any payment already made.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">6. Rwanda pilot</h2>
              <p>
                Our pilot operates in Rwanda, and we process personal data in line with Law N°058/2021 of 13/10/2021 relating to the
                protection of personal data and privacy, in addition to the commitments in this page and our privacy policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">7. Contact</h2>
              <p>
                Questions about your booking details? Reach us at <a href="mailto:tr@fichua.co" className="text-gold hover:underline">tr@fichua.co</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestPrivacy;
