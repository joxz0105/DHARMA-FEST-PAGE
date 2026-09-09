import { setRequestLocale } from "next-intl/server";
import { Actividades } from "@/components/secciones/Actividades";
import { CampoLago } from "@/components/secciones/CampoLago";
import { Cifras } from "@/components/secciones/Cifras";
import { Galeria } from "@/components/secciones/Galeria";
import { Hero } from "@/components/secciones/Hero";
import { ImpactoSocial } from "@/components/secciones/ImpactoSocial";
import { MarcasQueConfian } from "@/components/secciones/MarcasQueConfian";
import { QuienesSomos } from "@/components/secciones/QuienesSomos";
import { RoadToDharma } from "@/components/secciones/RoadToDharma";
import { Temas } from "@/components/secciones/Temas";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="contenido" tabIndex={-1}>
      <Hero locale={locale} />
      <QuienesSomos />
      <Actividades />
      <Temas />
      <Galeria />
      <Cifras />
      <RoadToDharma locale={locale} />
      <CampoLago />
      <ImpactoSocial />
      <MarcasQueConfian />
    </main>
  );
}
