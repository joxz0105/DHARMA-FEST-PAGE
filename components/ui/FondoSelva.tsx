import Image from "next/image";
import { getTexturaFondo } from "@/lib/contenido";

const textura = getTexturaFondo();

/** La textura de selva que el deck repite como fondo. Decorativa: alt vacío. */
export function FondoSelva({ opacidad = 0.35 }: { opacidad?: number }) {
  if (!textura) return null;
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src={`/img/${textura.archivo}`}
        alt=""
        fill
        sizes="100vw"
        style={{ opacity: opacidad }}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-noche/70 via-noche/50 to-noche" />
    </div>
  );
}
