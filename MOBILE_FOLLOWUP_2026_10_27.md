# Mobile followup — 2026-10-27

Source: client email and three iPhone screenshots supplied in this conversation.

## Implemented; awaiting owner verification
- About quote: explicit bounded full-width container, equal mobile gutters, responsive font clamp and responsive SplitText rebuilding. Existing animation timing, easing and scroll behaviour retained.
- Contact mobile image: 60svh frame and Home-style 120% image crop with -10% top offset. Existing Contact animation retained. Header gets a light backing for contrast.
- Shared CTA button: arrow glyphs in saved text become currentColor SVG in both existing hover layers; no saved copy or destination change.
- Home destinations: separate from SplitText, individually unbroken labels, flex wrapping and compact row gaps. Mobile separators omitted so none lead a wrapped row; desktop separators retained.
- About footer: its own editable footerCtaLines, defaulting to the two client-approved lines. Public and private preview use the same fields. Home remains independently editable.
- SeoImage: explicit empty alt survives, so aria-hidden marquee duplicates no longer receive generated keyword alt.
- About gallery: galleryDescriptions maps alt to existing image URLs independently from galleryImages selection. Defaults reuse matching descriptions from existing project data. Blank unmatched descriptions still require factual owner input; generic fallback remains until supplied. No photographs were replaced to obtain metadata.

## Required acceptance
1. Owner runs scripts/verify-mobile-followup-2026-10-27.ps1: extra touched-component lint plus existing offline checks, TypeScript and production build.
2. Inspect Home, About and Contact, including lower form/footer, at 320/375/390/430px and desktop. Verify overflow, wrapping, header, CTA hover, gallery rotation and animation replay after resize. No copy rewrites were authorised or performed.
3. Fill missing About gallery descriptions in Pages > About > galleryDescriptions by actual photograph. Preserve src values. footerCtaLines controls About only.
4. Browser screenshots and actual Safari/iPhone/Instagram browser acceptance are pending. Local database auth was previously blocked; do not change credentials or ports to claim acceptance.
5. Check www/non-www HTTP redirects, final host, canonical and sitemap against one intended origin. No host-routing change was made without evidence. Run a read-only live audit as a separate stage before closing this requirement.
6. Real Contact submission/internal-notification acceptance requires the agreed designated test and explicit send scope. No submission was made in this batch.

No production deployment, database mutation, email or automation was executed. New source changes require a new verified release artifact before deployment.
