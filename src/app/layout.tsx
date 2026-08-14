import type { Metadata } from "next";
import { Libre_Baskerville, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const display = Libre_Baskerville({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

const label = IBM_Plex_Mono({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [{ url: site.logo.src, alt: site.logo.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [site.logo.src],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "application/rss+xml": `${site.url}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${label.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="relative min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
