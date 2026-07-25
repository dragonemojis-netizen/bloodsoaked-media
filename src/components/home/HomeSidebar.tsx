import Link from "next/link";
import { publication } from "@/config/publication";
import { CurrentlyExperiencing } from "@/components/editorial/CurrentlyExperiencing";
import { ListeningRoom } from "@/components/editorial/ListeningRoom";
import { MediaLogCard } from "@/components/media-log/MediaLogCard";
import type {
  CurrentlyExperiencing as CurrentlyExperiencingData,
  ListeningRoom as ListeningRoomData,
} from "@/types/editorial";
import type { MediaLogEntry } from "@/types/media-log";

interface HomeSidebarProps {
  experiencing: CurrentlyExperiencingData;
  listeningRoom: ListeningRoomData | null;
  recentLog: MediaLogEntry[];
}

export function HomeSidebar({
  experiencing,
  listeningRoom,
  recentLog,
}: HomeSidebarProps) {
  return (
    <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
      <CurrentlyExperiencing data={experiencing} />

      {listeningRoom && <ListeningRoom data={listeningRoom} />}

      {recentLog.length > 0 && (
        <div className="border border-border bg-background-panel/50 p-5">
          <div className="mb-4 flex items-end justify-between gap-2 border-b border-border-subtle pb-3">
            <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted">
              {publication.mediaLog}
            </h2>
            <Link
              href="/media-log"
              className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-accent-bright transition-colors hover:text-foreground"
            >
              Full log →
            </Link>
          </div>
          <div className="-mx-1">
            {recentLog.slice(0, 3).map((entry) => (
              <MediaLogCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
