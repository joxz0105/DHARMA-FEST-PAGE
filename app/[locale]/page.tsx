import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternativas } from "@/lib/rutas";
import { Actividades } from "@/components/secciones/Actividades";
import { CampoLago } from "@/components/secciones/CampoLago";
import { Cifras } from "@/components/secciones/Cifras";
import { Entradas } from "@/components/secciones/Entradas";
import { Galeria } from "@/components/secciones/Galeria";
import { Hero } from "@/components/secciones/Hero";
import { ImpactoSocial } from "@/components/secciones/ImpactoSocial";
import { MarcasQueConfian } from "@/components/secciones/MarcasQueConfian";
import { QuienesSomos } from "@/components/secciones/QuienesSomos";
import { RoadToDharma } from "@/components/secciones/RoadToDharma";
import { Sumate } from "@/components/secciones/Sumate";
import { Temas } from "@/components/secciones/Temas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: "Dharma Fest · Campo Lago, Costa Rica",
    description: t("quienesSomosCuerpo"),
    alternates: alternativas("", locale),
    openGraph: {
      title: "Dharma Fest",
      description: t("quienesSomosCuerpo"),
      images: ["/img/portada-01.jpg"],
      locale,
      type: "website",
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="contenido" tabIndex={-1}>
      <Hero locale={locale} />
      <QuienesSomos />
      <Entradas />
      <Actividades />
      <Temas />
      <Galeria />
      <Cifras />
      <RoadToDharma locale={locale} />
      <CampoLago />
      <ImpactoSocial />
      <MarcasQueConfian />
      <Sumate />
    </main>
  );
}
