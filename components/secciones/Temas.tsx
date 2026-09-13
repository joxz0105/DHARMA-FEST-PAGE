import { useLocale, useTranslations } from "next-intl";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TarjetaFoto } from "@/components/ui/TarjetaFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getTemas } from "@/lib/contenido";

export function Temas() {
  const t = useTranslations("home");
  const idioma = useLocale() as "es" | "en";
  const temas = getTemas();

  return (
    <Seccion id="temas">
      <FondoFoto src="2025/2025-dsc9142.jpg" velo={91} />
      <TituloDisplay className="text-verde-hondo">{t("temasTitulo")}</TituloDisplay>
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {temas.map((tema) => (
          <li key={tema.slug}>
            <TarjetaFoto
              src={tema.imagen}
              alt={tema.nombre[idioma]}
              etiqueta={tema.nombre[idioma]}
            />
          </li>
        ))}
      </ul>
      <p className="mt-12 text-center font-texto text-lg text-tinta/75">{t("temasCierre")}</p>
    </Seccion>
  );
}
