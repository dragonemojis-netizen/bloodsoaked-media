import { PublicationChrome } from "@/components/layout/PublicationChrome";

/**
 * Bloodsoaked chrome for /the-archives hub routes only.
 * Sibling of metal-lifestyle — does not wrap the immersive archive.
 */
export default function ArchivesHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicationChrome variant="default">{children}</PublicationChrome>;
}
