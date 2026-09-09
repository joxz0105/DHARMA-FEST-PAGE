import Image from "next/image";

/**
 * Muro de logos.
 *
 * Cada logo va dentro de una celda de alto fijo y se ajusta con object-contain.
 * Sin eso, `h-12 w-auto` hace que un logo ancho (ZUMBA, PEJI BAR) se vea enorme
 * y uno cuadrado (SALT, ápika) diminuto, porque comparten alto pero no area.
 */
export function MuroLogos({
  logos,
  columnas = "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
  alto = "h-16 md:h-20",
}: {
  logos: readonly { nombre: string; logo: string }[];
  columnas?: string;
  alto?: string;
}) {
  return (
    <ul className={`grid gap-x-8 gap-y-10 ${columnas}`}>
      {logos.map((marca) => (
        <li key={marca.logo} className={`flex ${alto} items-center justify-center`}>
          <Image
            src={`/img/${marca.logo}`}
            alt={marca.nombre}
            width={240}
            height={120}
            sizes="240px"
            className="max-h-full w-auto max-w-[85%] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  );
}
