import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    group: z.string().default('Components'),
    order: z.number().default(0),
    /** Sidebar label when it should differ from the title (overview pages). */
    navTitle: z.string().optional(),
    /** Component page ids shown as cards above prev/next. */
    related: z.array(z.string()).optional(),
  }),
})

export const collections = { docs }
