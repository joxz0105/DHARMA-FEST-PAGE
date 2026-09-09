import { useTranslations } from "next-intl";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { Kicker } from "@/components/ui/Kicker";
import { ReglaVertical } from "@/components/ui/ReglaVertical";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getCifras } from "@/lib/contenido";

export function NuestroPublico() {
  const t = useTranslations("patrocinios");
  const cifras = getCifras();
  const pct = (n: number) => `${n.toLocaleString("es-CR", { minimumFractionDigits: 1 })}%`;

  return (
    <Seccion id="publico">
      <FondoSelva opacidad={0.3} />
      <Kicker>{t("publicoKicker")}</Kicker>
      <TituloDisplay className="mt-4 text-lima-humo">{t("publicoTitulo")}</TituloDisplay>

      <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
        <p className="font-texto text-lg leading-relaxed text-hueso/90 md:basis-1/2">
          {t("publicoCuerpo")}
        </p>
        <ReglaVertical />
        <div className="md:basis-1/2">
          <h3 className="font-display text-3xl italic text-palido">{t("estiloTitulo")}</h3>
          <ul className="mt-4 flex flex-col gap-1">
            {t("estilo")
              .split("·")
              .map((item) => (
                <li key={item} className="font-texto text-hueso/85">
                  {item.trim()}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="font-texto text-sm text-hueso/80">{t("generoTitulo")}</h3>
          <dl className="mt-4 flex gap-12">
            <div>
              <dt className="font-texto text-sm text-hueso/70">{t("mujeres")}</dt>
              <dd className="font-display text-5xl text-lima">{pct(cifras.genero.mujeres)}</dd>
            </div>
            <div>
              <dt className="font-texto text-sm text-hueso/70">{t("hombres")}</dt>
              <dd className="font-display text-5xl text-palido">{pct(cifras.genero.hombres)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="font-texto text-sm text-hueso/80">{t("edadesTitulo")}</h3>
          {/* Las barras son decorativas: el dato va como texto al lado, para
              que un lector de pantalla lo lea sin depender del ancho. */}
          <ul className="mt-4 flex flex-col gap-3">
            {cifras.edades.map((edad) => (
              <li key={edad.rango} className="flex items-center gap-4">
                <span className="w-16 shrink-0 font-texto text-sm text-hueso/85">
                  {edad.rango}
                </span>
                <span aria-hidden className="h-2 flex-1 rounded-full bg-hueso/15">
                  <span
                    className="block h-2 rounded-full bg-lima"
                    style={{ width: `${edad.porcentaje}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-texto text-sm text-lima">
                  {pct(edad.porcentaje)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Seccion>
  );
}
