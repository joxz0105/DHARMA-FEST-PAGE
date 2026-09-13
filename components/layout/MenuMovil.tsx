"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Navegacion para pantallas chicas.
 *
 * La cabecera oculta los enlaces por debajo de lg. Sin esto, desde un telefono
 * no se puede llegar a ninguna pagina del sitio, que es justo donde va a estar
 * la mayoria del publico que llega desde Instagram.
 */
export function MenuMovil({ enlaces }: { enlaces: { href: string; texto: string }[] }) {
  const t = useTranslations("nav");
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const botonRef = useRef<HTMLButtonElement>(null);

  // Cerrar al navegar: el panel es un overlay y la ruta cambia debajo.
  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", alPresionar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <div className="lg:hidden">
      <button
        ref={botonRef}
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => setAbierto((v) => !v)}
        className="flex size-10 items-center justify-center rounded-full border border-hueso/60 text-hueso"
      >
        <span className="sr-only">{abierto ? t("cerrarMenu") : t("abrirMenu")}</span>
        <span aria-hidden className="text-lg leading-none">
          {abierto ? "×" : "≡"}
        </span>
      </button>

      <div
        id="menu-movil"
        hidden={!abierto}
        className="fixed inset-0 z-50 flex flex-col gap-8 bg-papel px-6 pt-24"
      >
        <button
          type="button"
          onClick={() => {
            setAbierto(false);
            botonRef.current?.focus();
          }}
          className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full border border-tinta/25 text-tinta"
        >
          <span className="sr-only">{t("cerrarMenu")}</span>
          <span aria-hidden className="text-lg leading-none">
            {"×"}
          </span>
        </button>

        <nav aria-label={t("abrirMenu")}>
          <ul className="flex flex-col gap-6">
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="font-display text-4xl text-verde-hondo transition-colors hover:text-verde-texto"
                >
                  {enlace.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
