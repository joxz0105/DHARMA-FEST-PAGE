import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { RUTAS, urlDe } from "@/lib/rutas";

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS.flatMap((ruta) =>
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
