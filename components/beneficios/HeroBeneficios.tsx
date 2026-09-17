import { FondoFoto } from "@/components/ui/FondoFoto";
import { Kicker } from "@/components/ui/Kicker";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

/**
 * Encabezado de Beneficios Dharma y de cada categoria.
 *
 * Mas bajo que los heroes del resto del sitio a proposito: esto es un
 * catalogo, y quien entra quiere llegar a las tarjetas. Pero no puede faltar
 * la foto: la cabecera del sitio flota en blanco encima, y sobre un fondo
 * claro los enlaces desaparecerian.
 */
export function HeroBeneficios({
  foto,
  scrim,
  posicion,
  kicker,
  titulo,
  bajada,
}: {
  foto: string;
  scrim: number;
  posicion?: string;
  kicker: string;
  titulo: string;
  bajada: string;
}) {
  return (
    <section className="relative flex min-h-[60vh] items-end overflow-hidden">
      <FondoFoto src={foto} scrim={scrim} modo="abajo" posicion={posicion} />
      <div className="w-full px-6 pb-16 pt-40 md:px-12 lg:px-20">
        <Kicker>{kicker}</Kicker>
        {/* A 320px, "Alimentacion" en 48px medía 299 en una caja de 272 y el
            overflow-hidden del hero le cortaba la ultima letra. Se baja a 36px
            en pantallas chicas y, si igual no entra (texto agrandado), se
            parte con guion en vez de cortarse. */}
        <TituloDisplay como="h1" className="mt-4 hyphens-auto wrap-break-word text-palido max-sm:text-4xl">
          {titulo}
        </TituloDisplay>
        <p className="mt-6 max-w-2xl font-texto text-lg leading-relaxed text-hueso/90">{bajada}</p>
      </div>
    </section>
  );
}
