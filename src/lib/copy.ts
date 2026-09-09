import type { Lang } from './i18n';
import es from '../content/sitio/es.json';
import en from '../content/sitio/en.json';

/** El español es la referencia estructural; el inglés debe calzar. */
export type Copy = typeof es;

const COPY: Record<Lang, Copy> = { es, en: en as Copy };

export function getCopy(lang: Lang): Copy {
  return COPY[lang];
}
