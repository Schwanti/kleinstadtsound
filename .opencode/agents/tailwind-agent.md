# Tailwind Agent

## Purpose
Manages all styling, CSS, and design system setup using Tailwind CSS for the Kleinstadtsound website.

## Responsibilities
- Set up Tailwind CSS configuration
- Define custom theme (colors, fonts, spacing)
- Create reusable component classes
- Ensure consistent design system
- Handle dark theme setup

## Design Tokens

### Colors
```javascript
// tailwind.config.js
colors: {
  background: '#000000',
  foreground: '#ffffff',
  accent: {
    DEFAULT: '#FF001A',  // bright red — primary accent
    dark: '#6C0009',      // dark red — hover states, subtle backgrounds
  }
}
```

### Fonts
```javascript
fontFamily: {
  sans: ['Inter', 'sans-serif'],
}
```

## Guidelines
- Use utility classes directly, avoid custom CSS when possible
- Use `@apply` only for truly reusable patterns
- Keep consistent spacing scale
- Test all components at different breakpoints
- Use Tailwind's dark mode utilities
- Prefer `gap` over margin hacks for spacing between elements

## Component Patterns

### Buttons
```html
<button className="bg-accent hover:bg-accent-dark text-white px-6 py-3 transition-colors">
```

### Cards
```html
<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
```

### Sections
```html
<section className="min-h-screen flex items-center justify-center px-4">
```

## File Structure
```
app/
  globals.css        — Tailwind imports + custom styles
tailwind.config.js   — Theme configuration
components/
  ui/               — Reusable UI components (Button, Card, etc.)
```
