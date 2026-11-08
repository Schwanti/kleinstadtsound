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

Theme: **Manifesto** (from the Hallmark design skill), adapted to the brand red. Tokens live in `src/app/tokens.css`.

- Warm near-black sheet, warm off-white ink (no pure black/white)
- Primary accent: `#FF001A` (bright red), spent sparingly: the red word in the hero, the marquee band, buttons, focus rings
- Secondary accent: `#6C0009` (dark red, hover states)
- Display: Anton, uppercase, poster size; body: Public Sans
- Square edges, hairline rules, no shadows, no rounded cards

## 3D Model

- Kleinstadtsound character from Instagram profile
- Hero section focal point
- Rotates on scroll
- Reacts to mouse movement

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