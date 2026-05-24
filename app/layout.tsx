import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

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
  title: "NipNip",
  description: "Creator affiliate platform",
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
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
