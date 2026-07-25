import type {
  ListeningRoom as ListeningRoomData,
  ListeningRoomPlaylist,
} from "@/types/editorial";
import { toSpotifyEmbedUrl } from "@/lib/spotify";
import { formatDate } from "@/lib/format";

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
  const embedUrl = toSpotifyEmbedUrl(playlist.spotifyId);
  if (!embedUrl) return null;

  return (
    <div className="listening-room-embed mt-6 rounded-xl border border-border-subtle bg-background-elevated/70 p-2.5 sm:p-3">
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
}: {
  heading: string;
  playlists: ListeningRoomPlaylist[];
}) {
  if (playlists.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border-subtle pt-5">
      <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
        {heading}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {playlists.map((playlist) => (
          <li key={playlist.spotifyId}>
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
    </div>
  );
}

export function ListeningRoom({ data }: ListeningRoomProps) {
  const hasCurrentPlaylist = toSpotifyEmbedUrl(data.current.spotifyId);
  if (!hasCurrentPlaylist) return null;

  return (
    <section
      className="border border-border bg-background-panel/80 p-5 vhs-panel"
      aria-labelledby="listening-room-heading"
    >
      <h2
        id="listening-room-heading"
        className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent-bright"
      >
        {data.heading}
      </h2>
      {data.description && (
        <p className="mt-2 font-serif text-sm leading-snug text-foreground-muted">
          {data.description}
        </p>
      )}

      <SpotifyPlaylistEmbed
        sectionHeading={data.heading}
        playlist={data.current}
      />

      {data.current.updated && (
        <p className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-foreground-muted/65">
          Updated
          <span className="mx-1.5 text-foreground-muted/40" aria-hidden="true">
            •
          </span>
          <time dateTime={data.current.updated}>
            {formatDate(data.current.updated)}
          </time>
        </p>
      )}

      {data.showArchive && (
        <PlaylistArchiveList
          heading={data.archiveHeading}
          playlists={data.archive}
        />
      )}
    </section>
  );
}
