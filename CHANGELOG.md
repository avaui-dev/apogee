# Changelog

All notable changes to Apogee are documented here.
Format: [Keep a Changelog](https://keepachangelog.com); versioning: [SemVer](https://semver.org).

## [0.2.0] — 2026-09-24

### Added

- **Font tokens** — `--font-sans` / `--font-mono` in `@theme` (system stacks by
  default, no visual change), plus `--spacing-section-xl`.
- **Dropdown, ContextMenu** — arrow-key / Home / End menu navigation.
- **NavLink** — optional leading/trailing slots for icons and badges.
- **Registry** — `usesJs` flag per component (detected from `<script>`).

### Changed

- **Section** — `space` now uses the fluid `py-section*` tokens instead of fixed
  breakpoint steps. Vertical padding will look slightly different.
- **Table** — headers are start-aligned, semibold, and use the foreground colour.
- **NavLink** — subtle hover fill, stronger active fill.

### Fixed

- **Works without JS:** Navbar and Sidebar keep their nav reachable; PinInput,
  TagInput and RichTextEditor still submit their values.
- **Dialog** — `aria-labelledby` points at the title.
- **Popover, Skeleton, Spinner** — respect `prefers-reduced-motion`.
- **NumberInput** — `disabled` also disables the steppers.
- **Avatar** — a broken `src` falls back to initials; no `src` and no name shows
  a user icon.
- **FileUpload** — a consumer-passed `id` no longer breaks the label link.

## [0.1.0] — 2026-09-16

First public release. Early — the API may still change before 1.0.

### Added

- **~75 copy-in Astro components** across atoms, forms, layout, interactive,
  navigation, data, and extras. Every component is accessible (keyboard, ARIA,
  visible focus, `prefers-reduced-motion`), responsive, and ships **zero external
  JavaScript** — interactivity is native-first, with progressive-enhancement
  islands gated by `no-js:`.
- **Design tokens** (Tailwind v4 `@theme`): semantic colours with light/dark
  override, fluid type scale, fluid layout spacing (`px-gutter`, `py-section*`),
  motion tokens (`--duration-*`, `ease-smooth`/`emphasized`), radius.
- **CLI** — `apogee init` / `add` / `list`, with transitive dependency
  resolution and a generated registry index. Dependency-free.
- **AA contrast gate** — `npm run check:contrast` computes WCAG ratios from the
  real tokens and fails on any miss (runs on `prepublishOnly`).
- **RTL support** — logical properties throughout; directional icons flip.

[0.2.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.2.0
[0.1.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.1.0
