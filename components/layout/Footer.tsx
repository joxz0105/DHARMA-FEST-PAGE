import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("pie");
  const base = locale === "es" ? "" : `/${locale}`;

  return (
    <footer className="border-t border-tinta/15 px-6 py-12 font-texto text-sm md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-tinta/65">
          © {new Date().getFullYear()} {t("derechos")}
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="https://instagram.com/dharma_festcr"
            className="text-tinta/65 transition-colors hover:text-verde-texto"
          >
            @dharma_festcr
          </a>
          <a
            href="mailto:info@dharmafestcr.com"
            className="text-tinta/65 transition-colors hover:text-verde-texto"
          >
            info@dharmafestcr.com
          </a>
          <Link
            href={`${base}/privacidad`}
            className="text-tinta/65 transition-colors hover:text-verde-texto"
          >
            {t("privacidad")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
