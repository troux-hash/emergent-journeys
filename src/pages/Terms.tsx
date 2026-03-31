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
              <p>Fichua provides a platform connecting independent accommodation operators in Africa with travelers and travel agencies. We facilitate discovery, communication, and booking — but we are not a party to the accommodation contract between operator and guest.</p>
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
              <p>Payments are processed securely through our payment partners. Fichua facilitates the transaction but funds are directed to the operator. Fichua may charge a service fee, which will be clearly disclosed before any transaction is completed.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">7. Cancellations and refunds</h2>
              <p>Cancellation policies are set by individual operators and displayed on their profile. Refund eligibility is determined by the operator's stated policy at the time of booking. Fichua will assist in resolving disputes but is not liable for refunds.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">8. Intellectual property</h2>
              <p>All content, design, and code on the Fichua platform is owned by Fichua or its licensors. Operators retain ownership of their property photos and descriptions but grant Fichua a licence to display them on the platform.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">9. Limitation of liability</h2>
              <p>Fichua is a platform, not an accommodation provider. We are not liable for the quality, safety, or legality of listed properties, the accuracy of listings, or the ability of operators to provide accommodation. Our liability is limited to the fees paid to Fichua for the Service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">10. Termination</h2>
              <p>We may suspend or terminate your access to the Service at our discretion if you violate these terms. You may close your account at any time by contacting us.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">11. Changes to these terms</h2>
              <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">12. Contact</h2>
              <p>Questions about these terms? Reach us at <a href="mailto:teddy225@mit.edu" className="text-gold hover:underline">teddy225@mit.edu</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
