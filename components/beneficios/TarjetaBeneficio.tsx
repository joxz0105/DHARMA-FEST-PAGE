import Image from "next/image";

export type DatosTarjeta = {
  clave: string;
  marca: string;
  logo: string;
  descuento: number;
  categoria: string;
  titulo: string;
  /** Posicion en el JSON: es el orden de "Relevancia". */
  orden: number;
};

/**
 * Tarjeta de un beneficio, al molde del mall de Davivienda: imagen arriba,
 * categoria en versalitas, y el titulo "MARCA: X% DE DESCUENTO EN ...".
 *
 * La imagen es el logo sobre un fondo palido y no una foto: no hay fotos de
 * producto de ninguna marca, y poner una del festival sugeriria algo que no
 * es. Los logos vienen recoloreados a tinta, que es justo lo que se lee sobre
 * este fondo.
 *
 * Usa las copias de logos-recortados/, sin el margen transparente que traen
 * los PNG del deck (hay logos que ocupan el 10% de su archivo y salian
 * diminutos). Ver scripts/recortar_logos.py.
 *
 * El logo va con alt vacio porque el nombre de la marca ya esta en el titulo;
 * con alt, el lector de pantalla lo diria dos veces. La insignia del
 * porcentaje es aria-hidden por lo mismo.
 */
export function TarjetaBeneficio({ logo, descuento, categoria, titulo }: DatosTarjeta) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-tinta/10 bg-papel shadow-sm">
      {/* 16:9 en telefono: en una columna, el 4:3 dejaba casi 300px de verde
          vacio por tarjeta y el catalogo completo se hacia eterno. */}
      <div className="relative flex aspect-[16/9] items-center justify-center bg-palido/60 p-10 sm:aspect-[4/3]">
        {/* Tinta sobre el verde de marca: 6.1:1. El borde hondo es el mismo
            recurso de Boton para que el relleno no se pierda. */}
        <span
          aria-hidden
          className="absolute left-4 top-4 rounded-full border-2 border-verde-hondo bg-verde px-3 py-1 font-texto text-sm font-bold text-tinta"
        >
          -{descuento}%
        </span>
        <Image
          src={`/img/logos-recortados/${logo}`}
          alt=""
          width={240}
          height={120}
          sizes="240px"
          className="max-h-24 w-auto max-w-[70%] object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-texto text-xs font-semibold uppercase tracking-widest text-verde-texto">
          {categoria}
        </p>
        <h3 className="font-texto text-base font-bold uppercase leading-snug text-tinta">
          {titulo}
        </h3>
      </div>
    </article>
  );
}
