import type { Lang } from './i18n';

/** Forma mínima que necesitan estas consultas. Evita acoplarlas a astro:content. */
export interface ExperienciaLike {
  slug: string;
  lang: Lang;
  fecha: Date;
  estado: 'proxima' | 'pasada';
}

/** Experiencias de un idioma, de la más reciente a la más antigua. */
export function experienciasDe<T extends ExperienciaLike>(todas: T[], lang: Lang): T[] {
  return todas
    .filter((e) => e.lang === lang)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/**
 * La próxima experiencia del idioma, o null si no hay ninguna anunciada.
 * Si hay varias marcadas como próximas, devuelve la MÁS CERCANA en el tiempo:
 * `experienciasDe` ordena de más reciente a más antigua, así que hay que tomar
 * la última de las próximas, no la primera.
 */
export function proximaExperiencia<T extends ExperienciaLike>(todas: T[], lang: Lang): T | null {
  const proximas = experienciasDe(todas, lang).filter((e) => e.estado === 'proxima');
  return proximas.at(-1) ?? null;
}

/**
 * Filtra contenido de terceros sin permiso explícito.
 * Testimonios y logos de marcas pasan siempre por acá.
 */
export function publicables<T extends { permiso: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.permiso);
}
