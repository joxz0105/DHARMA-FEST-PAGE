import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ReglaVertical } from "@/components/ui/ReglaVertical";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function RoadToDharma({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const base = locale === "es" ? "" : `/${locale}`;

  return (
    <section id="road" className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      {/* La foto es vertical: sin bajar el encuadre, el recorte se queda con la
          pared de arriba y pierde a la gente, que es el punto de la seccion. */}
      <Image
        src="/img/road-to-dharma-01.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[center_72%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-papel/72" />
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
        <TituloDisplay className="text-verde-hondo md:basis-2/5">{t("roadTitulo")}</TituloDisplay>
        <ReglaVertical />
        <div className="md:basis-3/5">
          <p className="font-texto text-lg leading-relaxed text-tinta/90">{t("roadCuerpo")}</p>
          <Link
            href={`${base}/road-to-dharma`}
            className="mt-8 inline-block border-b border-verde pb-1 font-texto text-verde-texto transition-colors hover:text-verde-hondo"
          >
            {t("roadCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
