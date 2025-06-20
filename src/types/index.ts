export interface Song {
  id: string;
  title: string;
  path: string;
  content: string;
  message?: string;
  categories: string[];
  dateModified: string;
}

export interface EditSong {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  setEditContent: (content: string) => void;
  setEditTitle: (title: string) => void;
  editContent: string;
  editTitle: string;
  selectedSong: Song | null;
  setSelectedSong: (song: Song | null) => void;
}

export interface Collection {
  id: string;
  name: string;
  songIds: string[];
  dateCreated: string;
}

export interface Sermon {
  id: number | string;
  title: string;
  date?: string;
  year?: string;
  sermon?: string;
  type?: string;
  audioUrl?: string;
  downloadLink?:string;
  location?:string;
  lastRead?: string;
}

export type Scripture = {
  text: string;
};

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'scripture' | 'image';
  title?: string;
  content?: string;
  background?: string;
  animation?: string;
  duration?: number;
}

export type EvSermon = {
  id: string;
  type: 'sermon';
  title: string;
  scriptures: Scripture[];
  mainMessage?: string;
  preacher: string;
  quote?: string;
  date: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
};

export type EvOther = {
  id: string;
  type: 'other';
  title: string;
  message: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
};

export type Presentation = EvSermon | EvOther;