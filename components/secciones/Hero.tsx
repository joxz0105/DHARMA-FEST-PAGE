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
        className="absolute inset-0 bg-gradient-to-t from-noche via-noche/50 to-noche/30"
      />
      <div className="relative z-10 w-full px-6 pb-24 md:px-12 lg:px-20">
        <h1 className="font-display text-6xl leading-[0.9] text-hueso md:text-8xl lg:text-9xl">
          Dharma<em className="italic">fest</em>
        </h1>
        <p className="mt-6 font-texto text-lg text-palido md:text-xl">{t("heroDatos")}</p>
        <Link
          href={`${base}/#sumate`}
          className="mt-10 inline-block rounded-full bg-lima px-8 py-4 font-texto text-noche transition-colors hover:bg-palido"
        >
          {t("heroCta")}
        </Link>
      </div>
    </section>
  );
}
