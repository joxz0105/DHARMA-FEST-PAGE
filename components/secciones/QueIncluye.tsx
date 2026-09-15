import Link from "next/link";
import { useTranslations } from "next-intl";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Kicker } from "@/components/ui/Kicker";
import { MuroLogos } from "@/components/ui/MuroLogos";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getBeneficios } from "@/lib/contenido";

/**
 * Que incluye tu entrada.
 *
 * Primer tiempo del programa de beneficios. Cuenta el MECANISMO, no las
 * ofertas: ninguna marca prometida por nombre, ningun porcentaje, ninguna
 * vigencia. Por eso se puede publicar hoy, sin una sola marca confirmada, y
 * no hay nada exigible bajo el art. 113 del reglamento a la Ley 7472 — que
 * es lo que si pasa al publicar el descuento concreto de un tercero.
 *
 * El segundo tiempo es /beneficios, con el catalogo marca por marca. Cuando
 * exista, el enlace del pie apunta ahi en vez de a #entradas.
 *
 * Va entre Actividades y Entradas a proposito: primero se construye el valor
 * y despues aparece el boton de comprar, no al reves.
 *
 * PENDIENTE DEL CLIENTE: las regalias estan documentadas para 2025 (Nikkos
 * repartio 1.000, mas Brixta, doTERRA y Ecomuna). Falta que Dharma confirme
 * que se repiten en 2027. Por eso el copy describe como funciona el festival
 * y no promete ninguna marca ni cantidad.
 */
export function QueIncluye() {
  const t = useTranslations("beneficios");
  const { rangoDescuento, marcas } = getBeneficios();

  const puntos = [
    ["stands", t("standsTitulo"), t("standsCuerpo")],
    ["llegada", t("llegadaTitulo"), t("llegadaCuerpo")],
    ["experiencia", t("experienciaTitulo"), t("experienciaCuerpo")],
  ] as const;

  return (
    <Seccion id="que-incluye">
      {/* La foto no es de relleno: es una persona del festival 2025 con el
          brazalete verde puesto, que es el mecanismo de canje que describe la
          seccion. Al 28% el recorte de escritorio se queda en la cara y la
          muneca no entra; en movil la seccion es mas alta y el brazalete si
          se ve. Se prefiere el rostro: baja el brazalete y se pierde la foto. */}
      <FondoFoto src="2025/2025-dsc9370.jpg" scrim={48} posicion="center 28%" />

      <Kicker>{t("kicker")}</Kicker>
      <TituloDisplay className="mt-6 text-palido">{t("titulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/90">{t("cuerpo")}</p>

      {/* Topado a 6xl a proposito: FondoFoto oscurece la izquierda y deja el
          borde derecho luminoso, asi que una tercera columna a todo el ancho
          cae justo en la zona mas clara de la foto. */}
      <ul className="mt-16 grid max-w-6xl gap-10 md:grid-cols-3">
        {puntos.map(([clave, titulo, cuerpo]) => (
          <li key={clave} className="border-t border-hueso/30 pt-6">
            <h3 className="font-display text-3xl text-hueso">{titulo}</h3>
            <p className="mt-3 font-texto text-base text-hueso/80">{cuerpo}</p>
          </li>
        ))}
      </ul>

      {/* El descuento se declara como RANGO DEL PROGRAMA, no como porcentaje
          pegado a cada logo. Un numero junto a una marca es una oferta
          concreta de un tercero y la vuelve exigible; el desglose por marca
          va en /beneficios, donde cada linea carga condiciones y vigencia.

          PENDIENTE DEL CLIENTE: las marcas de beneficios.json todavia no han
          confirmado nada. Ver la nota del JSON antes de publicar. */}
      <div className="mt-16 max-w-6xl border-t border-hueso/30 pt-6">
        <h3 className="font-display text-3xl text-hueso">{t("descuentoTitulo")}</h3>
        <p className="mt-3 max-w-2xl font-texto text-lg text-palido">
          {t("descuento", { min: rangoDescuento.min, max: rangoDescuento.max })}
        </p>

        <p className="mt-10 font-texto text-sm text-hueso/75">{t("marcasAliadas")}</p>
        {/* tono="hueso" porque los 58 logos vienen recoloreados a tinta para
            fondo claro y sobre la foto desaparecerian. */}
        <div className="mt-6 max-w-3xl">
          <MuroLogos
            logos={marcas}
            columnas="grid-cols-2 sm:grid-cols-4"
            alto="h-14 md:h-16"
            tono="hueso"
          />
        </div>
      </div>

      <p className="mt-14 max-w-xl font-texto text-lg text-palido">{t("brazalete")}</p>
      <Link
        href="#entradas"
        className="mt-6 inline-block border-b border-verde pb-1 font-texto text-palido transition-colors hover:text-verde"
      >
        {t("cta")}
      </Link>
    </Seccion>
  );
}
