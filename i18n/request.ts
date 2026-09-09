import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as segmentoIdioma } from "next/root-params";
import { routing } from "./routing";

// Se usa next/root-params en vez de requestLocale, que next-intl 4.14 marca
// como deprecado. Requiere que el layout raiz viva en app/[locale]/.
export default getRequestConfig(async () => {
  const solicitado = await segmentoIdioma();
  const locale = hasLocale(routing.locales, solicitado)
    ? solicitado
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`@/content/copy/${locale}.json`)).default,
  };
});
