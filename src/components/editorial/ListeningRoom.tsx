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
  heading,
  playlist,
}: {
  heading: string;
  playlist: ListeningRoomPlaylist;
}) {
  const embedUrl = toSpotifyEmbedUrl(playlist.spotifyUrl);
  if (!embedUrl) return null;

  return (
    <div className="mt-5 rounded-xl border border-border-subtle bg-background-elevated/70 p-2.5">
      <iframe
        title={`${heading}: ${playlist.label} — Spotify playlist player`}
        src={embedUrl}
        width="100%"
        height={EMBED_HEIGHT}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="block w-full rounded-lg border-0"
        style={{ minHeight: EMBED_HEIGHT }}
      />
    </div>
  );
}

export function ListeningRoom({ data }: ListeningRoomProps) {
  const hasCurrentPlaylist = toSpotifyEmbedUrl(data.current.spotifyUrl);
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
      <SpotifyPlaylistEmbed heading={data.heading} playlist={data.current} />
      {data.current.updated && (
        <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/70">
          Updated {formatDate(data.current.updated)}
        </p>
      )}
      {data.showArchive && data.archive.length > 0 && (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
            {data.archiveHeading}
          </h3>
          <ul className="mt-3 space-y-2">
            {data.archive.map((playlist) => (
              <li key={`${playlist.label}-${playlist.spotifyUrl}`}>
                <a
                  href={playlist.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-sm text-foreground-muted transition-colors hover:text-accent-bright"
                >
                  {playlist.label}
                  <span className="sr-only"> — open playlist in Spotify</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
