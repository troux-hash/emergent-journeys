import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service — Fichua</title>
        <meta name="description" content="Fichua's terms of service. The rules that govern your use of our platform." />
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
          <p className="font-label text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Legal</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">Terms of Service</h1>
          <p className="font-body text-sm text-muted-foreground mb-12">Last updated: March 31, 2026</p>

          <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">1. Agreement</h2>
              <p>By accessing or using the Fichua platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">2. The Service</h2>
              <p>Fichua provides a platform connecting independent tourism operators with travelers and travel agencies worldwide. We facilitate discovery, direct communication, and booking — but we are not a party to the accommodation contract between operator and guest.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">3. Accounts</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You must be at least 18 years old to use the Service.</li>
                <li>One person or entity may not maintain more than one account.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">4. Operator responsibilities</h2>
              <p>If you list a property on Fichua, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide accurate descriptions, photos, pricing, and availability.</li>
                <li>Honour confirmed bookings made through the platform.</li>
                <li>Respond to booking enquiries promptly and professionally.</li>
                <li>Comply with all applicable local laws, regulations, and licensing requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">5. Traveler responsibilities</h2>
              <p>If you make a booking through Fichua, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide accurate personal and payment information.</li>
                <li>Honour the cancellation policy of the operator.</li>
                <li>Treat the property and its staff with respect.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">6. Payments</h2>
              <p>Payments are processed through a licensed third-party payment processor. Fichua holds your payment as an intermediary and releases it to the operator according to a disclosed release policy — funds are not released blind or automatically upon payment. Fichua may charge a service fee (commission), disclosed before any transaction is completed. Fichua does not directly handle or store your card details; these are processed exclusively by our payment processor.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">7. Cancellations and refunds</h2>
              <p>Cancellation policies are set by individual operators and displayed on their profile. Refund eligibility is determined by the operator's stated policy at the time of booking. Where a refund is due, Fichua processes it through the payment processor, since Fichua holds the funds. Fichua does not guarantee refunds beyond what the operator's stated policy allows, but will assist in resolving disputes raised through our support channel.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">8. Reporting a problem</h2>
              <p>If something goes wrong with a booking, either the traveler or the operator can report it directly to Fichua at <Link to="/report" className="text-gold hover:underline">fichua.co/report</Link>, independent of any conversation between the two parties. We review every report and follow up directly with the person who filed it.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">9. Intellectual property</h2>
              <p>All content, design, and code on the Fichua platform is owned by Fichua or its licensors. Operators retain ownership of their property photos and descriptions but grant Fichua a licence to display them on the platform.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">10. Limitation of liability</h2>
              <p>Fichua is a platform, not an accommodation provider. We are not liable for the quality, safety, or legality of listed properties, the accuracy of listings, or the ability of operators to provide accommodation. Our liability is limited to the fees paid to Fichua for the Service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">11. Termination</h2>
              <p>We may suspend or terminate your access to the Service at our discretion if you violate these terms. You may close your account at any time by contacting us.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">12. Changes to these terms</h2>
              <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">13. Contact</h2>
              <p>Questions about these terms? Reach us at <a href="mailto:teddy225@mit.edu" className="text-gold hover:underline">teddy225@mit.edu</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
