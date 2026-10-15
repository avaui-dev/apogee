# Apogee

**The AVA design system for Astro.** Atomic components, sections, and patterns —
native to Astro, minimal JS, accessible, ready to compose.

Apogee ships as the default kit inside **[AVA](https://avaui.dev)** (Astro Visual
Admin) and stands alone as a package you can drop into any new or existing Astro
project.

## Install (copy-in)

Components are copied into your project and you own the source. Requires
Tailwind v4.

```sh
npx @ava-ui/apogee init                 # design tokens + config + setup steps
npx @ava-ui/apogee add button dialog    # copies components (+ their deps)
npx @ava-ui/apogee list                 # all available components
```

`add` resolves dependencies for you — `add data-grid` also pulls in `Checkbox`,
and prints the npm packages to install (e.g. `@lucide/astro`). Files land in
`src/components/apogee/` (configurable in `apogee.json`); you own them.

## Use

```astro
---
import Button from '@/components/apogee/Button/Button.astro'
---
<Button>Get started</Button>
<Button variant="outline" color="neutral" size="large">Docs</Button>
```

With AVA, Apogee is offered at scaffold time — no separate install.

## Status

Early. The component set is being built out atom-by-atom (atoms → molecules →
organisms → sections → patterns). Nothing here is stable yet.

## Docs

[apogee.avaui.dev](https://apogee.avaui.dev) *(coming soon)*

## License

MIT © AVA UI
