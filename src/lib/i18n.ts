export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'es';

/** Idiomas que llevan prefijo en la URL. El idioma por defecto vive en la raíz. */
const PREFIJADOS = LANGS.filter((l) => l !== DEFAULT_LANG);

function prefijoDe(pathname: string): Lang | null {
  for (const lang of PREFIJADOS) {
    // El segmento debe estar completo: /en y /en/... sí, /encuentros no.
    if (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)) {
      return lang;
    }
  }
  return null;
}

export function langFromUrl(url: URL): Lang {
  return prefijoDe(url.pathname) ?? DEFAULT_LANG;
}

/** Devuelve la ruta canónica: sin prefijo de idioma, siempre con barra inicial. */
export function stripLangPrefix(pathname: string): string {
  const lang = prefijoDe(pathname);
  if (!lang) return pathname;

  const resto = pathname.slice(`/${lang}`.length);
  return resto === '' || resto === '/' ? '/' : resto;
}

/** Convierte una ruta (canónica o ya localizada) a su forma en `lang`. */
export function localizePath(path: string, lang: Lang): string {
  const canonica = stripLangPrefix(path);

  if (lang === DEFAULT_LANG) return canonica;
  return canonica === '/' ? `/${lang}/` : `/${lang}${canonica}`;
}

/** Las dos versiones de una misma página, para hreflang y el conmutador. */
export function alternates(path: string): { lang: Lang; href: string }[] {
  const canonica = stripLangPrefix(path);
  return LANGS.map((lang) => ({ lang, href: localizePath(canonica, lang) }));
}
