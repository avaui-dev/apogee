// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import agentFiles from './agent-files.mjs'

// https://astro.build/config
export default defineConfig({
  site: 'https://apogee.avaui.dev',
  redirects: { '/': '/docs' },
  // Bind to every interface so the docs open on a phone on the same network.
  server: { host: true },
  integrations: [mdx(), agentFiles()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Dual theme — light is baked, dark exposed as --shiki-dark; global.css
    // switches on [data-theme="dark"] so code follows the page theme.
    shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' } },
  },
})
