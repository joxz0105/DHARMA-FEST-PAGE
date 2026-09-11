"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { suscribirComunidad, type EstadoFormulario } from "@/lib/acciones";
import { Campo } from "./Campo";
import { CasillaConsentimiento } from "./CasillaConsentimiento";

const INICIAL: EstadoFormulario = { ok: false };

export function FormComunidad() {
  const t = useTranslations("formularios");
  const idioma = useLocale();
  const [estado, accion, pendiente] = useActionState(suscribirComunidad, INICIAL);

  if (estado.ok) {
    return (
      <p role="status" className="font-texto text-lg text-verde-texto">
        {t("graciasComunidad")}
      </p>
    );
  }

  return (
    <form action={accion} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="idioma" value={idioma} />
      <Campo nombre="nombre" etiqueta={t("nombre")} autoComplete="name" />
      <Campo
        nombre="correo"
        etiqueta={t("correo")}
        tipo="email"
        requerido
        autoComplete="email"
        error={estado.errores?.correo}
        textoError={estado.errores?.correo ? t(estado.errores.correo) : undefined}
      />
      <CasillaConsentimiento error={estado.errores?.consentimiento} />
      <button
        type="submit"
        disabled={pendiente}
        className="self-start rounded-full bg-verde px-8 py-3 font-texto text-tinta transition-colors hover:bg-verde/85 disabled:opacity-60"
      >
        {pendiente ? t("enviando") : t("enviar")}
      </button>
    </form>
  );
}
