"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

export function SelectorIdioma() {
  const idioma = useLocale();
  const ruta = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  function rutaEn(destino: string): string {
    // Quita el prefijo de idioma actual y pone el nuevo. El espanol no lleva.
    const sinPrefijo = ruta.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
    if (destino === routing.defaultLocale) return sinPrefijo;
    return `/${destino}${sinPrefijo === "/" ? "" : sinPrefijo}`;
  }

  return (
    <nav aria-label={t("cambiarIdioma")} className="flex gap-2 font-texto text-sm">
      {routing.locales.map((codigo) => (
        <button
          key={codigo}
          type="button"
          lang={codigo}
          aria-current={codigo === idioma ? "true" : undefined}
          onClick={() => router.push(rutaEn(codigo))}
          className={
            codigo === idioma
              ? "text-lima underline underline-offset-4"
              : "text-hueso/70 hover:text-hueso"
          }
        >
          {codigo.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}
