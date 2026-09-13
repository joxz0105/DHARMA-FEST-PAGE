import { useTranslations } from "next-intl";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { MuroLogos } from "@/components/ui/MuroLogos";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getMarcas } from "@/lib/contenido";

export function MarcasQueConfian() {
  const t = useTranslations("home");
  return (
    <Seccion id="marcas">
      <FondoSelva scrim={56} />
      <TituloDisplay className="text-palido">{t("marcasTitulo")}</TituloDisplay>
      <p className="mt-1 font-display text-3xl italic text-palido md:text-4xl">
        {t("marcasSubtitulo")}
      </p>
      <div className="mt-16">
        <MuroLogos logos={getMarcas()} tono="hueso" />
      </div>
    </Seccion>
  );
}
