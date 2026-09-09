import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // El espanol vive en la raiz, sin prefijo. El ingles bajo /en/.
  localePrefix: "as-needed",
  // Sin deteccion por Accept-Language: la raiz es espanol SIEMPRE.
  // Con deteccion activada, un tico con el navegador en ingles caia en /en,
  // y la home dejaba de tener una version canonica estable para Google.
  // El cambio de idioma es una decision del visitante, no del navegador.
  localeDetection: false,
});

export type Idioma = (typeof routing.locales)[number];
