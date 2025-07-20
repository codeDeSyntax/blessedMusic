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
  quotes?: Quote[]; // Quote structure
  date: string;
  createdAt: string;
  updatedAt: string;
  backgroundImage?: string;
};

export type Presentation = SermonPresentation;
