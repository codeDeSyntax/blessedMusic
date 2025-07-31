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
  minimizeProjection: () => ipcRenderer.send("minimizeProjection"),
  closeApp: () => {
    console.log("Close action triggered");
    ipcRenderer.send("closeApp");
  },
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  getPresentationImages: (directory: string) =>
    ipcRenderer.invoke("get-presentation-images", directory),
  isProjectionActive: () => ipcRenderer.invoke("is-projection-active"),
  closeProjectionWindow: () => ipcRenderer.invoke("close-projection-window"),
  onProjectionStateChanged: (callback: (isActive: boolean) => void) => {
    ipcRenderer.on("projection-state-changed", (event, isActive) =>
      callback(isActive)
    );
    return () => {
      ipcRenderer.removeAllListeners("projection-state-changed");
    };
  },
  getImages: (dirPath: string) => ipcRenderer.invoke("get-images", dirPath),
  loadEvPresentations: (path: string) =>
    ipcRenderer.invoke("load-presentations", path),
  createEvPresentation: (
    path: string,
    presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
  ) => ipcRenderer.invoke("create-presentation", path, presentation),
  updateEvPresentation: (
    id: string,
    directoryPath: string,
    presentation: Partial<Presentation>
  ) =>
    ipcRenderer.invoke("update-presentation", id, directoryPath, presentation),
  deleteEvPresentation: (id: string, directory: string) =>
    ipcRenderer.invoke("delete-presentation", id, directory),

  // Bible Presentation API
  createBiblePresentationWindow: (data: any) =>
    ipcRenderer.invoke("create-bible-presentation-window", data),
  sendToBiblePresentation: (data: { type: string; data: any }) =>
    ipcRenderer.invoke("send-to-bible-presentation", data),
  focusMainWindow: () => ipcRenderer.invoke("focus-main-window"),
  openFileInDefaultApp: (filePath: string) =>
    ipcRenderer.invoke("open-file-in-default-app", filePath),
  constructFilePath: (basePath: string, fileName: string) =>
    ipcRenderer.invoke("construct-file-path", basePath, fileName),
  getDisplayInfo: () => ipcRenderer.invoke("get-display-info"),
  logToSecretLogger: (logData: {
    application: string;
    category: string;
    message: string;
    details?: any;
  }) => ipcRenderer.invoke("log-to-secret-logger", logData),
  getSecretLogs: () => ipcRenderer.invoke("get-secret-logs"),
  clearSecretLogs: () => ipcRenderer.invoke("clear-secret-logs"),
  exportSecretLogs: () => ipcRenderer.invoke("export-secret-logs"),
  getLogSettings: () => ipcRenderer.invoke("get-log-settings"),
  updateLogSettings: (settings: any) =>
    ipcRenderer.invoke("update-log-settings", settings),

  // EvPresenter main window communication API
  sendToMainWindow: (data: { type: string; data: any }) =>
    ipcRenderer.invoke("send-to-main-window", data),
  onMainWindowMessage: (
    callback: (event: { type: string; data: any }) => void
  ) => {
    const listener = (
      event: Electron.IpcRendererEvent,
      data: { type: string; data: any }
    ) => {
      callback(data);
    };
    ipcRenderer.on("main-window-message", listener);
    return () => {
      ipcRenderer.removeListener("main-window-message", listener);
    };
  },
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
 * Modern splash screen with Microsoft Word-style animation
 * Uses dark theme and evappicon.png with sophisticated animation
 */
function useLoading() {
  const className = `modern-splash-loader`;
  const styleContent = `
/* Microsoft Word-style fade animation */
@keyframes msWordFade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* Subtle glow animation */
@keyframes logoGlow {
  0% {
    box-shadow: 0 0 20px rgba(154, 103, 74, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(154, 103, 74, 0.4);
  }
  100% {
    box-shadow: 0 0 20px rgba(154, 103, 74, 0.2);
  }
}

/* Background gradient animation */
@keyframes backgroundShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Floating orbs animation */
@keyframes float1 {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(-180deg);
  }
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
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #1e1e1e 50%, #2d2d2d 75%, #1a1a1a 100%);
  background-size: 400% 400%;
  animation: backgroundShift 8s ease-in-out infinite;
  z-index: 9999;
  overflow: hidden;
}

/* Background magical elements */
.app-loading-wrap::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 25% 25%, rgba(45, 45, 45, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(64, 64, 64, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(30, 30, 30, 0.4) 0%, transparent 70%);
  animation: float1 12s ease-in-out infinite;
}

.app-loading-wrap::after {
  content: '';
  position: absolute;
  top: -25%;
  right: -25%;
  width: 150%;
  height: 150%;
  background: conic-gradient(from 180deg at 50% 50%, rgba(45, 45, 45, 0.1) 0deg, rgba(64, 64, 64, 0.2) 180deg, rgba(45, 45, 45, 0.1) 360deg);
  animation: float2 15s ease-in-out infinite reverse;
}

.${className} {
  position: relative;
  z-index: 10;
}

/* Static logo - always visible with subtle glow */
.${className} .logo-static {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 16px;
  animation: logoGlow 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3));
}

/* Animated logo - fades in and out like Microsoft Word */
.${className} .logo-animated {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 16px;
  animation: msWordFade 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 32px rgba(154, 103, 74, 0.4));
}

/* Container for logos */
.${className} .logo-container {
  position: relative;
  width: 80px;
  height: 80px;
}

/* Floating particles */
.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(154, 103, 74, 0.6);
  border-radius: 50%;
  animation: float1 6s ease-in-out infinite;
}

.floating-particle:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: -1s;
}

.floating-particle:nth-child(2) {
  top: 80%;
  right: 20%;
  animation-delay: -2s;
  animation-name: float2;
}

.floating-particle:nth-child(3) {
  bottom: 30%;
  left: 30%;
  animation-delay: -3s;
}

.floating-particle:nth-child(4) {
  top: 40%;
  right: 30%;
  animation-delay: -4s;
  animation-name: float2;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `
    <div class="${className}">
      <div class="logo-container">
        <img class="logo-static" src="./evappicon.png" alt="" />
        <img class="logo-animated" src="./evappicon.png" alt="" />
      </div>
    </div>
    <div class="floating-particle"></div>
    <div class="floating-particle"></div>
    <div class="floating-particle"></div>
    <div class="floating-particle"></div>
  `;

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

setTimeout(removeLoading, 9000);
