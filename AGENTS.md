# Architecture Rules

- Generate crawlable homepage and operator-page HTML in the existing postbuild prerender script, because the React/Vite runtime remains client-rendered while search and social crawlers need complete source HTML.
- Keep operator lead submission logic in `OperatorLeadForm`, because the same tracked form appears both above the fold and in the closing signup section.
- Keep the fictional sample lodge as a static, noindex route rather than a database operator, so proof is available without publishing test data.- Keep pricing maths and currency conversion in `src/lib/pricing.ts` (tested in `src/test/pricing.test.ts`), so the calculator, copy and tests share one source of truth.
- Keep Book a Call and WhatsApp destinations in `src/lib/contact.ts`; the WhatsApp button renders only when a number is set, so no dead link ships.
- FAQ and How it works live on their own prerendered routes (/faq carries the FAQPage JSON-LD), keeping the homepage short.
