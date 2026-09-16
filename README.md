# Apogee

**The AVA design system for Astro.** Atomic components, sections, and patterns —
native to Astro, minimal JS, accessible, ready to compose.

Apogee ships as the default kit inside **[AVA](https://avaui.dev)** (Astro Visual
Admin) and stands alone as a package you can drop into any new or existing Astro
project.

## Install (copy-in)

Components are copied into your project — you own the source (shadcn / Starwind
model). Requires Tailwind v4.

```sh
npx @ava-ui/apogee init          # design tokens + Tailwind setup
npx @ava-ui/apogee add button    # copies Button into your project
```

> The CLI is in progress. Today the components live in `registry/`, and the
> `playground/` app renders them live (`cd playground && npm run dev`).

## Use

```astro
---
import Button from '@/components/apogee/Button.astro'
---
<Button variant="primary">Get started</Button>
```

With AVA, Apogee is offered at scaffold time — no separate install.

## Status

Early. The component set is being built out atom-by-atom (atoms → molecules →
organisms → sections → patterns). Nothing here is stable yet.

## Docs

[apogee.avaui.dev](https://apogee.avaui.dev) *(coming soon)*

## License

MIT © AVA UI
