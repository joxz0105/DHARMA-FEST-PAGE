import { useTranslations } from "next-intl";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

/**
 * El formulario va en un panel claro, no directo sobre la foto.
 *
 * Sus etiquetas, la casilla y el aviso de finalidad estan en tinta, pensados
 * para fondo claro, y el formulario se reusa en /2027 y /road-to-dharma sobre
 * papel. Sobre esta foto se leian en gris oscuro contra gris: el aviso de la
 * Ley 8968 daba 2.2:1. Pintarlos de blanco aca obligaba a duplicar estilos;
 * el panel los deja legibles tal como son, y los campos se reconocen.
 */
export function Sumate() {
  const t = useTranslations("formularios");
  return (
    <Seccion id="sumate">
      <FondoFoto src="2025/2025-dsc8912.jpg" scrim={49} posicion="center 30%" />
      <TituloDisplay className="text-palido">{t("sumateTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso">{t("sumateCuerpo")}</p>
      <div className="mt-10 max-w-xl rounded-2xl bg-papel p-6 shadow-sm md:p-8">
        <FormComunidad />
      </div>
    </Seccion>
  );
}
