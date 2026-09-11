import Image from "next/image";
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getFotosGaleria } from "@/lib/contenido";

export function Galeria() {
  const t = useTranslations("home");
  const fotos = getFotosGaleria();

  return (
    <Seccion id="galeria">
      <Kicker>{t("galeriaKicker")}</Kicker>
      <TituloDisplay italica className="mt-4 text-verde-hondo">
        {t("galeriaTitulo")}
      </TituloDisplay>

      {/*
        Sin tarjetas: el cliente pidio las fotos pegadas, separadas solo por una
        linea muy fina. Se consigue con un gap de 1px sobre un fondo que hace de
        linea, en vez de bordes por imagen — asi la retícula no duplica el
        grosor donde dos fotos se tocan.
      */}
      <ul className="mt-14 grid grid-cols-2 gap-px bg-tinta/15 md:grid-cols-3">
        {fotos.map((foto) => (
          <li key={foto.archivo} className="relative aspect-square overflow-hidden bg-papel">
            {/* Decorativas a proposito: son personas reales que no conocemos,
                y un alt inventado seria peor que ninguno. La seccion ya se
                anuncia con su titulo. */}
            <Image
              src={`/img/${foto.archivo}`}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
