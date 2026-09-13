import { useTranslations } from "next-intl";
import { MuroLogos } from "@/components/ui/MuroLogos";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getAsociaciones } from "@/lib/contenido";

export function ImpactoSocial() {
  const t = useTranslations("home");
  return (
    <Seccion id="impacto">
      <FondoFoto src="2025/2025-dsc9358.jpg" velo={90} />
      <TituloDisplay className="text-verde-hondo">{t("impactoTitulo")}</TituloDisplay>
      <p className="mt-2 font-display text-3xl italic text-verde-hondo">{t("impactoSubtitulo")}</p>
      <p className="mt-6 max-w-xl font-texto text-lg text-tinta/80">{t("impactoCuerpo")}</p>
      <div className="mt-14">
        <MuroLogos
          logos={getAsociaciones()}
          columnas="grid-cols-2 md:grid-cols-4"
          alto="h-24 md:h-28"
        />
      </div>
    </Seccion>
  );
}
