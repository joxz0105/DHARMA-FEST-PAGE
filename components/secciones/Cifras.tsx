import { useTranslations } from "next-intl";
import { Cifra } from "@/components/ui/Cifra";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getCifras } from "@/lib/contenido";

export function Cifras() {
  const t = useTranslations("home");
  const cifras = getCifras();

  return (
    <Seccion id="cifras">
      <FondoSelva opacidad={0.25} />
      <TituloDisplay className="text-center text-lima">{t("cifrasTitulo")}</TituloDisplay>
      <div className="mt-16 grid gap-12 md:grid-cols-3">
        <Cifra valor={cifras.personas} prefijo="+" rotulo={t("cifrasPersonas")} />
        <Cifra valor={cifras.experienciasAnuales} prefijo="+" rotulo={t("cifrasExperiencias")} />
        <Cifra valor={cifras.crecimiento} sufijo="%" rotulo={t("cifrasCrecimiento")} />
      </div>
      <p className="mt-14 text-center font-texto text-hueso/80">{t("cifrasBase")}</p>
    </Seccion>
  );
}
