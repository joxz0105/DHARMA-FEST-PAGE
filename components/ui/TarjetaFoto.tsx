import Image from "next/image";

/**
 * Tarjeta de foto con etiqueta, como las del deck.
 *
 * La etiqueta va DEBAJO de la foto, no encima. En la version oscura iba sobre
 * un degradado negro; con el tema claro ese degradado seria una mancha oscura
 * justo de lo que el cliente pidio sacar, y aclararlo dejaba la etiqueta
 * ilegible sobre fotos claras. Fuera de la imagen se lee siempre.
 */
export function TarjetaFoto({
  src,
  alt,
  etiqueta,
  prioridad = false,
}: {
  src: string;
  alt: string;
  etiqueta: string;
  prioridad?: boolean;
}) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-hueso/20">
        <Image
          src={`/img/${src}`}
          alt={alt}
          fill
          priority={prioridad}
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover"
        />
      </div>
      <figcaption className="font-texto text-sm text-hueso/90">{etiqueta}</figcaption>
    </figure>
  );
}
