import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { ReglaVertical } from "@/components/ui/ReglaVertical";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function QuienesSomos() {
  const t = useTranslations("home");
  return (
    <Seccion id="quienes-somos">
      <FondoFoto src="2025/2025-dsc9303.jpg" scrim={50} posicion="center 35%" />
      <Kicker>{t("quienesSomosKicker")}</Kicker>
      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
        <TituloDisplay className="text-palido md:basis-2/5">
          {t("quienesSomosTitulo")}
        </TituloDisplay>
        <ReglaVertical />
        <p className="font-texto text-xl leading-relaxed text-hueso/90 md:basis-3/5">
          {t("quienesSomosCuerpo")}
        </p>
      </div>
    </Seccion>
  );
}
