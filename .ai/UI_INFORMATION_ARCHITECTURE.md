# UI INFORMATION ARCHITECTURE (Phase 011)

Second-pass audit of every route. For each screen we recorded: primary purpose,
primary action, primary information, secondary information, and what was
removed, merged, or made visually quieter.

Rule applied everywhere: **fix hierarchy with typography, spacing, alignment,
dividers and subtle surfaces — not by adding more components.**

---

## 1. Route inventory

| Route | Page | Primary purpose | Primary action |
|---|---|---|---|
| `/` | CommandCenterPage | Orient: where am I, what next | Recommended action button |
| `/today` | TodayViewPage | Execute the day's task list | Create task / advance task state |
| `/learning/roadmap` | RoadmapPage | Navigate 180 days, pick workspace day | Select day → switch workspace |
| `/learning/java` | LearningJavaPage | Study a Java module through the 11-stage loop | Advance stage / run failure lab |
| `/learning/ai` | AIKnowledgePage | Learn AI systems topics + drills | Expand card / mark complete |
| `/english` | EnglishPage | Practise technical English + quiz | Filter section / answer drill |
| `/interview` | InterviewPage | Answer practice against a rubric | Reveal reference answer → next |
| `/review` | ReviewPage | Deliberate recall practice | Recall → reveal → grade (SM-2) |
| `/settings` | SettingsPage | Control local state | Change day / export / import / reset |
| shared | AppShell, Sidebar, TopBar, CommandPalette | Wayfinding | Navigate / ⌘K search |

---

## 2. Hierarchy decisions per route

### Command Center (`/`)
- **Primary:** Day number, days remaining, current phase name, today's theme,
  and one recommended action. These sit in the single hero surface.
- **Secondary:** six signal metrics, competency readiness, weakest dimension.
- **Removed (decoration, not information):** hard-coded trend labels
  (`Active flow`, `Hands-on focus`, `Pattern recall`, `7 Services`), the
  `PRIORITY #1` label, the `REAL SIGNALS` badge, the `CHAOS READY` badge.
- **Merged:** the competency list no longer nests one bordered card per
  dimension; rows are separated by hairline dividers inside one panel.
- **Quieter:** the Incident Lab panel lost its red frame; only its primary
  action keeps the danger accent.
- **Fixed root cause:** the "today's core target" line and the phase badge were
  hard-coded strings; they now read the active roadmap day from the store.

### Today (`/today`)
- **Primary:** the task list. Filters are a single quiet segmented row.
- **Quieter:** per-row category badge dropped to a plain monospace label; the
  animated pulse dot is reserved for `IN_PROGRESS` only.

### 180-Day Roadmap (`/learning/roadmap`)
- **Primary:** phase filter + day list; the day specification panel is the
  secondary column and is sticky on large screens.
- **Removed:** per-row `ACTIVE`/`VERIFIED`/phase-name pills; the row now shows
  the day number, a single status glyph and the theme.
- **Kept:** day specification content (hands-on goal, DSA pattern, system
  design, English, Claude Code) as labelled blocks separated by dividers.

### Java Core (`/learning/java`)
- **Primary:** module → stage loop. Stage navigation is the single horizontal
  control; stage content follows in one reading column.

### AI Knowledge (`/learning/ai`)
- **Primary:** topic list; the track tab row is the only filter with weight.
- **Removed:** gradient/hype wording; the reference architecture diagram is
  collapsed by default so the topic list leads.
- **Quieter:** difficulty badge is the only coloured chip per card.

### Technical English (`/english`)
- **Primary:** section filter + vocabulary card.
- **Kept:** the quiz mode toggle as the secondary path (its own view).

### Interview (`/interview`)
- **Primary:** the question, then the rubric, then the reference answer.
- **Removed:** "grilling arena" hype, decorative dot badges, nested card inside
  card for the reference answer.
- **Order fixed:** rubric points now sit *above* the reveal control so the
  candidate reads the expectations before revealing (they were duplicated
  below the fold before).

### Review (`/review`)
- **Primary:** prompt → reveal → grade. One card, one surface.
- **Removed:** the misleading "Session Timer Active" indicator (no timer is
  shown), redundant meta bar, and `hover:scale` on grade buttons.
- **Fixed root cause:** "no cards at all" and "deck finished" were the same
  screen; they are now distinct states with different copy and actions.

### Settings (`/settings`)
- **Primary:** three sections in one canvas, divided by hairlines:
  active day → backup/restore → destructive reset.
- **Removed:** three separate floating rounded panels with competing padding.

---

## 3. Cross-cutting IA rules (enforced from this phase on)

1. **One h1 per route.** Only `PageHeader` or the Command Center hero may own
   the h1; section titles are h2 (never styled larger than the h1).
2. **Uppercase monospace micro-labels** are metadata, not headings. They use
   `text-[10px]/[11px]`, `text-[#64748B]`, and no bright accent colour.
3. **No nested cards.** A panel may contain dividers; it must not contain
   another bordered panel unless it is an interactive item (list row, tile).
4. **Accent colour budget:** at most one accent-coloured element per section
   header; semantic colours (success/warning/danger) only for real state.
5. **No invented metrics.** If a number is not in the store or not derived from
   stored data, it is not rendered.
6. **Filters first, content second, actions inline** — never an action bar
   between the filter row and the content it filters.

---

## 4. Verification for this phase

- `npm run test` (Vitest) — all suites PASS after the hierarchy changes.
- `npm run typecheck`, `npm run lint`, `npm run build` — PASS.
- Copy assertions that pinned removed hype strings were updated together with
  the pages (test files are the contract for visible copy).
