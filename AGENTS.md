# Architecture Rules

- Generate crawlable homepage and operator-page HTML in the existing postbuild prerender script, because the React/Vite runtime remains client-rendered while search and social crawlers need complete source HTML.
- Keep operator lead submission logic in `OperatorLeadForm`, because the same tracked form appears both above the fold and in the closing signup section.