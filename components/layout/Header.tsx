import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MenuMovil } from "./MenuMovil";
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
        {/* Logotipo oficial, vectorial, sacado del manual de marca que entrego
            el cliente (DharmaFest-LogoEditable). Version verde, para claro. */}
        <Image
          src="/img/logo-dharmafest.svg"
          alt="Dharma Fest"
          width={210}
          height={72}
          priority
          className="h-9 w-auto md:h-11"
        />
      </Link>

      <nav aria-label={t("inicio")} className="hidden gap-8 font-texto text-sm lg:flex">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="text-tinta/80 transition-colors hover:text-verde-texto"
          >
            {enlace.texto}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <SelectorIdioma />
        <MenuMovil enlaces={enlaces} />
      </div>
    </header>
  );
}
