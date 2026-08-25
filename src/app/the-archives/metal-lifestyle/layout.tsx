import { Lora, Raleway } from "next/font/google";
import type { Metadata } from "next";
import "./metal-lifestyle.css";

const mlSans = Raleway({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "700"],
  variable: "--font-ml-sans",
  display: "swap",
});

const mlSerif = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-ml-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Metal Lifestyle",
    template: "%s · Metal Lifestyle",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function MetalLifestyleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${mlSans.variable} ${mlSerif.variable}`}>{children}</div>
  );
}
