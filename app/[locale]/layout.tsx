import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Este es el layout raiz: lleva <html>. Vive dentro de [locale] para que
// next/root-params pueda exponer el idioma a cualquier Server Component.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--fuente-bodoni",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--fuente-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dharma Fest",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LayoutRaiz({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${bodoni.variable} ${archivo.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
