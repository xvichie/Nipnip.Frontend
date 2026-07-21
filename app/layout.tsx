import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { JsonLd } from "@/components/storefront/shared/JsonLd";
import "./globals.css";

// Site-wide identity for Google (distinct from the per-store Store/Product JSON-LD each
// merchant storefront already renders) — helps Google understand what NipNip itself is, not
// just the individual stores hosted on it.
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.nipnip.ge#organization',
  name: 'NipNip',
  url: 'https://www.nipnip.ge',
  sameAs: [
    'https://instagram.com/nipnip.ge',
    'https://tiktok.com/@nipnip.ge',
  ],
}

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.nipnip.ge#website',
  name: 'NipNip',
  url: 'https://www.nipnip.ge',
  publisher: { '@id': 'https://www.nipnip.ge#organization' },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bpgFont = localFont({
  src: "../public/fonts/bpg_extrasquare_mtavruli_2009.ttf",
  weight: "400",
  variable: "--font-bpg",
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nipnip.ge'),
  title: {
    default: 'NipNip — ინფლუენსერ მარკეტინგის პლატფორმა',
    template: '%s | NipNip',
  },
  description: 'ინფლუენსერები გაყიდიან შენს პროდუქტებს — იხდი მხოლოდ შედეგზე',
  openGraph: {
    type: 'website',
    siteName: 'NipNip',
    title: 'NipNip — ინფლუენსერ მარკეტინგის პლატფორმა',
    description: 'ინფლუენსერები გაყიდიან შენს პროდუქტებს — იხდი მხოლოდ შედეგზე',
    url: 'https://www.nipnip.ge',
    images: [
      {
        url: '/meta-graph.png',
        width: 1200,
        height: 630,
        alt: 'NipNip',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NipNip — ინფლუენსერ მარკეტინგის პლატფორმა',
    description: 'ინფლუენსერები გაყიდიან შენს პროდუქტებს — იხდი მხოლოდ შედეგზე',
    images: ['/meta-graph.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ka"
        data-theme="dark"
        className={`${geistSans.variable} ${geistMono.variable} ${bpgFont.variable} h-full antialiased`}
      >
        <body className={`${bpgFont.className} min-h-full flex flex-col`}>
          <JsonLd data={ORGANIZATION_JSON_LD} />
          <JsonLd data={WEBSITE_JSON_LD} />
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
