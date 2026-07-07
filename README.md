# Reclaiming Our Downtown: Website

A sleek, multi-page redesign of [reclaimingourdowntown.org](https://reclaimingourdowntown.org/),
built around Dan Ondrasek's 2019 vision rendering of Downtown Santa Clara.
Design language inspired by modern transit-tech sites: light palette, big type,
mono data labels, and scroll-triggered motion.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: sketch/day/night artwork toggle, story, stats, five-pillar vision, plan teaser, news teaser, join form |
| `plan.html` | The Downtown Precise Plan, condensed (numbers, jobs band, core idea, timeline, FAQ) |
| `news.html` | Full press archive, 2017 to today, with year and milestone filters |
| `privacy.html` | Privacy policy |

Shared assets: `styles.css` (design system) and `site.js` (nav, reveals, counters, ticker, accordions, form).

## How to view it

Double-click `index.html`, or serve the folder:

```
python3 -m http.server 4173
```

No build step, no dependencies (fonts load from Google Fonts).

## Motion inventory

- Hero artwork: sketch/day/night toggle with crossfade, plus a slow left-to-right
  pan so the full 2:1 artwork can be enjoyed, inside a giant rounded panel
- Word-by-word masked headline reveals on every major heading
- Nav condenses into a floating pill as you scroll; hides going down, returns going up
- Gentle scroll parallax on the story photographs
- Infinite fact ticker on a dark band (pauses on hover)
- Draggable news rail on the homepage with snap points
- Animated number counters (dark stats panel, plan figures, jobs band)
- Vision pillars and plan FAQ expand on hover (tap on touch devices)
- Giant "Bring it home." footer wordmark with staggered reveal

Design grammar: warm paper base, a single red family in tonal steps, soft 34 to
44px radii on panels, tight display tracking, and one easing curve
(cubic-bezier(.16,1,.3,1)) everywhere.

## Hosting it for free

Static site, so any of these work in minutes:
- **GitHub Pages**: push the folder to a repo, enable Pages
- **Netlify / Vercel / Cloudflare Pages**: drag and drop the folder

The Join form currently shows a client-side confirmation. To collect real
signups, wire it to Formspree, Netlify Forms, or your mailing list: search
`FORM HOOKUP` in `index.html` for the exact spot.
