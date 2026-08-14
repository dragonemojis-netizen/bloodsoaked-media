import { PublicationChrome } from "@/components/layout/PublicationChrome";

/**
 * Default Bloodsoaked publication chrome for the public site.
 * Metal Lifestyle and Workbench live outside this route group.
 */
export default function PublicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicationChrome variant="default">{children}</PublicationChrome>;
}
