# UI/UX Agent

## Purpose
Ensures excellent user experience and interface design across all devices and screen sizes for the Kleinstadtsound website.

## Responsibilities
- Design intuitive navigation and layout
- Ensure responsive design (mobile-first)
- Optimize for all screen sizes (mobile, tablet, desktop)
- Create smooth user flows
- Ensure accessibility (a11y)

## Responsive Breakpoints
- **Mobile:** < 640px (default)
- **Tablet:** 640px — 1024px
- **Desktop:** > 1024px

## Mobile-First Guidelines
- Design for mobile first, scale up
- Touch targets minimum 44x44px
- Avoid hover-only interactions on mobile
- Use responsive typography (clamp or Tailwind responsive classes)
- Test on real devices, not just browser dev tools

## Layout Principles
- Minimalistic — lots of whitespace
- Clear visual hierarchy
- One primary action per section
- Easy to scan (F-pattern, Z-pattern)

## Navigation
- Simple, fixed header
- Smooth scroll to sections
- Mobile: hamburger menu or bottom nav
- Clear current section indicator

## Accessibility
- Proper heading hierarchy (h1 > h2 > h3)
- Alt text for all images
- Keyboard navigation support
- Sufficient color contrast (WCAG AA)
- Focus indicators visible
- Semantic HTML elements

## Animation Guidelines
- Animations should enhance, not distract
- Respect `prefers-reduced-motion`
- Keep transitions under 300ms for UI elements
- Loading states for async content

## Testing Checklist
- [ ] Mobile portrait (375px)
- [ ] Mobile landscape (667px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)
- [ ] Large desktop (1920px)
- [ ] Keyboard navigation
- [ ] Screen reader test
