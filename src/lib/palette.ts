export type NombreToken =
  | 'bosque'
  | 'bosqueDeep'
  | 'salvia'
  | 'lino'
  | 'arena'
  | 'piedra'
  | 'copal'
  | 'copalInk';

/** Fuente de verdad de la paleta. `src/styles/tokens.css` debe reflejarla. */
export const PALETA: Record<NombreToken, string> = {
  bosque: '#1E3527',
  bosqueDeep: '#16281D',
  salvia: '#4A5B4F',
  lino: '#F6F2E9',
  arena: '#D9CFBB',
  piedra: '#61563E',
  copal: '#E38B4A',
  copalInk: '#854417',
};

/** Nombre del token tal como aparece en tokens.css, p. ej. `--color-bosque-deep`. */
export const TOKEN_CSS: Record<NombreToken, string> = {
  bosque: '--color-bosque',
  bosqueDeep: '--color-bosque-deep',
  salvia: '--color-salvia',
  lino: '--color-lino',
  arena: '--color-arena',
  piedra: '--color-piedra',
  copal: '--color-copal',
  copalInk: '--color-copal-ink',
};
