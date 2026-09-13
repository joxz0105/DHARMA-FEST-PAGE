import { useTranslations } from "next-intl";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Sumate() {
  const t = useTranslations("formularios");
  return (
    <Seccion id="sumate">
      <FondoFoto src="2025/2025-dsc8912.jpg" velo={89} posicion="center 30%" />
      <TituloDisplay className="text-verde-texto">{t("sumateTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-tinta/80">{t("sumateCuerpo")}</p>
      <div className="mt-10">
        <FormComunidad />
      </div>
    </Seccion>
  );
}
