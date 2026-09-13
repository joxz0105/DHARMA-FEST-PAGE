import { FondoFoto } from "./FondoFoto";
import { getTexturaFondo } from "@/lib/contenido";

const textura = getTexturaFondo();

/**
 * Fondo con la textura de selva del deck.
 *
 * Mismo mecanismo que FondoFoto — la foto pone el verde y solo se le baja la
 * luz — con la textura del deck como imagen.
 */
export function FondoSelva({ scrim = 50 }: { scrim?: number }) {
  if (!textura) return null;
  return <FondoFoto src={textura.archivo} scrim={scrim} />;
}
