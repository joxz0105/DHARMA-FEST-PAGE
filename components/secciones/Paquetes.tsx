import { useLocale, useTranslations } from "next-intl";
import { FondoFoto } from "@/components/ui/FondoFoto";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getPaquetes } from "@/lib/contenido";

const COLOR_POR_PAQUETE = {
  oficial: "text-palido",
  oro: "text-oro",
  plata: "text-palido",
} as const;

export function Paquetes() {
  const t = useTranslations("patrocinios");
  const idioma = useLocale() as "es" | "en";
  const paquetes = getPaquetes();

  return (
    <Seccion id="paquetes">
      <FondoFoto src="2025/2025-dsc9727.jpg" scrim={59} />
      <TituloDisplay className="text-palido">{t("paquetesTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/85">{t("paquetesCuerpo")}</p>

      <div className="mt-16 grid gap-12 lg:grid-cols-3">
        {paquetes.map((paquete) => (
          <article key={paquete.slug} className="border-t border-hueso/30 pt-8">
            {/*
              paquete.inversionUSD existe en el JSON y NO se renderiza a
              proposito: el precio se negocia y se ajusta por edicion, y un
              numero en una pagina indexada es dificil de bajar despues.
              Ver spec §3. Hay un test que falla si alguna cifra se cuela.
            */}
            <h3 className={`font-display text-5xl ${COLOR_POR_PAQUETE[paquete.slug]}`}>
              {paquete.nombre}
            </h3>
            <p className="mt-3 font-texto text-sm text-hueso/75">{paquete.lema[idioma]}</p>

            {(
              [
                ["grupoPresencia", paquete.presencia],
                ["grupoVisibilidad", paquete.visibilidad],
                ["grupoCaptacion", paquete.captacion],
              ] as const
            ).map(([clave, beneficios]) => (
              <div key={clave} className="mt-8">
                <h4 className="font-texto text-sm font-semibold text-hueso">{t(clave)}</h4>
                <ul className="mt-3 flex flex-col gap-2">
                  {beneficios.map((beneficio) => (
                    <li key={beneficio.es} className="font-texto text-sm text-hueso/80">
                      {beneficio[idioma]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </div>
    </Seccion>
  );
}
