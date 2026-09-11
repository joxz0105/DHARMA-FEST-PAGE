import Image from "next/image";
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";

export function HeroPatrocinios() {
  const t = useTranslations("patrocinios");

  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden">
      <Image
        src="/img/por-que-dharma-01.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-papel via-papel/60 to-transparent"
      />
      <div className="relative z-10 w-full px-6 pb-24 md:px-12 lg:px-20">
        <Kicker>{t("heroKicker")}</Kicker>
        <h1 className="mt-6 font-display leading-[0.95]">
          <span className="block text-3xl italic text-verde-hondo md:text-4xl">
            {t("heroItalica")}
          </span>
          <span className="block text-5xl text-tinta md:text-7xl lg:text-8xl">
            {t("heroTitulo")}
          </span>
        </h1>
        <p className="mt-8 max-w-2xl font-texto text-lg leading-relaxed text-tinta/90">
          {t("heroCuerpo")}
        </p>
      </div>
    </section>
  );
}
