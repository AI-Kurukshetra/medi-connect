import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { appTheme, themeCssVariables } from "@/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: appTheme.brand.name,
    template: `%s | ${appTheme.brand.name}`,
  },
  description: appTheme.seo.description,
  applicationName: appTheme.brand.name,
  keywords: [...appTheme.seo.keywords],
  category: "healthcare",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: appTheme.brand.name,
    description: appTheme.seo.socialDescription,
    url: "/",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appTheme.brand.name,
    description: appTheme.seo.socialDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={themeCssVariables as CSSProperties}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
