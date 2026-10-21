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
npx @ava-ui/apogee create my-site       # new Astro + Tailwind site with Apogee set up
npx @ava-ui/apogee init                 # existing project: tokens + config, added to your stylesheet
npx @ava-ui/apogee add button dialog    # copies components (+ their deps)
npx @ava-ui/apogee list                 # all available components
npx @ava-ui/apogee diff                 # your copies vs the package, line by line
npx @ava-ui/apogee update               # take package changes for files you haven't edited
```

The CLI sends an anonymous usage event per command (the command, component names,
versions). Turn it off with `APOGEE_TELEMETRY=0`. Details: [Telemetry](https://apogee.avaui.dev/docs/telemetry).

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

111 components, 23 sections, 503 blocks and 151 full pages. Pre-1.0: a minor
release can change a component's props; the changelog says when.

## Docs

[apogee.avaui.dev](https://apogee.avaui.dev): every component, section and page, with live
examples. Each page is also Markdown at its URL plus `.md`, and
[llms.txt](https://apogee.avaui.dev/llms.txt) indexes them for AI tools.

## License

MIT © AVA UI
