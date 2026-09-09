export const SITIO = "https://dharmafestcr.com";

/** Rutas publicas, sin prefijo de idioma. La cadena vacia es la home. */
export const RUTAS = [
  "",
  "/2027",
  "/road-to-dharma",
  "/patrocinios",
  "/nosotros",
  "/privacidad",
] as const;

export function urlDe(ruta: string, idioma: string): string {
  const prefijo = idioma === "es" ? "" : `/${idioma}`;
  return `${SITIO}${prefijo}${ruta}`;
}

/** Bloque de metadata que declara canonica y alternativas de idioma. */
export function alternativas(ruta: string, idioma: string) {
  return {
    canonical: urlDe(ruta, idioma),
    languages: {
      es: urlDe(ruta, "es"),
      en: urlDe(ruta, "en"),
    },
  };
}
