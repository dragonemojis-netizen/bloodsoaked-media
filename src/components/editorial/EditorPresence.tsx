import Link from "next/link";
import { publication } from "@/config/publication";
import { site } from "@/config/site";
import {
  getCurrentlyExperiencing,
  getRecentPhysicalAcquisition,
} from "@/lib/editorial";
import { getLatestMediaLogEntry } from "@/lib/media-log";
import { getEditorPick } from "@/lib/content";

export async function EditorPresence() {
  const [experiencing, latestLog, acquisition, pick] = await Promise.all([
    Promise.resolve(getCurrentlyExperiencing()),
    Promise.resolve(getLatestMediaLogEntry()),
    Promise.resolve(getRecentPhysicalAcquisition()),
    getEditorPick(),
  ]);

  const items = [
    experiencing.playing && {
      label: publication.currentlyPlaying,
      href: "/media-log",
      value: experiencing.playing,
    },
    latestLog && {
      label: publication.latestLogEntry,
      href: `/media-log/${latestLog.slug}`,
      value: latestLog.title,
    },
    acquisition && {
      label: publication.recentlyCatalogued,
      href: acquisition.href,
      value: acquisition.title,
    },
    pick && {
      label: publication.editorsPick,
      href: `/articles/${pick.slug}`,
      value: pick.title,
    },
  ].filter(Boolean) as {
    label: string;
    href?: string;
    value: string;
  }[];

  if (items.length === 0) return null;

  return (
    <div
      className="editor-presence border-b border-accent/15 bg-background-elevated/90"
      aria-label="Editor presence"
    >
      <p className="mx-auto max-w-6xl px-6 pt-2 font-mono text-[0.5rem] uppercase tracking-[0.28em] text-accent-bright/50">
        {site.curator}&apos;s Desk
      </p>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 px-6 pb-2.5">
        {items.map((item) => (
          <p
            key={item.label}
            className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-foreground-muted"
          >
            <span className="text-accent-bright/90">{item.label}:</span>{" "}
            {item.href ? (
              <Link
                href={item.href}
                className="text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.value}
              </Link>
            ) : (
              <span className="text-foreground-muted">{item.value}</span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
