import Image from "next/image";

/**
 * Foto de fondo a color pleno, con un oscurecido para que se lea el texto.
 *
 * El verde lo pone LA FOTO, no un filtro. Antes habia un velo verde plano
 * encima de todo y el cliente lo señalo: quedaba como un celofan, se perdia
 * la imagen y el color dejaba de venir del lugar. Ahora la foto va entera y
 * solo se le baja la luz, con un tono casi negro que oscurece sin teñir.
 *
 * `modo`:
 *   - "abajo": el oscurecido crece hacia el pie. Para heroes, donde el texto
 *     se apoya en la parte inferior y arriba conviene ver la foto limpia.
 *   - "parejo": oscurecido uniforme. Para secciones con texto repartido.
 *
 * Todo lo que vaya encima se pinta en `hueso` o `palido`. Hay un test que lo
 * vigila (tests/e2e/legibilidad.spec.ts), porque axe no sabe calcular
 * contraste sobre una imagen y este fallo se le escapa.
 */
export function FondoFoto({
  src,
  scrim = 52,
  modo = "parejo",
  posicion = "center",
}: {
  src: string;
  scrim?: number;
  modo?: "abajo" | "parejo";
  posicion?: string;
}) {
  const base =
    modo === "abajo"
      ? {
          backgroundImage:
            `linear-gradient(to top, rgba(16,26,10,${scrim / 100}) 0%,` +
            ` rgba(16,26,10,${(scrim * 0.62) / 100}) 45%,` +
            ` rgba(16,26,10,${(scrim * 0.28) / 100}) 100%)`,
        }
      : { backgroundColor: `rgba(16,26,10,${scrim / 100})` };

  return (
    <div aria-hidden data-fondo="verde" className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src={`/img/${src}`}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: posicion }}
      />
      <div className="absolute inset-0" style={base} />
      {/* Refuerzo donde se apoya el texto. Oscurecer la foto entera para
          cubrir una zona clara apagaba todo el color, asi que el refuerzo va
          solo donde hace falta.

          En pantalla ancha el texto vive a la izquierda, asi que el degradado
          es horizontal y el lado derecho de la foto queda luminoso. En movil
          el texto ocupa todo el ancho y ese degradado no lo cubria: ahi el
          refuerzo es parejo. */}
      <div className="absolute inset-0 bg-[rgba(16,26,10,0.3)] md:hidden" />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,26,10,0.42) 0%," +
            " rgba(16,26,10,0.22) 45%, rgba(16,26,10,0) 85%)",
        }}
      />
    </div>
  );
}
