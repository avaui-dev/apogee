# Apogee playground

The docs site and local preview app. Not part of the npm package.

```sh
npm run dev     # http://localhost:4321
```

## Pages

- `/docs/*`: one page per component, section and block family, from `src/content/docs/`.
- `/examples/*`: each block on its own page; the docs load these in their previews.
- `/rtl`: components under `dir="rtl"`, for checking mirroring. The behaviour and a11y tests use it.
- `/showcase/*`: a demo site built from sections. The tests use it and the docs screenshots come from it.

Astro + Tailwind v4 (`@tailwindcss/vite`).
