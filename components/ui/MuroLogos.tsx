import Image from "next/image";

/**
 * Muro de logos.
 *
 * Cada logo va dentro de una celda de alto fijo y se ajusta con object-contain.
 * Sin eso, `h-12 w-auto` hace que un logo ancho se vea enorme y uno cuadrado
 * diminuto, porque comparten alto pero no area.
 *
 * Los archivos estan recoloreados a tinta, para fondo claro. Sobre el velo
 * verde se blanquean con un filtro en vez de guardar 65 archivos mas: los
 * logos son monocromos, asi que `brightness-0 invert` da blanco puro y
 * respeta el alfa.
 */
export function MuroLogos({
  logos,
  columnas = "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
  alto = "h-16 md:h-20",
  tono = "tinta",
}: {
  logos: readonly { nombre: string; logo: string }[];
  columnas?: string;
  alto?: string;
  tono?: "tinta" | "hueso";
}) {
  const filtro = tono === "hueso" ? "brightness-0 invert" : "";
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
            className={`max-h-full w-auto max-w-[85%] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100 ${filtro}`}
          />
        </li>
      ))}
    </ul>
  );
}
