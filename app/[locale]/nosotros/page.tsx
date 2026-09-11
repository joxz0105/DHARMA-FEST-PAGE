import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImpactoSocial } from "@/components/secciones/ImpactoSocial";
import { CampoLago } from "@/components/secciones/CampoLago";
import { alternativas } from "@/lib/rutas";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "borrador" });
  return {
    title: `${t("nosotrosTitulo")} · Dharma Fest`,
    alternates: alternativas("/nosotros", locale),
  };
}

export default async function Nosotros({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("borrador");

  return (
    <main id="contenido" tabIndex={-1} className="pt-28">
      <Seccion>
        <TituloDisplay como="h1" className="text-verde-hondo">
          {t("nosotrosTitulo")}
        </TituloDisplay>
        {/* El cuerpo es copy literal del deck (lamina 2), no borrador. */}
        <p className="mt-10 max-w-2xl font-texto text-xl leading-relaxed text-tinta/90">
          {t("nosotrosCuerpo")}
        </p>
        {/* PENDIENTE DEL CLIENTE: no se sabe quien esta detras de la marca.
            Spec §10.2. Esta pagina queda corta hasta que lo digan; no se
            inventa una fundadora ni un equipo. */}
      </Seccion>

      <CampoLago />
      <ImpactoSocial />
    </main>
  );
}
