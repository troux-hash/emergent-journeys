# Rebuild: Crawlable, Margin-First Homepage

## What will change

- Rebuild the homepage around one quantified promise for independent lodges in East and West Africa: **keep $360 more on every $3,000 booking**.
- Put a compact “Make me visible” lead form in the first screen while preserving its existing submission and UTM tracking.
- Follow with a clear OTA cost comparison, the three operator outcomes, margin-first pricing, a short setup path, and a concise FAQ.
- Simplify navigation around the operator decision journey and keep the existing warm Fichua visual identity.

## Crawlability and sharing

- Extend the existing build-time prerender process so the homepage’s real headings, copy, FAQ, and calls to action are written into the generated HTML before deployment.
- Add static Schema.org JSON-LD for `Organization`, `Product`, and `FAQPage`, with FAQ markup matching visible questions and answers.
- Update the title, description, canonical, Open Graph, and X metadata around the new promise and audience.
- Use the canonical `https://fichua.co/og-image.jpg` share image; the current live checks confirm it loads directly and the `www` URL redirects successfully to it.

## Technical details

- Keep the current React/Vite app and extend its established post-build static prerender rather than introducing a second framework.
- Extract a reusable compact lead form so the first-screen form and full signup section share submission behavior without duplicate logic.
- Add a homepage-prerender self-check for visible body copy and all three requested schema types.
- Verify the generated HTML source, the form flow, desktop/mobile layout, metadata, and image response before publishing.

No backend schema changes are needed. Existing operator pages and their `LodgingBusiness` prerendering remain intact.
