import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getBeneficios } from "@/lib/contenido";
import { GrillaBeneficios } from "./GrillaBeneficios";
import type { DatosTarjeta } from "./TarjetaBeneficio";

const CHIP =
  "flex items-center justify-between gap-3 rounded-full border px-4 py-2 font-texto text-sm transition-colors lg:rounded-lg lg:border-transparent lg:px-3";
const CHIP_ACTIVO = "border-verde-hondo bg-verde font-semibold text-tinta lg:border-verde-hondo";
const CHIP_INACTIVO = "border-tinta/20 bg-papel text-tinta/80 hover:border-verde-hondo hover:text-tinta lg:bg-transparent";

/**
 * Catalogo de Beneficios Dharma, con la diagramacion del mall de Davivienda
 * que pidio el cliente: una caja de categorias a la izquierda, arriba el
 * conteo de resultados y el orden, y la grilla de tarjetas.
 *
 * Cada categoria es una pagina propia (/beneficios/[categoria]) en vez de un
 * filtro en el navegador: asi se puede mandar el enlace de "Movimiento" por
 * WhatsApp y abre ya filtrado. En movil la caja se vuelve una fila de
 * pastillas que se acomoda en varias lineas, sin scroll lateral.
 */
export function Catalogo({ categoriaActiva }: { categoriaActiva?: string }) {
  const t = useTranslations("beneficios");
  const idioma = useLocale() as "es" | "en";
  const base = idioma === "es" ? "" : `/${idioma}`;
  const { categorias, beneficios } = getBeneficios();

  const activa = categorias.find((c) => c.slug === categoriaActiva);
  const nombreDe = new Map(categorias.map((c) => [c.slug, c.nombre[idioma]]));

  const tarjetas: DatosTarjeta[] = beneficios
    .map((b, orden) => ({ b, orden }))
    .filter(({ b }) => !activa || b.categoria === activa.slug)
    .map(({ b, orden }) => ({
      clave: `${b.categoria}-${b.logo}`,
      marca: b.marca,
      logo: b.logo,
      descuento: b.descuento,
      categoria: nombreDe.get(b.categoria) ?? b.categoria,
      titulo: t("tituloTarjeta", { marca: b.marca, descuento: b.descuento, sobre: b.sobre[idioma] }),
      orden,
    }));

  const opciones = [
    { clave: "todas", href: `${base}/beneficios`, texto: t("todas"), total: beneficios.length, actual: !activa },
    ...categorias.map((c) => ({
      clave: c.slug,
      href: `${base}/beneficios/${c.slug}`,
      texto: c.nombre[idioma],
      total: beneficios.filter((b) => b.categoria === c.slug).length,
      actual: activa?.slug === c.slug,
    })),
  ];

  return (
    <section id="catalogo" className="bg-palido/30 px-6 py-16 md:px-12 lg:px-20">
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav
          aria-label={t("categoriasNav")}
          className="lg:sticky lg:top-8 lg:self-start lg:rounded-2xl lg:border lg:border-tinta/15 lg:bg-papel lg:p-6"
        >
          <h2 className="font-texto text-sm font-bold uppercase tracking-widest text-tinta">
            {t("categoriasTitulo")}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {opciones.map((o) => (
              <li key={o.clave}>
                <Link
                  href={o.href}
                  aria-current={o.actual ? "page" : undefined}
                  className={`${CHIP} ${o.actual ? CHIP_ACTIVO : CHIP_INACTIVO}`}
                >
                  <span>{o.texto}</span>
                  <span className={o.actual ? "text-tinta" : "text-tinta/70"}>{o.total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-texto text-2xl font-bold uppercase tracking-wide text-tinta md:text-3xl">
            {activa ? t("enCategoria", { categoria: activa.nombre[idioma] }) : t("todasTitulo")}
          </h2>
          <GrillaBeneficios tarjetas={tarjetas} />
        </div>
      </div>
    </section>
  );
}
