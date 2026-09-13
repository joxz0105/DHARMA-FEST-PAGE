import { useTranslations } from "next-intl";
import { Boton } from "@/components/ui/Boton";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getSitio } from "@/lib/contenido";

/**
 * Entradas.
 *
 * El festival no vende desde el sitio: va por una tiquetera externa. Hasta que
 * el cliente pase el link, la seccion lo dice en vez de fingir un boton que no
 * lleva a ningun lado. El dia que llegue, se pone `entradasUrl` en
 * content/sitio.json y aparece el boton, sin tocar codigo.
 */
export function Entradas() {
  const t = useTranslations("entradas");
  const { entradasUrl } = getSitio();

  return (
    <Seccion id="entradas">
      <FondoFoto src="2025/2025-dsc9274.jpg" scrim={54} posicion="center 40%" />
      <TituloDisplay className="text-palido">{t("titulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/90">{t("porTiquetera")}</p>

      {entradasUrl ? (
        <Boton href={entradasUrl} className="mt-8">{t("comprar")}</Boton>
      ) : (
        <p className="mt-4 font-texto text-lg text-palido">{t("proximamente")}</p>
      )}
    </Seccion>
  );
}
