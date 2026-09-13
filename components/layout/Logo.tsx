import Image from "next/image";

/**
 * Logotipo del sitio: Campo Lago arriba, Dharmafest debajo.
 *
 * El cliente lo pidio explicito: el logo del sitio es el bloqueo con Campo
 * Lago, no el Dharmafest suelto. Es el mismo lockup de la portada del deck.
 *
 * Dharmafest sale del PDF editable del manual, en SVG. La marca de Campo Lago
 * solo existe como PNG dentro del deck; se recorto el aire transparente (era
 * el 82% del archivo, por eso se veia diminuta) y se recoloreo a tinta para el
 * fondo claro. Si el cliente pasa el vectorial, se cambia aca y nada mas.
 *
 * Las proporciones imitan la portada: Campo Lago ronda el 40% del ancho de
 * Dharmafest.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center gap-1.5 ${className}`}>
      <Image
        src="/img/logo-campolago-blanco.png"
        alt=""
        width={453}
        height={112}
        priority
        className="h-2.5 w-auto md:h-3"
      />
      <Image
        src="/img/logo-dharmafest.svg"
        alt=""
        width={1401}
        height={480}
        priority
        className="h-8 w-auto brightness-0 invert md:h-10"
      />
    </span>
  );
}
