import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isArchivesLocal } from "@/lib/archives-gate";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function TheArchivesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isArchivesLocal()) {
    notFound();
  }

  return children;
}
