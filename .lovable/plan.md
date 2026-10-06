# Finish the operator landing page

## Build
- Correct the break-even promise to three to four bookings and present modest/busy examples in a compact comparison table.
- Keep the interactive calculator, making the 15%–20% OTA range and room-rate-scaled subscription explicit.
- Add the real lead-form fields to prerendered homepage HTML while keeping the existing tracked form submission behavior.
- Add a clearly labelled fictional sample lodge page as proof, without publishing test data to production.
- Add FAQ answers for payouts/mobile money, time to go live, coverage, and the meaning of verification; mirror them in FAQ structured data.

## Verify
- Test the “Make me visible” form at a phone viewport without retaining the test lead.
- Check generated homepage and sample-page HTML for visible copy, form fields, canonical tags, and JSON-LD.
- Validate the deployed structured data with Google’s Rich Results Test when the updated site is published; until then, validate the generated markup locally and report that distinction.

## Technical details
- Preserve the existing React/Vite runtime and build-time prerender architecture.
- Keep form submission logic centralized in `OperatorLeadForm`.
- Do not create or publish a test operator record.
