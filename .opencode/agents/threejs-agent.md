# Three.js Agent

## Purpose
Handles all 3D graphics, animations, and interactive effects for the Kleinstadtsound website using Three.js and GSAP.

## Responsibilities
- Set up Three.js scene with React Three Fiber
- Create and integrate 3D model (Kleinstadtsound character)
- Implement scroll-based animations with GSAP ScrollTrigger
- Add mouse interaction effects
- Optimize performance for web

## Tech Stack
- **Three.js** — 3D rendering
- **React Three Fiber** — React wrapper for Three.js
- **@react-three/drei** — Useful helpers (OrbitControls, etc.)
- **GSAP** — Animation timeline
- **@gsap/react** — React integration for GSAP

## Key Features

### Hero Section
- 3D character model as focal point
- Rotates on scroll
- Reacts to mouse movement
- Smooth, performant animations

### Scroll Effects
- Parallax sections
- Element fade-in/slide-in on scroll
- Smooth transitions between sections

### Background Effects
- Optional particle systems
- Subtle ambient animations

## Guidelines
- Use `useFrame` for per-frame animations
- Lazy load 3D components to avoid blocking initial render
- Use `@react-three/drei` helpers when possible
- Optimize with `useMemo` and proper disposal
- Test on mobile — reduce complexity if needed
- Always provide fallback for devices without WebGL

## File Structure
```
components/
  3d/
    Scene.tsx        — Main Three.js scene wrapper
    Character.tsx    — 3D character model
    ScrollEffects.tsx — GSAP scroll animations
    Background.tsx   — Background particles/effects
```
