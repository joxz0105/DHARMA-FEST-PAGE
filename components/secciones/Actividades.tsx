import { useLocale, useTranslations } from "next-intl";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { Seccion } from "@/components/ui/Seccion";
import { TarjetaFoto } from "@/components/ui/TarjetaFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getActividades } from "@/lib/contenido";

export function Actividades() {
  const t = useTranslations("home");
  const idioma = useLocale() as "es" | "en";
  const actividades = getActividades();

  return (
    <Seccion id="actividades">
      <FondoSelva />
      <TituloDisplay className="text-center text-lima-humo">
        {t("actividadesTitulo")}
      </TituloDisplay>
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
        {actividades.map((actividad) => (
          <li key={actividad.slug}>
            <TarjetaFoto
              src={actividad.imagen}
              alt={actividad.nombre[idioma]}
              etiqueta={actividad.nombre[idioma]}
            />
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
