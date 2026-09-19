# DESIGN SYSTEM (Phase 002)

Single source of truth for visual language. Existing app palette retained (ADR-002) —
the proposed template palette was NOT adopted; mapping documented below.

## Colors (from src/index.css — canonical)

| Token | Value | Tailwind usage |
|---|---|---|
| bg | #0B0E14 | `bg-[#0B0E14]` |
| surface | #111622 | `bg-[#111622]` |
| elevated | #151B28 | `bg-[#151B28]` |
| border | #1E293B | `border-[#1E293B]` |
| primary | #38BDF8 (sky) | text/bg-[#38BDF8] |
| success | #22C55E | emerald/sky green |
| warning | #F59E0B | amber |
| danger | #EF4444 | rose/red |
| text-primary | #F8FAFC | headings |
| text-secondary | #94A3B8 | body |
| text-muted | #64748B | meta |

Proposed→actual mapping: Background #080B12→#0B0E14; Surface #0F141D→#111622;
Elevated #151B26→#151B28; Border #263244→#1E293B; Primary #6366F1→#38BDF8.
Success/Warning/Danger identical.

## Typography

- UI: Inter — `font-sans`
- Code/metrics: JetBrains Mono — `font-mono`
- Scale: Display 2xl bold / H1 xl-bold (PageHeader) / H2 base-bold / H3 sm-semibold /
  Body sm / Small xs / Caption text-[10px] / Metric xs-mono / Code xs-mono.

## Spacing

Tailwind default scale; page rhythm: container `p-4 sm:p-6 lg:p-8`, page max-w-4xl mx-auto,
section gap `space-y-6`, card padding `p-4/p-5`. Never introduce one-off values.

## Radius

small `rounded` (4px) · medium `rounded-md/lg` (6–8px) · large `rounded-xl` (12px) ·
pill `rounded-full`. Cards/panels use 6px (`.ui-panel`).

## Shadows

Minimal: modal/palette `shadow-2xl`, emphasis cards `shadow-xl`. No glows.

## Breakpoints

Tailwind defaults — sm 640 / md 768 (sidebar switch) / lg 1024. QA targets:
1440×900, 1280×800, 1024×768, 768×1024, 390×844. No horizontal overflow.

## Motion

Sparse: 0.1–0.2s ease for drawer/modal/hover; page transitions none yet.
Always `prefers-reduced-motion` respected (skeletons use `motion-reduce:animate-none`).

## Theme

Dark-only developer theme. No pure black, no glassmorphism, no neon.

## Accessibility rules

- Semantic nav/header/main; RouterLink `<a>` for navigation
- single `aria-current="page"` on exact route only
- focus-visible ring (`.focus-ring`); palette is a dialog with combobox/listbox roles
- interactive elements are `<button>`/`<a>`, never bare `<div>`
