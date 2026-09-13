import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";
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
      {/* Velo superior: la cabecera flota sobre la foto del hero y sin esto los
          enlaces blancos se pierden en las zonas claras de la imagen. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-velo/85 to-transparent"
      />
      {/* El nombre accesible va en el enlace: las dos imagenes del lockup son
          decorativas, si no el lector de pantalla lo leeria dos veces. */}
      <Link href={base || "/"} aria-label="Campo Lago Dharma Fest">
        <Logo />
      </Link>

      <nav aria-label={t("inicio")} className="hidden gap-8 font-texto text-sm lg:flex">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="text-hueso/90 transition-colors hover:text-verde"
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
