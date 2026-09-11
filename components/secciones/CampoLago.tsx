import Image from "next/image";
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getEspacios, getFotosSede } from "@/lib/contenido";

export function CampoLago() {
  const t = useTranslations("home");
  const espacios = getEspacios();
  const fotos = getFotosSede();

  return (
    <Seccion id="sede">
      <Kicker>{t("sedeKicker")}</Kicker>
      <TituloDisplay className="mt-4 text-verde-hondo">{t("sedeTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-tinta/80">{t("sedeCuerpo")}</p>

      <ul className="mt-10 flex flex-wrap gap-3">
        {espacios.map((espacio) => (
          <li
            key={espacio.slug}
            className="rounded-full border border-tinta/30 px-5 py-2 font-texto text-sm text-tinta/90"
          >
            {espacio.nombre}
          </li>
        ))}
      </ul>

      {/* Las fotos NO van pareadas con los nombres: el deck no dice cual es
          cual, asi que se muestran como galeria de la sede. Ver spec §10.3. */}
      <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {fotos.map((foto) => (
          <li key={foto.archivo} className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={`/img/${foto.archivo}`}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
