import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Actividades } from "@/components/secciones/Actividades";
import { FormComunidad } from "@/components/formularios/FormComunidad";
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
    title: `${t("festivalTitulo")} · Dharma Fest`,
    alternates: alternativas("/2027", locale),
  };
}

export default async function Festival2027({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("borrador");

  return (
    <main id="contenido" tabIndex={-1}>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        <Image
          src="/img/quienes-somos-01.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-noche via-noche/55 to-noche/30"
        />
        <div className="relative z-10 w-full px-6 pb-20 md:px-12 lg:px-20">
          <TituloDisplay como="h1" className="text-hueso">
            {t("festivalTitulo")}
          </TituloDisplay>
          <p className="mt-8 max-w-2xl font-texto text-xl leading-relaxed text-palido">
            {t("festivalIntro")}
          </p>
          {/* PENDIENTE DEL CLIENTE: no hay fecha del festival. Spec §10.1.
              Cuando llegue, aqui van la cuenta regresiva y el JSON-LD de Event,
              que es lo que hace que Google muestre el evento con fecha. */}
          <p className="mt-6 font-texto text-lg text-lima">{t("festivalFechaPendiente")}</p>
        </div>
      </section>

      <Seccion>
        {/* BORRADOR: copy propio, pendiente de aprobacion del cliente. Spec §8. */}
        <p className="max-w-2xl font-texto text-lg leading-relaxed text-hueso/85">
          {t("festivalCuerpo")}
        </p>
      </Seccion>

      <Actividades />

      <Seccion id="sumate">
        <FormComunidad />
      </Seccion>
    </main>
  );
}
