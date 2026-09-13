import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Mercadito() {
  const t = useTranslations("patrocinios");
  return (
    <section id="mercadito" className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      <Image
        src="/img/mercadito-01.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div aria-hidden data-fondo="verde"
        className="absolute inset-0 -z-10 bg-[rgba(16,26,10,0.55)]" />
      <TituloDisplay className="text-palido">{t("mercaditoTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/90">{t("mercaditoCuerpo")}</p>
      {/* PENDIENTE DEL CLIENTE: no hay precio ni condiciones del stand del
          Mercadito. Spec §10.4. El CTA lleva al formulario general hasta que
          el cliente defina que incluye y cuanto cuesta. */}
      <Link
        href="#propuesta"
        className="mt-10 inline-block border-b border-verde pb-1 font-texto text-palido transition-colors hover:text-verde"
      >
        {t("mercaditoCta")}
      </Link>
    </section>
  );
}
