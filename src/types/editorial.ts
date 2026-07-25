export interface CurrentlyExperiencing {
  playing?: string;
  watching?: string;
  listening?: string;
  reading?: string;
  updated?: string;
}

/**
 * A curated monthly (or otherwise dated) Spotify playlist in the Listening Room.
 * Content lives in `content/editorial/listening-room.json`.
 */
export interface ListeningRoomPlaylist {
  title: string;
  description?: string;
  /** Spotify playlist ID used to build the official embed. */
  spotifyPlaylistId: string;
  /** Public open.spotify.com URL (derived from the ID when omitted in content). */
  spotifyUrl: string;
  createdAt?: string;
  updatedAt?: string;
  coverImage?: string;
  notes?: string;
  archived: boolean;
}

export interface ListeningRoom {
  heading: string;
  description?: string;
  /** Full catalog — source of truth for current rotation + archive. */
  playlists: ListeningRoomPlaylist[];
  /** Featured non-archived playlist. */
  current: ListeningRoomPlaylist;
  /** Archived monthly playlists, newest first. */
  archive: ListeningRoomPlaylist[];
  showArchive: boolean;
  archiveHeading: string;
  /** Optional deep link for "View Archive →" when the archive grows. */
  archiveHref?: string;
}

export interface RecentPhysicalAcquisition {
  title: string;
  href?: string;
  updated?: string;
}

export interface FromTheEditorImage {
  src: string;
  alt: string;
}

export interface FromTheEditor {
  introduction: string;
  body: string[];
  monthlyUpdate?: string;
  monthlyClosing?: string;
  updated?: string;
  images?: FromTheEditorImage[];
}
