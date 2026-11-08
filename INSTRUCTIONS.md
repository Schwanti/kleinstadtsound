# Kleinstadtsound

## Context

Kleinstadtsound is a DJ collective from Eichstätt which organizes parties and collaborates with bars and other collectives to revive the culture of Eichstätt and other cities and have fun. Its focus is on electronic music. Every DJ has its own unique sound from Italo disco to breakbeat.

## Existing online presence

instagram: https://www.instagram.com/kle1nstadtsound/

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (SSR/ISR) |
| CMS | Sanity |
| 3D | Three.js |
| Animations | GSAP + ScrollTrigger |
| Styling | Tailwind CSS |

## Design

Theme: **Chrom & Y2K**, derived from the collective's Instagram flyers (built with the Hallmark design skill). Tokens live in `src/app/tokens.css`.

- Chrome wordmark, pixel type (Silkscreen) for dates and counts, the red slogan wall from the profile picture behind the hero
- Each event card takes its flyer's own colour (`--flyer-*` tokens)

- Warm near-black sheet, warm off-white ink (no pure black/white)
- Primary accent: `#FF001A` (bright red), spent sparingly: the red word in the hero, the marquee band, buttons, focus rings
- Secondary accent: `#6C0009` (dark red, hover states)
- Display: Anton, uppercase, poster size; body: Public Sans
- Square edges, hairline rules, no shadows, no rounded cards

## 3D Model

- Hero focal point: the Kleinstadtsound character (`src/components/3d/Figure.tsx`), a chrome figure with the logo on its head, dancing on "Kleinstadt auf der Schallplatte" (`src/components/3d/RecordTown.tsx`)
- The figure bounces to the beat, swings its arms, turns its head toward the pointer and its body with the scroll
- A spinning record with the red label; gabled houses ride the grooves, the twin towers of the Eichstätt cathedral stand on the label, a tonearm on the edge
- Houses bounce like an equalizer at 124 BPM
- Scrolling scratches the record, the mouse tilts the deck; static with reduced motion

## Hosting

- Vercel (Free Tier)

## Goals/Requirements

This repository aims to create a website that lives the spirit of Kleinstadtsound.
Requirements:
- Minimalistic
- One-page website (mostly)
- Modern 3D effects (scroll effects, integrated background videos)
- Animations

## Pages/Routes

- Mostly one-page website with sections
- `/` — Hero with 3D model, featured content
- Sections for DJs, Events, About

## Editing content

- **Crew:** `src/content/crew.ts` (currently B72, GWZ, KD, Soulstice, Moosi). Add or remove a line to change the crew section; `aliases` catch other spellings on flyers.
- **Events:** `src/content/events.ts`, transcribed from the Instagram flyers. One entry per night: date, title, venue, city, line-up, info, partners, flyer image, flyer colour (`accent`).
- **Flyers:** `public/flyer/`. The current files are cut from phone screenshots; replace each with the original artwork under the same file name.
- **Sanity:** when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, crew ("DJ Profile") and events come from the Studio instead of these files; the page refreshes every 5 minutes.
- **Moving the local data into Sanity:** add `SANITY_API_WRITE_TOKEN` (Editor rights, from sanity.io/manage > API > Tokens) to `.env.local`, then run `npm run sanity:import -- --dry-run` to check and `npm run sanity:import` to write. It uploads the flyers, can be run again safely, and lists Studio entries it did not create (e.g. tests) so you can delete them.
- "Wo wir spielen", "Mit wem" and the "x× im Line-up" counts are computed from the event list.

## Content Structure

### DJ Profile
- Name
- Photo
- Bio
- Genres
- Recent gigs
- SoundCloud link
- Social links

### Event
- Title
- Date
- Type (organized / guest appearance)
- Location (optional)
- Description (optional)
- Link (optional)
- Image

## Inspiration pages

These are pages where I like certain elements. They are just inspirations and don't have to be included directly.

- 3D effects: https://www.dungyov.com/
- architecture: https://earv3rse.com/
- playfulness: https://keinemusik.com/
- https://www.cercle.io/