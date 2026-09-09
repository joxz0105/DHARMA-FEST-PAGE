import { useTranslations } from "next-intl";

/**
 * Nunca premarcada. Ley 8968: el consentimiento es un acto de la persona,
 * no un ajuste por defecto que haya que desmarcar.
 */
export function CasillaConsentimiento({ error }: { error?: string }) {
  const t = useTranslations("formularios");
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-start gap-3 font-texto text-sm text-hueso/85">
        <input
          type="checkbox"
          name="consentimiento"
          required
          aria-describedby="finalidad"
          className="mt-1 size-4 shrink-0 accent-lima"
        />
        <span>{t("consentimiento")}</span>
      </label>
      <p id="finalidad" className="pl-7 font-texto text-xs text-hueso/60">
        {t("finalidad")}
      </p>
      {error ? (
        <p role="alert" className="pl-7 font-texto text-sm text-lima">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
