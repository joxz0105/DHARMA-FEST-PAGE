import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SelectorIdioma } from "./SelectorIdioma";

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const base = locale === "es" ? "" : `/${locale}`;

  const enlaces = [
    { href: `${base}/2027`, texto: t("festival") },
    { href: `${base}/road-to-dharma`, texto: t("road") },
    { href: `${base}/patrocinios`, texto: t("patrocinios") },
    { href: `${base}/nosotros`, texto: t("nosotros") },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-6 px-6 py-6 md:px-12">
      <Link href={base || "/"} aria-label="Dharma Fest">
        {/* portada-03 es el logotipo de Dharma. El de Camp Lago es portada-02. */}
        <Image
          src="/img/portada-03.png"
          alt="Dharma Fest"
          width={200}
          height={96}
          priority
          className="h-10 w-auto object-contain"
        />
      </Link>

      <nav aria-label={t("inicio")} className="hidden gap-8 font-texto text-sm lg:flex">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="text-hueso/85 transition-colors hover:text-lima"
          >
            {enlace.texto}
          </Link>
        ))}
      </nav>

      <SelectorIdioma />
    </header>
  );
}
