# Shorter, Clearer Homepage for Lodges (Survey Feedback)

The page still speaks only to lodges. Colours stay the same. Only facts are shown: no made-up lodges or quotes.

## New homepage order (about half the current length)

1. **Top banner**: "Be visible. Be bookable. Increase your revenue."
2. **First screen**:
   - Eyebrow: "Fichua is not another booking platform: direct bookings for independent lodges."
   - Headline: **"Up to 3x cheaper than Booking.com."**
   - Subline: 7% vs up to 20%.
   - Buttons: **Book a Call** and **WhatsApp us**. The short sign-up form stays.
   - Trust strip with facts only: Rwanda pilot, Fichua Verified checks, founder or team, and the countries you're targeting.
3. **The product**: a large mockup of a verified lodge page. It shows the Fichua Verified checks, the "What AI assistants read" panel, and a 3-step traveller journey: search or ask an AI, open the verified page, book on WhatsApp.
4. **AI visibility as the hook**: one short section on being found when travellers ask ChatGPT, Google or other AI tools.
5. **Where travellers come from**:
   - NGO and embassy staff
   - Business and conference travellers
   - Diaspora
   - Mid-range gorilla trekkers
   - Plus how each booking is tracked to Fichua, and a plain line that the pilot is in Rwanda.
6. **Why lodges keep using Fichua after the first booking**: rebooking, guest list you can export, repeat discovery, and the trust layer.
7. **One commission comparison**: a single 7% vs 15–20% block, plus the platform table (cards on phone).
8. **Honest pricing**:
   - $99/month built into the calculator, with an honest break-even. At $1,000 bookings that's 1–2 bookings; at smaller booking values it's more.
   - "10 free bookings before you pay" and a 3-month trial option.
   - A currency switch: USD, RWF, XOF.
9. **Mission and values**, shortened.
10. **Closing**: Book a Call, WhatsApp, and the sign-up form.

## Removed or moved

- Repeated savings and pitch sections are removed.
- "How it works" moves to its own page, /how-it-works.
- The FAQ moves to its own page, /faq.
- Both pages appear in the menu, and search engines can read them.

## Look

- Bigger body text.
- Darker text wherever light text is hard to read.
- More warm hospitality photos (hosts, rooms, guests).

## Needed from you

- **Book a Call link**, such as a Calendly link. Until you send it, the button opens an email to tr@fichua.co.
- **WhatsApp number** for the button.
- Confirm the **3-month trial** terms, and how they combine with the 10 free bookings.

## Technical details

- Index.tsx is reorganised. Removed: ProblemSection, SolutionSection, the duplicate ComparisonSection, and repeated parts of PricingSection.
- New components: ProductMockup, TravellerSources, WhyStay, TrustStrip, CurrencyToggle (fixed indicative exchange rates, labelled "approx.").
- New routes /how-it-works and /faq, both prerendered. The FAQPage JSON-LD moves to /faq, and the homepage keeps Organization and Product.
- The prerender script and its self-checks are updated to match. Rules for pricing and break-even get small tests.
- The sitemap is updated.
