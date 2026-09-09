import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacidad" });
  return { title: `${t("titulo")} · Dharma Fest` };
}

export default async function Privacidad({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacidad");

  return (
    <main id="contenido" tabIndex={-1} className="pt-24">
      <Seccion>
        <TituloDisplay como="h1" className="text-palido">
          {t("titulo")}
        </TituloDisplay>
        {/* PENDIENTE DEL CLIENTE: el texto legal y la identidad del responsable
            del tratamiento los entrega Dharma Fest. Ver spec §9 y §10.5.
            No inventar una politica de privacidad. */}
        <p className="mt-10 max-w-2xl font-texto text-lg leading-relaxed text-hueso/85">
          {t("pendiente")}
        </p>
        <p className="mt-6 max-w-2xl font-texto text-lg leading-relaxed text-hueso/70">
          {t("mientrasTanto")}
        </p>
      </Seccion>
    </main>
  );
}
