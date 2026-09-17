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
      {/* El antetitulo cae sobre el cielo y la carpa, lo mas claro de la foto:
          con solo el degradado vertical daba 2.55:1. El refuerzo es el mismo
          de FondoFoto — lateral en escritorio, parejo en movil — y va DENTRO
          del velo, porque el test de legibilidad esconde todo lo que viene
          despues de el para fotografiar el fondo. */}
      <div
        aria-hidden
        data-fondo="verde"
        className="absolute inset-0 bg-gradient-to-t from-[rgba(16,26,10,0.8)] via-[rgba(16,26,10,0.55)] to-[rgba(16,26,10,0.28)] md:from-[rgba(16,26,10,0.72)] md:via-[rgba(16,26,10,0.42)] md:to-[rgba(16,26,10,0.18)]"
      >
        <div className="absolute inset-0 bg-[rgba(16,26,10,0.3)] md:hidden" />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(16,26,10,0.6) 0%," +
              " rgba(16,26,10,0.36) 50%, rgba(16,26,10,0) 85%)",
          }}
        />
      </div>
      <div className="relative z-10 w-full px-6 pb-24 md:px-12 lg:px-20">
        <Kicker>{t("heroKicker")}</Kicker>
        <h1 className="mt-6 font-display leading-[0.95]">
          <span className="block text-3xl italic text-palido md:text-4xl">
            {t("heroItalica")}
          </span>
          <span className="block text-5xl text-hueso md:text-7xl lg:text-8xl">
            {t("heroTitulo")}
          </span>
        </h1>
        <p className="mt-8 max-w-2xl font-texto text-lg leading-relaxed text-hueso/90">
          {t("heroCuerpo")}
        </p>
      </div>
    </section>
  );
}
