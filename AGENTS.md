# Natali Mala website

## Scope and workflow

This is a Ukrainian-language static website for therapist Наталя Мала, published at https://natalimala.com/. Keep the implementation lightweight: plain HTML, CSS and JavaScript, with a standard-library Python build. The user explicitly prefers avoiding complex dependencies.

Edit source files in the project root. Read [README.md](README.md) before changing the build or deployment workflow; it documents commands, font caching and macOS requirements. `dist/` is generated output, not an editing target. Publish its contents.

After changes, run `python3 build.py` and `node --check script.js`. For layout or interaction changes, also inspect the affected section in a browser at desktop and mobile widths; syntax checks alone do not verify behavior. Describe any untested behavior honestly.

## Accepted visual direction

- Warm ivory, wine-colored text and muted powder-pink decoration; preserve the personal, calm feel rather than introducing a generic clinical or promotional style.
- Hero rings rotate continuously and very slowly, with linear motion. The user rejected breathing/pulsing and reversing motion because direction changes attract attention.
- Keep the rings powder pink, not gray or bright. The left ring is deliberately stronger and wider than the others. Preserve the soft masking under text and the more visible decoration around the portrait. Current numeric values live in `script.js` and `styles.css`.
- Preserve reduced-motion support.
- The portrait retains its original photographic background. Its accepted frame thickness is 24px.
- Section spacing was deliberately reduced roughly by half to avoid excessive empty space around dividing lines. Preserve the compact page rhythm.

## Content and editorial decisions

- Public copy is Ukrainian, warm, respectful and personal, using first-person singular. Use feminine professional titles consistently: психологиня, сексологиня, гештальт-терапевтка.
- The approved About heading is: `Можна бути собою.<br />Навіть коли непросто`.
- About copy uses selective bold emphasis, not whole bold paragraphs: name, respect for the client's pace and contact, work formats, finding support, LGBT friendliness and confidentiality.
- Approved wording includes “Питання сексуального бажання та збудження” and “Втрата сенсу й опори, відчуття безсилля та втоми”.
- The user supplied professional membership: “Є дійсним членом Національної асоціації гештальт-терапевтів України”, listed under professional membership in Education.
- Practice is presented as in-person in Lviv and online, for adults 18+, LGBT-friendly, individually and with couples/families.
- Website privacy and therapy confidentiality are separate topics. The built site hosts fonts locally and its privacy note reflects this.
- The confidentiality paragraph was added editorially; its exact wording and legal exceptions still require the therapist's confirmation. Avoid inventing credentials, prices, session policies or legal guarantees.

## Work areas: accepted replacement for the accordion

All subtopics remain visible. Use a compact two-column grid on wide screens and one column on mobile, with smaller headings, thin dividing lines and inline subtopics separated by dots with natural wrapping.

The full-width six-row version was rejected as too tall and disruptive to browsing. The former hover accordion and its JavaScript were removed. Preserve visible content and compactness unless the user requests another design.

## Contact cards: accepted responsive behavior

Use CSS container queries based on each card's width: hide the arrow first (480px), then the icon (430px), with text wrapping when necessary. These are fixed thresholds, not content-aware fitting.

An attempted JavaScript/ResizeObserver implementation that measured text was unreliable and explicitly reverted at the user's request. Keep this behavior CSS-only; do not reintroduce automatic JavaScript fitting as an unsolicited improvement. There is no requirement to emulate SwiftUI ViewThatFits exactly.

## Assets and release

- Favicon: the `НМ` monogram on ivory with a powder-pink ring. `favicon.svg` is the source; the build generates PNG variants. Root PNG files are development previews.
- Open Graph image: `og-image.png`, 1200×630, containing portrait, name, specialization and location in the site's palette. The build copies it as-is; changing site text or design does not regenerate it.
- Canonical and Open Graph URLs use https://natalimala.com/. Preserve absolute public image URLs.
- The build downloads and caches Google Fonts resources, then serves them locally in `dist/`; root HTML retains remote fonts for source preview. DM Sans includes bold weight for emphasized copy.

## Discussed but not yet completed

These are audit suggestions, not approved facts or completed work. Recheck the repository and ask for missing information before implementing relevant items:

- Therapist-confirmed session prices, duration, first-session process, cancellation rules, online platform and approximate office location.
- Education institutions, dates and certification status; membership alone does not establish those details.
- Mobile/keyboard testing, contact-card layout review, a visible focus outline on the dark-background email link and a skip-to-content link.
- `robots.txt`, `sitemap.xml` and optional structured Person data using confirmed information.
- Hosting configuration: HTTPS and www redirects, caching/compression, security headers; actual domain email setup and SPF/DKIM/DMARC if used.
- After publication: resource/status checks, messenger previews, Lighthouse and Search Console. Local builds do not confirm live deployment or mailbox availability.
