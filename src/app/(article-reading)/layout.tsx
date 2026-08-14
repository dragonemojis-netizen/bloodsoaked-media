import { PublicationChrome } from "@/components/layout/PublicationChrome";

/**
 * Article reading chrome — header/footer without EditorPresence,
 * reading atmosphere classes. Sibling route group to (publication) so
 * chrome is not nested/doubled.
 */
export default function ArticleReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicationChrome variant="reading">{children}</PublicationChrome>;
}
