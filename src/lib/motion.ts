const PASO_MS = 80;
const TOPE_MS = 400;

/** Restricción global: `prefers-reduced-motion` manda sobre cualquier animación. */
export function debeAnimar(reduceMotion: boolean): boolean {
  return !reduceMotion;
}

/** Retraso de entrada del elemento `indice`, con tope para listas largas. */
export function retrasoEscalonado(indice: number): number {
  return Math.min(indice * PASO_MS, TOPE_MS);
}
