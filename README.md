# AVENZOTECH — rebuilt site (v3)

Five static pages, one stylesheet, one deferred script. No build step, no dependencies, no framework required to deploy.

## Deploy

Copy everything into your web root. `AVENZO.png` is no longer needed — the logo is now vector.

```
index.html  about.html  services.html  projects.html  contact.html
styles.css  main.js  logo.svg
favicon.svg  favicon.ico  favicon-16.png  favicon-32.png
apple-touch-icon.png  icon-192.png  icon-512.png  logo-mark.png
site.webmanifest
```

Google picks up favicons on its own schedule — usually days to a few weeks after it next crawls you. Nothing to do but wait.

## Design system

| Token | Value | Use |
|---|---|---|
| `--void` | `#09090a` | page background |
| `--panel` | `#0f0f12` | alternating bands, cards |
| `--blood` | `#9b1b1e` | primary accent — rules, markers, borders |
| `--blood-lift` | `#c0272b` | hover / active only |
| `--ink` / `--ash` | `#ececee` / `#8a8a93` | text / secondary text |

Type: **Archivo** (display, variable width @112%), **IBM Plex Sans** (body), **IBM Plex Mono** (labels, data). Signature element: the **index spine** — left-edge hairline that fills red on scroll and names the current section.

## What v2 added

**Live Core Web Vitals panel** (`services.html#architecture` and home). Real `PerformanceObserver` measurement of LCP, INP, CLS and TTFB for the page the visitor is on, scored against the 2026 "good" thresholds. This is the strongest trust signal on the site — it's a claim that verifies itself. Note the INP cell stays blank until the visitor interacts; that's correct behaviour, not a bug.

**Real-time personalization** (home hero). Segments the visitor from `?industry=`, `utm_campaign`, or referrer (search vs social), then swaps the hero lede and CTA label. A visible ribbon announces it with a "Show default" escape. Try:
`index.html?industry=ecommerce` · `?industry=saas` · `?industry=healthcare` · `?industry=manufacturing`

This is **client-side**, not server-side. It's honest, instant and free. If you later move to Next.js or Astro, promote the same segment map to middleware so the personalised copy is in the initial HTML — better for SEO and avoids any flash of default content.

**Conversational form** (`contact.html`). Seven questions, one at a time, chip-based answers, progress bar, back navigation, recap screen before send. The original long form is still there as a fallback behind "Switch to a standard form", and there's a `<noscript>` path.

**Privacy controls** — a granular consent panel (necessary / analytics / marketing, everything non-essential off by default), stored in `localStorage` only, re-openable from the footer or the about page. This is the "compliance management" claim demonstrated rather than asserted.

**WCAG 2.2 AA groundwork** — skip link, `#main` landmark, 24px+ target sizes (44px on primary controls), visible focus rings, keyboard paths, Escape closes the mobile nav, `aria-live` on the conversational form, reduced-motion respected throughout.

**Micro-interactions** — SVG stroke-tracing on service icon hover, icon scale on card hover, button press feedback, chip press states. No Lottie files needed; it's all CSS on the existing SVGs.

**Copy modernised** — API-first and headless, islands architecture, INP budget under 200ms, PWA, conversational UX, automated decision systems, privacy-first development, GDPR/DPDP/SOC 2, European Accessibility Act.

**Mini case studies** — a metric card sits under each of the four service pillars on `services.html`.

## Fill these in before going live

- `services.html` — four `.minicase` blocks show a dash where the metric goes. HTML comments mark each one. Put real numbers in.
- `services.html` — the testimonial `<figure class="quote">` holds placeholder text. Replace or delete it. **Don't ship an invented quote.**
- `projects.html` — each case study's "Result" card says *Add your metric*.
- `index.html` — stat counters use `data-count="4" / "14" / "30"`.

## Honest note on the architecture advice

The brief recommends Astro / Next.js islands. This delivery is **hand-written static HTML** — which, for a five-page marketing site, already beats most framework builds on the exact metrics that document cares about: near-zero JavaScript on first paint, no hydration cost, and an INP that is essentially free. Check the live vitals panel and you'll see it.

Move to Astro or Next.js when you actually need what they give you: a headless CMS feeding a blog or case-study library, dozens of pages sharing components, or server-side personalization. Porting is straightforward — the CSS and the section markup carry over unchanged. Rebuilding now would add a toolchain without moving a single number.

## Contact form backend

Currently opens the visitor's mail client with everything pre-filled — works on any host, zero backend. To capture submissions instead, point it at Web3Forms or Formspree: in `main.js`, replace the `mailto:` construction in the `finish()` function (conversational) and in the `data-mailform` handler (classic) with a `fetch()` POST to your endpoint.


## v3 changes

**Logo, rebuilt as vector.** Your original mark — the chevron with the craft inside — redrawn in the site palette: an ember-to-deep-blood gradient with a bevel highlight on the left face and a soft drop shadow, so it reads as a solid object rather than a flat shape. The wordmark is now live HTML text in Archivo with "tech" set in tracked-out mono underneath, which means it stays sharp at every size and matches the rest of the site's typography. `logo-mark.png` is a transparent PNG of the mark for social profiles and anywhere you need a raster.

Full favicon set generated from the same geometry: `favicon.ico` (16/32/48/64), `favicon.svg` for modern browsers, PNGs at 16/32/192/512, and a 180px apple-touch-icon on a dark rounded tile. `site.webmanifest` ties them together, so the site installs to a phone home screen with the right icon.

**Button contrast fixed.** You were right, and the cause was specific: `.btn--ghost` never declared a background, so `<button>` elements fell back to the browser's default light ButtonFace while keeping light text — invisible until hover repainted it. Anchors styled with the same class looked fine, which is why it only affected the consent panel. Every variant now declares its own background and colour explicitly, and the consent buttons get a lifted `#1c1c22` surface so all three read clearly at rest.

**WhatsApp chat.** Floating button, bottom right, with a gentle bob and an expanding ring pulse. Click opens a small card ("typically replies in minutes"), and the button inside goes to `wa.me/919328306142` with a pre-filled greeting. It nudges itself open once per session — after 12 seconds or once the visitor scrolls past a screen and a half, whichever comes first — then retreats. Escape or an outside click closes it. Deliberately not on a 5-second timer on every page: that pattern annoys more people than it converts.

**Contact details updated everywhere** — `sales@avenzotech.com` and `+91 93283 06142` across all five pages, in the footers, the contact page (now with tappable phone and WhatsApp rows) and both form handlers.

**ERP & CRM added as a fifth service pillar.** Full section on `services.html` — custom modules for inventory, purchase, production and dispatch; CRM with lead scoring and pipeline automation; GST invoicing, e-way bills and Tally sync; Odoo, ERPNext, Zoho and Salesforce implementation and migration. Also on the home services grid, the about capability list, the tech stack column, both contact forms, and the meta descriptions.

**Background animation.** A fixed ambient layer behind all content: two slow-drifting red orbs, a scrolling hairline grid, a scanline sweep, and a canvas particle field that draws connecting lines between nearby points. It pauses when the tab is hidden, throttles on resize, caps at 70 particles, and is disabled entirely under `prefers-reduced-motion`. All GPU-composited transforms, so it doesn't touch your INP — check the vitals panel and you'll see it hold.
