"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TarjetaBeneficio, type DatosTarjeta } from "./TarjetaBeneficio";

type Orden = "relevancia" | "descuento" | "marca";

/**
 * Conteo, selector de orden y grilla.
 *
 * Es lo unico del catalogo que corre en el navegador, y solo por el "Ordenar":
 * los filtros por categoria son enlaces a paginas propias, que se pueden
 * compartir y que Google indexa. Arranca en "Relevancia", que es el orden del
 * JSON, asi que lo que pinta el servidor y lo que hidrata el cliente coinciden.
 */
export function GrillaBeneficios({ tarjetas }: { tarjetas: DatosTarjeta[] }) {
  const t = useTranslations("beneficios");
  const idioma = useLocale();
  const [orden, setOrden] = useState<Orden>("relevancia");

  const ordenadas = useMemo(() => {
    const copia = [...tarjetas];
    if (orden === "descuento") {
      copia.sort((a, b) => b.descuento - a.descuento || a.orden - b.orden);
    } else if (orden === "marca") {
      copia.sort((a, b) => a.marca.localeCompare(b.marca, idioma, { sensitivity: "base" }));
    } else {
      copia.sort((a, b) => a.orden - b.orden);
    }
    return copia;
  }, [tarjetas, orden, idioma]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-tinta/10 pb-4">
        <p className="font-texto text-tinta">
          {t.rich("resultados", {
            n: tarjetas.length,
            b: (partes) => <strong className="font-bold">{partes}</strong>,
          })}
        </p>
        <label className="flex items-center gap-3 font-texto text-tinta/75">
          {t("ordenar")}
          {/* Borde en tinta al 55%: un control necesita 3:1 contra el fondo
              para que se reconozca. Al 25% daba 1.7. */}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="rounded-lg border border-tinta/55 bg-papel px-3 py-2 text-tinta"
          >
            <option value="relevancia">{t("ordenRelevancia")}</option>
            <option value="descuento">{t("ordenDescuento")}</option>
            <option value="marca">{t("ordenMarca")}</option>
          </select>
        </label>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {ordenadas.map((tarjeta) => (
          <li key={tarjeta.clave} data-tarjeta-beneficio>
            <TarjetaBeneficio {...tarjeta} />
          </li>
        ))}
      </ul>
    </>
  );
}
