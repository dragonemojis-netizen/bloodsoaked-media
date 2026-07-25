import type { ListeningRoom as ListeningRoomData } from "@/types/editorial";
import { toSpotifyEmbedUrl } from "@/lib/spotify";
import { formatDate } from "@/lib/format";

interface ListeningRoomProps {
  data: ListeningRoomData;
}

const EMBED_HEIGHT = 352;

export function ListeningRoom({ data }: ListeningRoomProps) {
  const embedUrl = toSpotifyEmbedUrl(data.spotifyUrl);
  if (!embedUrl) return null;

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
      <div
        className="mt-4 overflow-hidden rounded-xl border border-border-subtle"
        style={{ minHeight: EMBED_HEIGHT }}
      >
        <iframe
          title={`${data.heading} — Spotify player`}
          src={embedUrl}
          width="100%"
          height={EMBED_HEIGHT}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="block w-full border-0"
        />
      </div>
      {data.updated && (
        <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/70">
          Updated {formatDate(data.updated)}
        </p>
      )}
    </section>
  );
}
