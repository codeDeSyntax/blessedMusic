// types/index.ts

export type Scripture = {
  text: string;
};

export type Quote = {
  reference?: string;
  text: string;
  prophetInitials?: string;
  preacherImage?: string; // Path to the preacher's image
};

export type SermonPresentation = {
  id: string;
  type: "sermon";
  title: string;
  scriptures: Scripture[];
  mainMessage?: string;
  preacher: string;
  quote?: string; // Keep for backward compatibility
  quotes?: Quote[]; // New quote structure
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type OtherPresentation = {
  id: string;
  type: "other";
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type Presentation = SermonPresentation | OtherPresentation;
