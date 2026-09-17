import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Boton } from "@/components/ui/Boton";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

/**
 * Cierre del catalogo: como se canjea, la letra chica y el anzuelo para
 * marcas.
 *
 * La condicion dice "cada marca otorga y honra su propio beneficio" y no
 * "Dharma garantiza": lo segundo convertiria a Dharma en obligado directo de
 * un descuento que da un tercero.
 *
 * El bloque de marcas va chico y al final a proposito. La pagina es para el
 * publico; la spec pide que las marcas sean un pie, no una seccion de igual
 * peso.
 */
export function ComoUsar() {
  const t = useTranslations("beneficios");
  const idioma = useLocale();
  const base = idioma === "es" ? "" : `/${idioma}`;
  const pasos = [t("paso1"), t("paso2"), t("paso3")];

  return (
    <Seccion id="como-usar">
      <FondoFoto src="2025/2025-dsc9063.jpg" scrim={48} posicion="center 40%" />
      <TituloDisplay className="text-palido">{t("comoTitulo")}</TituloDisplay>

      <ol className="mt-12 grid max-w-6xl gap-10 md:grid-cols-3">
        {pasos.map((paso, i) => (
          <li key={paso} className="border-t border-hueso/30 pt-6">
            <span aria-hidden className="font-display text-5xl text-palido">
              {i + 1}
            </span>
            <p className="mt-3 font-texto text-lg text-hueso/90">{paso}</p>
          </li>
        ))}
      </ol>

      {/* Texto chico sobre foto: hueso pleno. Al 80% daba 3.98:1 en movil. */}
      <p className="mt-12 max-w-2xl font-texto text-sm text-hueso">{t("condiciones")}</p>
      <Boton href={`${base}/2027#entradas`} className="mt-10">
        {t("cta")}
      </Boton>

      <div className="mt-16 max-w-xl border-t border-hueso/30 pt-6">
        <h3 className="font-display text-3xl text-hueso">{t("marcaTitulo")}</h3>
        <p className="mt-3 font-texto text-base text-hueso">{t("marcaCuerpo")}</p>
        <Link
          href={`${base}/patrocinios#propuesta`}
          className="mt-4 inline-block border-b border-verde pb-1 font-texto text-palido transition-colors hover:text-verde"
        >
          {t("marcaCta")}
        </Link>
      </div>
    </Seccion>
  );
}
