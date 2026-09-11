import Image from "next/image";
import { getTexturaFondo } from "@/lib/contenido";

const textura = getTexturaFondo();

/**
 * Fondo suave de seccion.
 *
 * En la version oscura esto era la textura de selva del deck a plena vista. El
 * cliente pidio que nada se vea oscuro, asi que ahora la textura queda muy
 * tenue sobre el verde palido del manual: se intuye el follaje sin bajar la
 * luz de la pagina. Decorativa: alt vacio.
 */
export function FondoSelva({ opacidad = 0.12 }: { opacidad?: number }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-palido/45">
      {textura ? (
        <Image
          src={`/img/${textura.archivo}`}
          alt=""
          fill
          sizes="100vw"
          style={{ opacity: opacidad }}
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-papel via-papel/40 to-papel" />
    </div>
  );
}
