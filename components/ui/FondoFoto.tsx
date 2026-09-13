import Image from "next/image";

/**
 * Foto de fondo de seccion con velo claro.
 *
 * El cliente pidio evitar los bloques planos de blanco y usar imagenes de
 * fondo, como hace el deck. El velo tiene que ser fuerte: encima va texto en
 * tinta, y sobre una foto sin velo no se lee. `velo` sube o baja segun lo
 * cargada que sea la foto.
 *
 * Decorativa: alt vacio. La seccion ya se anuncia con su titulo.
 */
export function FondoFoto({
  src,
  velo = 88,
  posicion = "center",
}: {
  src: string;
  velo?: number;
  posicion?: string;
}) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src={`/img/${src}`}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: posicion }}
      />
      <div className="absolute inset-0 bg-papel" style={{ opacity: velo / 100 }} />
    </div>
  );
}
