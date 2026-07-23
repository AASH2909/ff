import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/app/locale-provider";
import { LocaleRenderBoundary } from "@/components/app/locale-provider";
import { LanguageControl } from "@/components/app/language-control";
import { OperationalDemoProvider } from "@/components/app/operational-demo-state";

export const metadata: Metadata = {
  title: "FF",
  description: "Next.js 15 application foundation",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <OperationalDemoProvider>
            <LocaleRenderBoundary>{children}</LocaleRenderBoundary>
            <LanguageControl />
          </OperationalDemoProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
