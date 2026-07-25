import type {
  ListeningRoom as ListeningRoomData,
  ListeningRoomPlaylist,
} from "@/types/editorial";
import { toSpotifyEmbedUrl } from "@/lib/spotify";
import { formatDate } from "@/lib/format";
import Link from "next/link";

interface ListeningRoomProps {
  data: ListeningRoomData;
}

const EMBED_HEIGHT = 352;

function SpotifyPlaylistEmbed({
  sectionHeading,
  playlist,
}: {
  sectionHeading: string;
  playlist: ListeningRoomPlaylist;
}) {
  const embedUrl = toSpotifyEmbedUrl(playlist.spotifyPlaylistId);
  if (!embedUrl) return null;

  return (
    <div className="listening-room-embed mt-7 rounded-xl p-3 sm:p-3.5">
      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{ height: EMBED_HEIGHT }}
      >
        <iframe
          title={`${sectionHeading}: ${playlist.title} — Spotify playlist player`}
          src={embedUrl}
          width="100%"
          height={EMBED_HEIGHT}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="block h-full w-full border-0"
        />
      </div>
    </div>
  );
}

function PlaylistArchiveList({
  heading,
  playlists,
  archiveHref,
}: {
  heading: string;
  playlists: ListeningRoomPlaylist[];
  archiveHref?: string;
}) {
  if (playlists.length === 0) return null;

  return (
    <div className="mt-7 border-t border-border-subtle pt-5">
      <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
        {heading}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {playlists.map((playlist) => (
          <li key={playlist.spotifyPlaylistId}>
            <a
              href={playlist.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="font-serif text-sm text-foreground-muted transition-colors hover:text-accent-bright"
            >
              {playlist.title}
              <span className="sr-only"> — open playlist in Spotify</span>
            </a>
          </li>
        ))}
      </ul>
      {archiveHref && (
        <p className="mt-4">
          <Link
            href={archiveHref}
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent-bright transition-colors hover:text-foreground"
          >
            View Archive →
          </Link>
        </p>
      )}
    </div>
  );
}

export function ListeningRoom({ data }: ListeningRoomProps) {
  const hasCurrentPlaylist = toSpotifyEmbedUrl(data.current.spotifyPlaylistId);
  if (!hasCurrentPlaylist) return null;

  return (
    <section
      className="border border-border bg-background-panel/80 p-5 vhs-panel"
      aria-labelledby="listening-room-heading"
    >
      <header>
        <h2
          id="listening-room-heading"
          className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent-bright"
        >
          {data.heading}
        </h2>
        {data.description && (
          <p className="mt-2.5 font-serif text-sm leading-relaxed text-foreground-muted">
            {data.description}
          </p>
        )}
      </header>

      <SpotifyPlaylistEmbed
        sectionHeading={data.heading}
        playlist={data.current}
      />

      {data.current.updatedAt && (
        <p className="listening-room-meta mt-6 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted/70">
          <span>Updated</span>
          <span className="mx-1.5 text-accent/55" aria-hidden="true">
            •
          </span>
          <time dateTime={data.current.updatedAt}>
            {formatDate(data.current.updatedAt)}
          </time>
        </p>
      )}

      {data.showArchive && (
        <PlaylistArchiveList
          heading={data.archiveHeading}
          playlists={data.archive}
          archiveHref={data.archiveHref}
        />
      )}
    </section>
  );
}
