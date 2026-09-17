import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getBeneficios } from "@/lib/contenido";
import { RUTAS, urlDe } from "@/lib/rutas";

export default function sitemap(): MetadataRoute.Sitemap {
  // Las categorias de beneficios salen del JSON: una categoria nueva entra al
  // sitemap sola, sin acordarse de tocar este archivo.
  const categorias = getBeneficios().categorias.map((c) => `/beneficios/${c.slug}`);

  return [...RUTAS, ...categorias].flatMap((ruta) =>
    routing.locales.map((idioma) => ({
      url: urlDe(ruta, idioma),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((otro) => [otro, urlDe(ruta, otro)]),
        ),
      },
    })),
  );
}
