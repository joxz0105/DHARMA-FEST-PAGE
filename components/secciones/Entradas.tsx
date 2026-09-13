import { useTranslations } from "next-intl";
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
      <FondoFoto src="2025/2025-dsc9274.jpg" velo={86} posicion="center 40%" />
      <TituloDisplay className="text-verde-hondo">{t("titulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-tinta/90">{t("porTiquetera")}</p>

      {entradasUrl ? (
        <a
          href={entradasUrl}
          className="mt-8 inline-block rounded-full bg-verde px-8 py-4 font-texto text-tinta transition-colors hover:bg-verde/85"
        >
          {t("comprar")}
        </a>
      ) : (
        <p className="mt-4 font-texto text-lg text-verde-texto">{t("proximamente")}</p>
      )}
    </Seccion>
  );
}
