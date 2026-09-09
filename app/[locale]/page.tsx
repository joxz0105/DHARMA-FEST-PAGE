import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

function Contenido() {
  const t = useTranslations("nav");
  return (
    <main id="contenido" tabIndex={-1}>
      <h1 className="font-display text-6xl text-lima">Dharma Fest</h1>
      <p className="font-texto text-hueso/80">{t("inicio")}</p>
    </main>
  );
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Contenido />;
}
