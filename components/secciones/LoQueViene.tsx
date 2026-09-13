import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function LoQueViene() {
  const t = useTranslations("patrocinios");
  return (
    <Seccion id="lo-que-viene">
      <FondoFoto src="2025/2025-dsc9493.jpg" scrim={45} posicion="center 30%" />
      <Kicker>{t("loQueVieneKicker")}</Kicker>
      <TituloDisplay className="mt-4 text-palido">{t("loQueVieneTitulo")}</TituloDisplay>
      <ul className="mt-12 flex max-w-2xl flex-col gap-5">
        {t("loQueViene")
          .split("·")
          .map((item) => (
            <li
              key={item}
              className="border-l-2 border-verde pl-5 font-texto text-lg text-hueso/90"
            >
              {item.trim()}
            </li>
          ))}
      </ul>
    </Seccion>
  );
}
