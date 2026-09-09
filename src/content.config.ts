import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const experiencias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiencias' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      lang: z.enum(['es', 'en']),
      fecha: z.date(),
      estado: z.enum(['proxima', 'pasada']),
      lugar: z.string().default('Campo Lago'),
      resumen: z.string().max(200),
      portada: image(),
      // Sin alt no hay build. Restricción global, aplicada por esquema.
      portadaAlt: z.string().min(1, 'Toda portada necesita texto alternativo'),
      galeria: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
      aliados: z.array(z.string()).default([]),
      ctaUrl: z.string().url().optional(),
      destacada: z.boolean().default(false),
    }),
});

const marcas = defineCollection({
  loader: file('./src/content/marcas/marcas.json'),
  schema: z.object({
    nombre: z.string(),
    instagram: z.string(),
    url: z.string().url().optional(),
    logo: z.string().optional(),
    categoria: z.enum([
      'charlas', 'artistas', 'mercadito', 'actividades',
      'gastronomia', 'asociaciones', 'entretenimiento',
    ]),
    ediciones: z.array(z.number().int()),
    // Restricción global: nada de terceros se publica sin permiso explícito.
    permiso: z.boolean().default(false),
  }),
});

const testimonios = defineCollection({
  loader: file('./src/content/testimonios/testimonios.json'),
  schema: z.object({
    cita: z.string(),
    autor: z.string(),
    handle: z.string(),
    lang: z.enum(['es', 'en']),
    permiso: z.boolean().default(false),
  }),
});

export const collections = { experiencias, marcas, testimonios };
