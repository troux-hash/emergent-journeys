import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Fichua</title>
        <meta name="description" content="Fichua's privacy policy. How we collect, use, and protect your data." />
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
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">Privacy Policy</h1>
          <p className="font-body text-sm text-muted-foreground mb-12">Last updated: March 31, 2026</p>

          <div className="prose-fichua space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">1. Who we are</h2>
              <p>Fichua ("we", "us", "our") is a platform that connects independent tourism operators with travelers and travel agencies worldwide. This policy explains how we handle your personal data.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">2. Information we collect</h2>
              <p className="mb-2">We collect information you provide directly:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, email address, and phone number when you create an account or submit a booking enquiry.</li>
                <li>Property details, photos, and pricing if you register as an operator.</li>
                <li>Payment information processed securely through our payment partners — we do not store card details on our servers.</li>
                <li>Messages exchanged through the platform or with your Fichua Buddy via WhatsApp.</li>
              </ul>
              <p className="mt-3">We also collect limited technical data automatically, including device type, browser, IP address, and pages visited, to improve our service.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">3. How we use your data</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To operate the platform and process bookings.</li>
                <li>To connect operators with travelers and travel agencies.</li>
                <li>To communicate with you about your account, bookings, or support requests.</li>
                <li>To improve our services and develop new features.</li>
                <li>To comply with legal obligations.</li>
              </ul>
              <p className="mt-3">We do not sell your personal data. We do not share it with third parties for their marketing purposes.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">4. Data security</h2>
              <p>We use industry-standard encryption (TLS) for data in transit and at rest. Payment processing is handled by PCI-DSS compliant partners. Access to personal data is restricted to authorised personnel only.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">5. Data retention</h2>
              <p>We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time by contacting us.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">6. Your rights</h2>
              <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. To exercise any of these rights, contact us at <a href="mailto:teddy225@mit.edu" className="text-gold hover:underline">teddy225@mit.edu</a>.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">7. Cookies</h2>
              <p>We use essential cookies to keep the platform working. We use analytics cookies to understand how people use the site. You can disable non-essential cookies in your browser settings.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">8. Changes to this policy</h2>
              <p>We may update this policy from time to time. We will notify you of significant changes via email or a notice on the platform.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-medium text-foreground mb-3">9. Contact</h2>
              <p>Questions about this policy? Reach us at <a href="mailto:teddy225@mit.edu" className="text-gold hover:underline">teddy225@mit.edu</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
