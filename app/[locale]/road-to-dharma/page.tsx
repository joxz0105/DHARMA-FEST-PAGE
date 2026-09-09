import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "borrador" });
  return { title: `${t("roadTitulo")} · Dharma Fest` };
}

export default async function RoadPage({
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
          src="/img/road-to-dharma-01.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_72%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-noche via-noche/55 to-noche/30"
        />
        <div className="relative z-10 w-full px-6 pb-20 md:px-12 lg:px-20">
          <TituloDisplay como="h1" className="text-palido">
            {t("roadTitulo")}
          </TituloDisplay>
          <p className="mt-8 max-w-2xl font-texto text-xl leading-relaxed text-hueso/90">
            {t("roadIntro")}
          </p>
        </div>
      </section>

      <Seccion>
        {/* BORRADOR: copy propio, pendiente de aprobacion del cliente. Spec §8. */}
        <p className="max-w-2xl font-texto text-lg leading-relaxed text-hueso/85">
          {t("roadCuerpo")}
        </p>
        <ul className="mt-10 flex flex-wrap gap-3">
          {t("roadDato")
            .split("·")
            .map((dato) => (
              <li
                key={dato}
                className="rounded-full border border-hueso/35 px-5 py-2 font-texto text-sm text-hueso/90"
              >
                {dato.trim()}
              </li>
            ))}
        </ul>
      </Seccion>

      <Seccion id="sumate">
        <FormComunidad />
      </Seccion>
    </main>
  );
}
