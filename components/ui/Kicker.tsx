/**
 * Antetitulo corto sobre foto.
 *
 * Va en hueso pleno, no al 80%: es texto de 14px y necesita 4.5:1. Al 80% se
 * caia en cuanto la foto aclaraba un poco (4.24:1 sobre un fondo de luminancia
 * 0.13). No se noto antes porque el test de legibilidad no sabia leer colores
 * con opacidad y los aprobaba sin medirlos.
 */
export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-texto text-sm tracking-wide text-hueso">{children}</p>;
}
