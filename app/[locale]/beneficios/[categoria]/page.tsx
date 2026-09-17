import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Catalogo } from "@/components/beneficios/Catalogo";
import { ComoUsar } from "@/components/beneficios/ComoUsar";
import { HeroBeneficios } from "@/components/beneficios/HeroBeneficios";
import type { Idioma } from "@/i18n/routing";
import { getBeneficios, getCategoriaBeneficio } from "@/lib/contenido";
import { alternativas } from "@/lib/rutas";

/**
 * Una categoria de Beneficios Dharma, como las paginas de categoria del mall
 * de Davivienda ("SALUD · Encuentra los mejores productos y ofertas...").
 *
 * Se generan todas al construir, una por categoria del JSON y por idioma. Una
 * categoria que no existe cae en notFound() y muestra la pagina 404 propia
 * del sitio; hay un test que lo vigila.
 */
export function generateStaticParams() {
  return getBeneficios().categorias.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categoria: string }>;
}): Promise<Metadata> {
  const { locale, categoria } = await params;
  const cat = getCategoriaBeneficio(categoria);
  if (!cat) return {};
  const idioma = locale as Idioma;
  const t = await getTranslations({ locale, namespace: "beneficios" });
  return {
    title: `${cat.nombre[idioma]} · ${t("paginaTitulo")} · Dharma Fest`,
    description: cat.descripcion[idioma],
    alternates: alternativas(`/beneficios/${cat.slug}`, locale),
  };
}

export default async function CategoriaBeneficios({
  params,
}: {
  params: Promise<{ locale: string; categoria: string }>;
}) {
  const { locale, categoria } = await params;
  setRequestLocale(locale);
  const cat = getCategoriaBeneficio(categoria);
  if (!cat) notFound();

  const idioma = locale as Idioma;
  const t = await getTranslations("beneficios");

  return (
    <main id="contenido" tabIndex={-1}>
      <HeroBeneficios
        foto={cat.foto}
        scrim={cat.scrim}
        posicion={cat.posicion}
        kicker={t("paginaTitulo")}
        titulo={cat.nombre[idioma]}
        bajada={cat.descripcion[idioma]}
      />
      <Catalogo categoriaActiva={cat.slug} />
      <ComoUsar />
    </main>
  );
}
