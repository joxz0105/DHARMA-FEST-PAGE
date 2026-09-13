import Link from "next/link";

/**
 * Boton de accion.
 *
 * El cliente dijo que los botones no se distinguian, y tenia razon con un
 * motivo medible: el relleno verde de marca (#71B725) contra la pagina blanca
 * da 2.47:1, y la norma pide 3:1 para que se reconozca el borde de un control.
 * El borde en verde hondo lo resuelve (6.95:1) sin perder el verde de marca.
 *
 * El texto va en tinta sobre el relleno: 6.11:1. En blanco daria 2.47 y no se
 * leeria.
 */
const BASE =
  "inline-block rounded-full border-2 border-verde-hondo bg-verde px-8 py-3.5 font-texto font-medium text-tinta transition-colors hover:bg-palido focus-visible:outline-offset-4";

export function Boton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const externo = href.startsWith("http");
  if (externo) {
    return (
      <a href={href} className={`${BASE} ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${BASE} ${className}`}>
      {children}
    </Link>
  );
}

/** Mismo aspecto, para los envios de formulario. */
export function BotonEnvio({
  pendiente,
  children,
}: {
  pendiente?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button type="submit" disabled={pendiente} className={`${BASE} self-start disabled:opacity-60`}>
      {children}
    </button>
  );
}
