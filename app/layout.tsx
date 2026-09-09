import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ lang?: string }>;
}) {
  const { lang } = (await params) ?? {};
  return (
    <html lang={lang ?? "es"} className={`${bodoni.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
