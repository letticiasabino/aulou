import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Aulou - Sua vida academica organizada com IA",
    template: "%s | Aulou",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  authors: [{ name: "Aulou" }],
  creator: "Aulou",
  publisher: "Aulou",
  alternates: { canonical: "/" },
  icons: { icon: "/brand/aulou-icon.png", apple: "/brand/aulou-icon.png" },
  openGraph: {
    title: "Aulou - Sua vida academica organizada com IA",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/brand/aulou-icon.png", width: 1248, height: 1248, alt: "Aulou" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aulou - Sua vida academica organizada com IA",
    description: siteConfig.description,
    images: ["/brand/aulou-icon.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
