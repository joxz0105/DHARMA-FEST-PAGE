import Image from "next/image";

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
    <figure className="relative aspect-[3/4] overflow-hidden rounded-2xl">
      <Image
        src={`/img/${src}`}
        alt={alt}
        fill
        priority={prioridad}
        sizes="(max-width: 768px) 50vw, 20vw"
        className="object-cover"
      />
      {/* El degradado no es adorno: sostiene el contraste de la etiqueta. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-noche via-noche/75 to-transparent"
      />
      <figcaption className="absolute bottom-4 left-4 right-4 font-texto text-sm text-hueso">
        {etiqueta}
      </figcaption>
    </figure>
  );
}
