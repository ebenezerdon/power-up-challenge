# Power Up Challenge

Power Up Challenge is a beautiful, responsive landing page for a 28-day fitness challenge featuring live countdown timers, clear rules, weekly rewards, and swipeable participant progress reels. It is built by [Teda.dev](https://teda.dev), the simplest AI app builder for regular people.

## Features
- Cinematic hero with live countdown showing challenge start or end
- Weekly rewards with dynamic unlock status and next reward countdown
- Clear, scannable rules with modern card design
- Participant progress reels with images and notes
- Add your own progress posts; data is saved locally in your browser
- Optional Progress Hub to manage your posts (add or remove) and review rewards status
- Fully responsive, accessible, and keyboard navigable

## Tech Stack
- HTML5 with semantic tags
- Tailwind CSS via CDN
- jQuery 3.7.x for interactions
- Modular JavaScript under scripts/ with a single global namespace `window.App`
- LocalStorage persistence

## Local Development
1. Open `index.html` in your browser to view the landing page.
2. Use the "Enter the Challenge" CTA to open `app.html` (Progress Hub) for managing your posts.

No build step is required since Tailwind and jQuery are loaded from CDNs.

## Files
- index.html: Landing page with hero, countdowns, rules, rewards, and reels
- app.html: Progress Hub for managing posts and reviewing rewards
- styles/main.css: Additional CSS polish and micro-interactions
- scripts/helpers.js: Namespaced storage and time utilities
- scripts/ui.js: App UI logic, rendering, and event bindings
- scripts/main.js: App bootstrap and error handling

## Accessibility
- High-contrast color palette and focus-visible outlines
- Motion reduced when `prefers-reduced-motion` is enabled
- Keyboard-friendly controls and ARIA-friendly labels

## Data Persistence
- Posts you add are stored in localStorage under the key `fitx.reels`
- Challenge configuration is stored under `fitx.challenge.config`

## Notes
- External images are used from Unsplash to provide high-quality visuals.
- If you want to reset the challenge dates, clear your browser localStorage for this site.
