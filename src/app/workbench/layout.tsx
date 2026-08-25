import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkbenchChrome } from "@/components/workbench";
import { workbenchVoice } from "@/config/workbench-voice";
import { isCuratorMode } from "@/lib/curator-gate";

export const metadata: Metadata = {
  title: workbenchVoice.name,
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isCuratorMode()) {
    notFound();
  }

  return <WorkbenchChrome>{children}</WorkbenchChrome>;
}
