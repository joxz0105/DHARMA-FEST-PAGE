import { useTranslations } from "next-intl";

/**
 * Nunca premarcada. Ley 8968: el consentimiento es un acto de la persona,
 * no un ajuste por defecto que haya que desmarcar.
 */
export function CasillaConsentimiento({ error }: { error?: string }) {
  const t = useTranslations("formularios");
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-3 font-texto text-sm text-tinta/80">
        <input
          type="checkbox"
          name="consentimiento"
          required
          aria-describedby="finalidad"
          className="mt-1 size-4 shrink-0 accent-verde"
        />
        <span>{t("consentimiento")}</span>
      </label>
      {/* No bajar de /75: a /60 daba 4.14:1 sobre papel y no pasa AA. Es el
          aviso de finalidad que pide la Ley 8968, tiene que leerse. */}
      <p id="finalidad" className="pl-7 font-texto text-xs text-tinta/75">
        {t("finalidad")}
      </p>
      {error ? (
        <p role="alert" className="pl-7 font-texto text-sm text-verde-texto">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
