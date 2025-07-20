/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import("electron").IpcRenderer;
}

interface Window {
  api: {
    minimizeApp: () => void;
    minimizeProjection: () => void;
    maximizeApp: () => void;
    closeApp: () => void;
    selectDirectory: () => void;
    saveSong: (directory: string, title: string, content: string) => void;
    editSong: (
      directory: string,
      newTitle: string,
      content: string,
      originalPath: string
    ) => void;
    searchSong: (directory: string, searchTerm: string) => Promise<Song[]>;
    fetchSongs: (directory: string) => Promise<Song[]>;
    deleteSong: (filePath: string) => void;
    onSongsLoaded: (callback: (songs: Song[]) => void) => void;
    getPresentationImages: (directory: string) => Promise<string[]>;
    projectSong: (songs: any) => void;
    isProjectionActive: () => Promise<boolean>;
    closeProjectionWindow: () => Promise<boolean>;
    onProjectionStateChanged: (
      callback: (isActive: boolean) => void
    ) => () => void;
    onDisplaySong: (callback: (songData: Song) => void) => void;
    onDisplayInfo: (callback: (info: any) => void) => void;
    getImages: (dirPath: string) => Promise<string[]>;
    createEvPresentation: (
      path: string,
      presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
    ) => Promise<Presentation>;
    loadEvPresentations: (path: string) => Promise<Presentation[]>;
    deleteEvPresentation: (id: string, directory: string) => Promise<void>;
    updateEvPresentation: (
      id: string,
      directoryPath: string,
      presentation: Partial<Presentation>
    ) => Promise<Presentation>;
    createBiblePresentationWindow: (
      data: any
    ) => Promise<{ success: boolean; error?: string }>;
    sendToBiblePresentation: (data: {
      type: string;
      data: any;
    }) => Promise<{ success: boolean; error?: string }>;
    focusMainWindow: () => Promise<{ success: boolean; error?: string }>;
    openFileInDefaultApp: (
      filePath: string
    ) => Promise<{ success: boolean; error?: string }>;
    constructFilePath: (
      basePath: string,
      fileName: string
    ) => Promise<{ success: boolean; path?: string; error?: string }>;
  };
}
