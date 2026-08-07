import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { site } from "@/lib/site";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

/**
 * Retour client 08/2026 : « Changer la police du site — INTER. 1. Inter light
 * pour texte, 2. Inter gras pour titres. » Inter remplace les DEUX familles
 * précédentes (Hanken Grotesk + Instrument Serif) : il n'y a plus de serif.
 * Fonte variable, donc les graisses 300 → 700 sont servies par un seul fichier.
 */
const inter = Inter({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.name} : ${site.taglineFr}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "cours de sport dernière minute",
    "salle de sport pas cher Paris",
    "yoga pilates boxe pas cher",
    "places de sport invendues",
    "réduction cours de sport",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: `${site.name} : ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#a51c1e",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-dvh antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
