export interface CurrentlyExperiencing {
  playing?: string;
  watching?: string;
  listening?: string;
  reading?: string;
  updated?: string;
}

export interface ListeningRoomPlaylist {
  label: string;
  spotifyUrl: string;
  updated?: string;
}

export interface ListeningRoom {
  heading: string;
  description?: string;
  current: ListeningRoomPlaylist;
  archive: ListeningRoomPlaylist[];
  showArchive: boolean;
  archiveHeading: string;
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
