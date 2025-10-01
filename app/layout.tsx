import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agente Tradicional - PWA Mobile First",
  description: "Revolucionando las tareas de campo con IA avanzada",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agente Tradicional",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}