import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("pie");
  const base = locale === "es" ? "" : `/${locale}`;

  return (
    <footer className="border-t border-hueso/15 px-6 py-12 font-texto text-sm md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-hueso/70">
          © {new Date().getFullYear()} {t("derechos")}
        </p>
        <div className="flex flex-wrap gap-6">
          <a
            href="https://instagram.com/dharma_festcr"
            className="text-hueso/70 transition-colors hover:text-lima"
          >
            @dharma_festcr
          </a>
          <a
            href="mailto:info@dharmafestcr.com"
            className="text-hueso/70 transition-colors hover:text-lima"
          >
            info@dharmafestcr.com
          </a>
          <Link
            href={`${base}/privacidad`}
            className="text-hueso/70 transition-colors hover:text-lima"
          >
            {t("privacidad")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
