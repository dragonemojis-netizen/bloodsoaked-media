export interface CurrentlyExperiencing {
  playing?: string;
  watching?: string;
  listening?: string;
  reading?: string;
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
