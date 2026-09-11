import Link from "next/link";
import { useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export default function NoEncontrada() {
  const t = useTranslations("borrador");
  return (
    <main id="contenido" tabIndex={-1} className="pt-28">
      <Seccion>
        <TituloDisplay como="h1" className="text-verde-texto">
          {t("noEncontradaTitulo")}
        </TituloDisplay>
        <p className="mt-8 max-w-xl font-texto text-lg text-tinta/80">
          {t("noEncontradaCuerpo")}
        </p>
        <Link
          href="/"
          className="mt-10 inline-block border-b border-verde pb-1 font-texto text-verde-texto transition-colors hover:text-verde-hondo"
        >
          {t("volverAlInicio")}
        </Link>
      </Seccion>
    </main>
  );
}
