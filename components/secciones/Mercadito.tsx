import Link from "next/link";
import { useTranslations } from "next-intl";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Mercadito() {
  const t = useTranslations("patrocinios");
  return (
    <section id="mercadito" className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      {/* Antes era la foto del deck: un salon blanco, que con el oscurecido
          quedaba como una caja gris plana y el cuerpo no llegaba a 4.5:1. Esta
          es un puesto del Mercadito 2025 con gente comprando, que ademas es
          justo lo que la seccion le vende a una marca. */}
      <FondoFoto src="2025/2025-dsc9688.jpg" scrim={56} posicion="center 35%" />
      <TituloDisplay className="text-palido">{t("mercaditoTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso">{t("mercaditoCuerpo")}</p>
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
