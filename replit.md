# Satwik R — Portfolio

Premium light-themed interactive portfolio inspired by the Wall of Portfolios layout, built for Satwik R (Product Designer).

## Stack
- Vanilla JS + Vite (artifact: `artifacts/portfolio`, slug `portfolio`, served at `/`)
- Three.js — hero scene with floating cube/sphere/torus/cone on a base, plus a press-and-hold red button (raycaster pointer events)
- GSAP + ScrollTrigger — entrance reveals, parallax of giant background words, signature drift, button press elastic
- Lenis — smooth scroll with `requestAnimationFrame` driver tied to GSAP ticker
- Custom cursor with hover scale + difference blend

## File map
- `artifacts/portfolio/index.html` — entire page markup
- `artifacts/portfolio/src/style.css` — all styles, design tokens, responsive
- `artifacts/portfolio/src/main.js` — Three.js hero, Lenis, cursor, draggable stickers, carousel, bio toggle, why pills, reveals
- Old React files under `src/` (App.tsx, components/, pages/) are unused — `index.html` only loads `/src/main.js` + `/src/style.css`

## Sections (in order)
1. Top bar — Wall of Portfolios brand, nav, Submit/Login buttons
2. Sticky sidebar — gradient avatar (SR initials), Open to Work pill, name, @handle, location, role, Message button, Profile/Portfolio sidenav
3. Floating dark icon rail — Home, Expand, Profile, Work, Case, Why, Hobbies (with active section tracking via ScrollTrigger)
4. Resume button (top-right fixed)
5. Hero — "Press and hold the red Button" tip, giant faded "PORTFOLIO '26" wordmark, Three.js stage
6. Bento project grid — 4 tiles (tall + 2 squares + wide) with gradient backgrounds and CSS art
7. Case study carousel — 3 slides (ARCO, SOUL AI, LUMEN) with prev/next arrows, autoplay, dot indicators
8. Interactable Zone — 9 draggable stickers (AirDrop, context menu, Face ID, modal, "Portfolio 2026" text, photo frames, Create blob, iMessage card) on top of giant "About me" italic background
9. Bio toggle — "Full Yap" vs "TL;DR" with strike-through animation revealing the short version
10. Experience scrapbook — dark card with white board holding stamp, pin, eye, clover, heart, lips, ARCTIC MONKEYS ticket
11. Why I design — dark modal with portrait + quote, discipline pills (UI/UX, Industrial, Motion, Graphic) on right
12. Discipline blocks — UI/UX with floating cards (Arc, ETH price, graph, photos, Aa); Industrial design with floating product blobs
13. Apart from design — 4 folders (Music/Movies/Photography/Football) that fan out 3 cards on hover
14. Contact — Apple Wallet card stack on left, iMessage blue bubble on right, socials, big faded "Satwik R" signature

## Interactions
- Hover anywhere with `data-cursor="hover"` → cursor expands to 56px white disc
- Hover folder → cover slides down + scales, three cards fan out behind it
- Hover wallet → top card slides up to reveal second
- Hover bento tile → lift + bg scale
- Drag any sticker in Interactable Zone → updates left/top, raises z-index
- Click "Full Yap" / "TL;DR" → strike-through transitions
- Click discipline pill → portrait scale-fade
- Carousel auto-advances every 6s, pauses on hover
- Press-and-hold the red 3D button → squashes + glows + spin release on mouseup

## Content note
All copy and visuals are placeholder — projects (ARCO, SOUL AI, LUMEN), bio paragraphs, and folder labels can be edited in `index.html`. Avatar uses gradient + "SR" initials; swap for a real photo by replacing the `.avatar` markup.

## Dev
Workflow `artifacts/portfolio: web` runs `vite --config vite.config.ts --host 0.0.0.0` on port 21113. Restart via the workflows tool after major changes.
