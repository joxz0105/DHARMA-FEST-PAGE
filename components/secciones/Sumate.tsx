import { useTranslations } from "next-intl";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Sumate() {
  const t = useTranslations("formularios");
  return (
    <Seccion id="sumate">
      <TituloDisplay className="text-verde-texto">{t("sumateTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-tinta/80">{t("sumateCuerpo")}</p>
      <div className="mt-10">
        <FormComunidad />
      </div>
    </Seccion>
  );
}
