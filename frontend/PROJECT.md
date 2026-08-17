# StorePilot Project

StorePilot is a retail management platform prototype designed around a compact analytics dashboard, product/inventory workflows, sales reporting, supplier management and a future AI assistant.

## Current milestone

Frontend foundation/prototype only. Mock data is used throughout. AI is visual-only and deliberately contains no API integration.

## Visual source of truth

The supplied dashboard reference establishes the intended composition, spacing, sidebar, dashboard hierarchy and theme personality. The supplied branding reference establishes the StorePilot logo artwork.

## Theme

- Light: pearl/white surfaces with green as primary brand/action accent.
- Dark: deep navy/charcoal surfaces with purple as primary brand/action accent.
- Semantic success/warning/danger colors remain independent of the primary theme accent.

## Branding rule

StorePilot branding is placed in the sidebar only. The topbar contains navigation context, search, theme, notifications and profile controls.

## AI Assistant UX (Phase 2)

- **Desktop**: Right-edge reveal button (fixed, vertical center) → opens right-side drawer (full height, 400px wide) with backdrop, focus trap, Escape/backdrop-close, semantic suggestions, input + send.
- **Mobile (≤768px)**: Floating action button (bottom-right) → opens full-height drawer (same component) with same content.
- **Responsive**: Reveal hidden on mobile/tablet; FAB visible only on mobile/tablet.
- **Accessibility**: ARIA roles/labels, focus management, keyboard navigation, reduced-motion respected.
