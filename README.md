# Apogee

**The AVA design system for Astro.** Atomic components, sections, and patterns —
native to Astro, minimal JS, accessible, ready to compose.

Apogee ships as the default kit inside **[AVA](https://avaui.dev)** (Astro Visual
Admin) and stands alone as a package you can drop into any new or existing Astro
project.

## Install

```sh
npm i @ava-ui/apogee
```

## Use

```astro
---
import Button from '@ava-ui/apogee/components/Button.astro'
// or, from the barrel:
// import { Button } from '@ava-ui/apogee'
---
<Button variant="primary">Get started</Button>
<Button href="/docs" variant="ghost">Read the docs</Button>
```

With AVA, Apogee is offered at scaffold time — no separate install.

## Status

Early. The component set is being built out atom-by-atom (atoms → molecules →
organisms → sections → patterns). Nothing here is stable yet.

## Docs

[apogee.avaui.dev](https://apogee.avaui.dev) *(coming soon)*

## License

MIT © AVA UI
