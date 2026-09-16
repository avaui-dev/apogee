# Apogee playground

Local preview app for developing components. Not published; not part of the
distributed package.

```sh
npm run dev     # http://localhost:4321
```

## Workflow

1. Build a component in `../registry/components/<Name>/`.
2. Add a showcase page `src/pages/<name>.astro` using the showcase helpers, and
   render **every** variant / size / state / composable option.
3. Link it from `src/pages/index.astro`.

## Showcase convention (`src/showcase/`)

- **`<ShowcasePage title>`** — page shell; draws a divider between each component.
- **`<Showcase name summary>`** — one component, with its heading.
- **`<Group label stack?>`** — a labeled set of examples laid out **side by side,
  wrapping when needed** (`stack` for full-width items).

```astro
<ShowcasePage title="Button">
  <Showcase name="Button" summary="…">
    <Group label="Variants"> …every variant… </Group>
    <Group label="Sizes"> …every size… </Group>
  </Showcase>
  <!-- more <Showcase> = auto divider between them -->
</ShowcasePage>
```

Rule: show all variants/options at once, never one example. Multiple components
on a page are separated by a divider automatically.

Astro + Tailwind v4 (`@tailwindcss/vite`). Design tokens live in
`src/styles/global.css` under `@theme` (added in Phase 0).
