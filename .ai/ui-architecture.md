# UI ARCHITECTURE (Vue, post Phase 002)

```
src/vue/
├── App.vue                 # root
├── main.ts                 # createApp + Pinia + Router
├── layouts/
│   ├── AppShell.vue        # shell: Sidebar + TopBar + RouterView + palette hotkey
│   ├── Sidebar.vue         # data-driven from config/navigation.ts
│   └── TopBar.vue          # breadcrumb + palette trigger + mobile nav toggle
├── components/
│   ├── CommandPalette.vue  # ⌘K palette (routes only, honest empty state)
│   ├── PageHeader.vue, EmptyState.vue, ErrorState.vue, LoadingSkeleton.vue
│   └── StatCard.vue, ProgressBar.vue
├── pages/                  # route components (vertical slices)
│   ├── CommandCenterPage.vue# Phase 003 migrated vertical slice (route '/')
│   ├── PagePlaceholder.vue # "Coming next" for unimplemented routes
│   └── LearningJavaPage.vue# representative vertical slice
├── router/index.ts         # canonical route table (single source of truth)
├── composables/            # reusable behavior (useActiveRoute)
├── config/navigation.ts    # sidebar IA derived from route table
├── stores/
│   └── learning.ts         # Pinia learning store (localStorage + engines)
└── shims-vue.d.ts
```

Rules
- Pages compose components; components never import pages.
- Shared UI has no business imports; API access will live in services/.
- Pinia only for cross-page shared state (user, preferences, session).
- Nav data is derived from the router table — no duplicated route definitions.
- Migration: React source in `src/components|context|data|engines` is reference-only;
  new slices are Vue; React is removed once slices complete.
