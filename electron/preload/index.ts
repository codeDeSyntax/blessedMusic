import { ipcRenderer, contextBridge, dialog } from "electron";
import { Presentation } from "@/types";
import { DisplayInfo } from "@/types/electron-api";
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("api", {
  maximizeApp: () => ipcRenderer.send("maximizeApp"),
  minimizeApp: () => {
    console.log("Minimize action triggered");
    ipcRenderer.send("minimizeApp");
  },
  // Add this to your preload script's contextBridge.exposeInMainWorld call
minimizeProjection: () => ipcRenderer.send('minimizeProjection'),
  closeApp: () => {
    console.log("Close action triggered");
    ipcRenderer.send("closeApp");
  },
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  saveSong: (directory: string, title: string, content: string) =>
    ipcRenderer.invoke("save-song", { directory, title, content }),
  editSong: (songData: any) => ipcRenderer.invoke("edit-song", songData),
  fetchSongs: (directory: string) =>
    ipcRenderer.invoke("fetch-songs", directory),
  deleteSong: (filePath: string) => ipcRenderer.invoke("delete-song", filePath),
  searchSong: (directory: string, query: string) =>
    ipcRenderer.invoke("search-songs", directory, query),
  onSongsLoaded: (
    callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => ipcRenderer.on("songs-loaded", callback),
  getPresentationImages: (directory: string) =>
    ipcRenderer.invoke("get-presentation-images", directory),
  projectSong: (song: Song) => ipcRenderer.invoke("project-song", song),
  onDisplaySong: (callback: (songData: any) => void) => {
    ipcRenderer.on("display-song", (event, songData) => callback(songData));
    return () => {
      ipcRenderer.removeAllListeners("display-song");
    };
  },
  onDisplayInfo: (callback: (info: DisplayInfo) => void) => {
    ipcRenderer.on("display-info", (event, info) => callback(info));
    return () => {
      ipcRenderer.removeAllListeners("display-info");
    };
  },
  getImages: (dirPath:string) => ipcRenderer.invoke('get-images', dirPath),
  loadEvPresentations: (path:string) => ipcRenderer.invoke('load-presentations',path),
  createEvPresentation: (path:string,presentation: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>) => 
    ipcRenderer.invoke('create-presentation',path, presentation),
  updateEvPresentation: (id: string,directoryPath:string, presentation: Partial<Presentation>) => 
    ipcRenderer.invoke('update-presentation', id,directoryPath, presentation),
  deleteEvPresentation: (id: string,directory:string) => 
    ipcRenderer.invoke('delete-presentation', id,directory),
  
});

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"]
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__image-spin`;
  const styleContent = `
@keyframes image-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.${className} > img {
  width: 50px;
  height: 50px;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faeed1;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><img src="./music1.png" alt="Loading..." /></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
