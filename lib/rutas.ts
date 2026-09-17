/**
 * Origen del sitio, para canonicas, hreflang, sitemap y robots.
 *
 * Estuvo fijo en "https://dharmafestcr.com" y salio caro: ese dominio todavia
 * no resuelve, asi que produccion le declaraba a Google que la version buena
 * de cada pagina vivia en un dominio inexistente.
 *
 * El orden es: lo que diga NEXT_PUBLIC_SITIO, si no el dominio de produccion
 * que Vercel expone solo, y si no localhost para desarrollo. Se usa
 * VERCEL_PROJECT_PRODUCTION_URL y NO VERCEL_URL: la segunda cambia en cada
 * despliegue, y una canonica que cambia sola no sirve de canonica.
 *
 * El dia que Dharma pase el dominio real, se agrega en Vercel y esto lo toma
 * sin tocar codigo. Ojo: VERCEL_PROJECT_PRODUCTION_URL no lleva prefijo
 * NEXT_PUBLIC, asi que solo existe del lado del servidor. Hoy alcanza porque
 * este modulo lo importan unicamente metadata, sitemap y robots; si algun dia
 * lo importa un componente de cliente, hay que pasar a NEXT_PUBLIC_SITIO.
 */
function origen(): string {
  const explicito = process.env.NEXT_PUBLIC_SITIO;
  if (explicito) return explicito.replace(/\/$/, "");

  const produccion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (produccion) return `https://${produccion.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const SITIO = origen();

/** Rutas publicas, sin prefijo de idioma. La cadena vacia es la home. */
export const RUTAS = [
  "",
  "/2027",
  "/beneficios",
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
