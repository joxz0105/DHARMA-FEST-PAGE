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
      <FondoSelva opacidad={0.2} />
      <TituloDisplay className="text-verde-texto">{t("marcasTitulo")}</TituloDisplay>
      <p className="mt-1 font-display text-3xl italic text-verde-hondo md:text-4xl">
        {t("marcasSubtitulo")}
      </p>
      <div className="mt-16">
        <MuroLogos logos={getMarcas()} />
      </div>
    </Seccion>
  );
}
