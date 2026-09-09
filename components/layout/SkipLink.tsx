import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("nav");
  return (
    <a
      href="#contenido"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-lima focus:px-4 focus:py-2 focus:font-texto focus:text-noche"
    >
      {t("saltarAlContenido")}
    </a>
  );
}
