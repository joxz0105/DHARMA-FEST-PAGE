import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormPropuesta } from "@/components/formularios/FormPropuesta";
import { Cifras } from "@/components/secciones/Cifras";
import { HeroPatrocinios } from "@/components/secciones/HeroPatrocinios";
import { LoQueViene } from "@/components/secciones/LoQueViene";
import { MarcasQueConfian } from "@/components/secciones/MarcasQueConfian";
import { Mercadito } from "@/components/secciones/Mercadito";
import { NuestroPublico } from "@/components/secciones/NuestroPublico";
import { Paquetes } from "@/components/secciones/Paquetes";
import { PlanDeMedios } from "@/components/secciones/PlanDeMedios";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: `${t("patrocinios")} · Dharma Fest` };
}

export default async function Patrocinios({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("formularios");

  return (
    <main id="contenido" tabIndex={-1}>
      <HeroPatrocinios />
      <NuestroPublico />
      <Cifras />
      <PlanDeMedios />
      <LoQueViene />
      <Paquetes />
      <Mercadito />
      <MarcasQueConfian />
      <Seccion id="propuesta">
        <TituloDisplay className="text-lima">{t("propuestaTitulo")}</TituloDisplay>
        <p className="mt-6 max-w-xl font-texto text-lg text-hueso/85">{t("propuestaCuerpo")}</p>
        <div className="mt-10">
          <FormPropuesta />
        </div>
      </Seccion>
    </main>
  );
}
