import { useLocale, useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getMedios } from "@/lib/contenido";

export function PlanDeMedios() {
  const t = useTranslations("patrocinios");
  const idioma = useLocale() as "es" | "en";
  const medios = getMedios();

  return (
    <Seccion id="medios">
      <TituloDisplay className="text-verde-hondo">{t("mediosTitulo")}</TituloDisplay>
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="font-texto text-lg font-semibold text-verde-texto">{t("mediosDesde")}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {t("mediosDesdeLista")
              .split("·")
              .map((item) => (
                <li key={item} className="font-texto text-tinta/80">
                  {item.trim()}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h3 className="font-texto text-lg font-semibold text-verde-texto">{t("mediosComo")}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {medios.map((medio) => (
              <li key={medio.es} className="font-texto text-tinta/80">
                {medio[idioma]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Seccion>
  );
}
