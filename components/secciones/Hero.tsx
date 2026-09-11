import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Hero({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const base = locale === "es" ? "" : `/${locale}`;

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      <Image
        src="/img/portada-01.jpg"
        alt={t("heroFotoAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-papel via-papel/55 to-transparent"
      />
      <div className="relative z-10 w-full px-6 pb-24 md:px-12 lg:px-20">
        <h1 className="font-display text-6xl leading-[0.9] text-tinta md:text-8xl lg:text-9xl">
          Dharma<em className="italic">fest</em>
        </h1>
        <p className="mt-6 font-texto text-lg text-verde-hondo md:text-xl">{t("heroDatos")}</p>
        <Link
          href={`${base}/#sumate`}
          className="mt-10 inline-block rounded-full bg-verde px-8 py-4 font-texto text-tinta transition-colors hover:bg-verde/85"
        >
          {t("heroCta")}
        </Link>
      </div>
    </section>
  );
}
