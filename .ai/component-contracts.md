# COMPONENT CONTRACTS (Phase 002)

Only reusable shell contracts are documented here.

## AppShell
Purpose: application frame (sidebar + topbar + router view + palette hotkey).
Props: none. Events: none. Slots: none (uses RouterView).
States: palette open/closed, mobile drawer open/closed.
Accessibility: skip landmarks handled by semantic header/nav/main; Esc closes overlays.

## Sidebar
Purpose: primary navigation, data-driven from router table.
Props: class passthrough. Events: `navigate` (after link click, for mobile close).
Slots: none. States: active (visual) / exact (aria-current), hover, keyboard focus.
Accessibility: `<nav aria-label="Main">` with `<a>` links; single `aria-current="page"`.

## TopBar
Purpose: breadcrumb + palette trigger + mobile nav toggle.
Props: none. Events: `openPalette`, `toggleMobileNav`.
Slots: none. States: breadcrumb reflects route meta.
Accessibility: `role="banner"`, `nav[aria-label="Breadcrumb"]`, labelled buttons.

## PageHeader
Purpose: page title/description/action row.
Props: `title: string`, `description?: string`.
Events: none. Slots: `actions`. States: none.
Accessibility: single `<h1>` per page.

## EmptyState
Purpose: honest "no data / coming next" state.
Props: `title`, `description?`, `actionLabel?`, `icon?`.
Events: `action`. Slots: default (extra content). States: with/without action.
Accessibility: heading `<h4>`; real `<button>` for action.

## ErrorState
Purpose: failure report + retry + optional technical detail (never stack traces by default).
Props: `message`, `detail?`, `retryLabel?`. Model: `detailVisible`.
Events: `retry`. States: detail collapsed/expanded.
Accessibility: `role="alert"`; detail toggle has `aria-expanded`.

## LoadingSkeleton
Purpose: layout-shaped loading placeholder (real loading states only).
Props: `variant: 'text'|'rect'|'circle'`, `width?`, `height?`, `rows?`.
Events: none. States: pulse (disabled under prefers-reduced-motion).
Accessibility: `role="status"` + `aria-label="Loading content"`.
