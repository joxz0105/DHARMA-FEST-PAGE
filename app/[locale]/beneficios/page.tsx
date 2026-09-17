import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Catalogo } from "@/components/beneficios/Catalogo";
import { ComoUsar } from "@/components/beneficios/ComoUsar";
import { HeroBeneficios } from "@/components/beneficios/HeroBeneficios";
import { alternativas } from "@/lib/rutas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "beneficios" });
  return {
    title: `${t("paginaTitulo")} · Dharma Fest`,
    description: t("paginaBajada"),
    alternates: alternativas("/beneficios", locale),
  };
}

/**
 * Beneficios Dharma: el catalogo completo.
 *
 * PENDIENTE DEL CLIENTE: las marcas y porcentajes de content/beneficios.json
 * son ejemplo y ninguna los confirmo. Ver la nota al inicio de ese archivo.
 */
export default async function Beneficios({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("beneficios");

  return (
    <main id="contenido" tabIndex={-1}>
      {/* Gente pagando en un puesto del Mercadito 2025, telefono en mano y
          brazalete puesto: es el momento exacto en que se usa un beneficio. */}
      <HeroBeneficios
        foto="2025/2025-dsc9688.jpg"
        scrim={54}
        posicion="center 35%"
        kicker={t("paginaKicker")}
        titulo={t("paginaTitulo")}
        bajada={t("paginaBajada")}
      />
      <Catalogo />
      <ComoUsar />
    </main>
  );
}
