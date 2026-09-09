import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { routing } from "@/i18n/routing";
import { SITIO } from "@/lib/rutas";
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
  metadataBase: new URL(SITIO),
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
        <NextIntlClientProvider>
          <SkipLink />
          <Header locale={locale} />
          {children}
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
