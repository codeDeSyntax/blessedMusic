interface ElectronAPI {
  minimizeApp: () => void;
  minimizeProjection: () => void;
  maximizeApp: () => void;
  closeApp: () => void;
  selectDirectory: () => Promise<string>;
  saveSong: (directory: string, title: string, content: string) => void;
  projectSong: (song: any) => void;
  onDisplaySong: (callback: (songData: any) => void) => void;
  getImages: (dirPath: string) => Promise<string[]>;
  // Add other API methods as needed
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

export {}; 