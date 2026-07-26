# Restructure: Operator-Focused Site

Right now the site reads like a general landing page — 8 sections aimed at multiple audiences (travellers, partners, investors, operators). We'll strip it down to a single-purpose funnel: **convince an independent African lodge owner to sign up in under 60 seconds**.

## New page architecture (5 sections, top to bottom)

```text
1. HERO             → One sentence. One promise. One CTA.
2. THE PROBLEM      → 3 pains they already feel, named plainly.
3. THE SOLUTION     → What Fichua does + 3 concrete outcomes.
4. HOW IT WORKS     → 3 steps. No jargon. Time to launch: 20 min.
5. SIGN UP          → The form. Trust line. Done.
```

Everything else (Opportunity/Africa Time, Who We Are, Trust logos, Vision, Business Model, Traction, Why Now) is **removed from the homepage**. The most useful of these (Who We Are, Trust) can live on a secondary `/about` page later if needed — not now.

## Tone shift: direct operator talk

Current tone is poetic and abstract ("What is hidden is not absent…"). We keep the brand's warmth but speak plainly to a lodge owner who is busy, skeptical, and losing bookings.

Examples of the new voice:

- Hero: **"Your lodge deserves to be found. We make sure it is."**  
  Sub: *"Independent African lodges lose bookings every day to chain hotels and OTAs. Fichua puts you back in front of travellers — and keeps 100% of your revenue."*
- Problem headline: **"You're invisible. That's not your fault — but it is costing you."**
- Solution headline: **"One page. One link. Every booking direct."**
- CTA: **"Get my lodge listed"** (not "Request Onboarding Call")

## Navigation

Reduce nav from 6 items to 3:

- Problem
- Solution
- How It Works  
- + primary button: **"List My Lodge"**

Remove: Africa Time, Who We Are, They Trust Us.

## Section-by-section changes

**1. Hero** — Keep the safari image. Replace the Swahili etymology + long poetic headline with a direct promise + single CTA button that scrolls to sign-up. Drop the giant "ficha" watermark (decorative, adds noise).

**2. Problem** — Keep the existing 3-card structure; rewrite copy in second person ("You're invisible on AI search", "You're losing guests on WhatsApp", "You're paying OTAs 20% to be found").

**3. Solution** — Replace current SolutionSection with a tight 3-outcome block: *Get found on ChatGPT & Google · Take bookings directly · Keep 100% of your revenue.* One supporting sentence each.

**4. How It Works** — 3 steps, max 10 words each: *1. Tell us about your lodge · 2. We build your Fichua page in 20 min · 3. Start taking direct bookings.*

**5. Sign Up** — Keep current form. Tighten copy above it: **"Ready? It takes 2 minutes."** Remove the 4-bullet checklist (redundant with Solution section).

**Footer** — Keep minimal: logo, contact email, Privacy, Terms.

## Files to change

- `src/pages/Index.tsx` — remove 5 section imports, reorder to Hero → Problem → Solution → HowItWorks → OperatorSignup → Footer.
- `src/components/Navbar.tsx` — reduce nav items to 3 + CTA.
- `src/components/HeroSection.tsx` — new copy, add CTA button, remove watermark.
- `src/components/ProblemSection.tsx` — rewrite copy in 2nd person.
- `src/components/SolutionSection.tsx` — rewrite to 3-outcome structure.
- `src/components/HowItWorksSection.tsx` — simplify to 3 short steps.
- `src/components/OperatorSignupSection.tsx` — tighten intro copy, change CTA label.

No design tokens, colors, or fonts change. No backend changes. Removed sections stay in the codebase (unused) in case you want them back.

## What I need from you

1. Approve the 5-section architecture (or tell me which section to keep/drop).
2. Approve the tone shift examples above (or send edits).
3. Confirm the primary CTA label: **"List My Lodge"** vs **"Get Started"** vs your own.

Once you approve, I'll implement in one pass.
