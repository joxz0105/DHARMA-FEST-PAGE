import { useTranslations } from "next-intl";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Sumate() {
  const t = useTranslations("formularios");
  return (
    <Seccion id="sumate">
      <TituloDisplay className="text-lima">{t("sumateTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/85">{t("sumateCuerpo")}</p>
      <div className="mt-10">
        <FormComunidad />
      </div>
    </Seccion>
  );
}
