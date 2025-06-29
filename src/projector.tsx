import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./Provider/Theme";
import SongPresentation from "./vmusic/PresentationMode";
import { DisplayInfo } from "./types/electron-api";
import { setCurrentScreen } from "./store/slices/appSlice";
import "./index.css";

const ProjectorContent: React.FC = () => {
  // Listen for display info
  useEffect(() => {
    const handleDisplayInfo = (info: DisplayInfo) => {
      const container = document.getElementById("root");
      if (container) {
        container.classList.toggle("external-display", info.isExternalDisplay);
        // Apply any additional styling for external display
        if (info.isExternalDisplay) {
          container.style.width = `${info.displayBounds.width}px`;
          container.style.height = `${info.displayBounds.height}px`;
        }
      }
    };

    const api = window.api as unknown as { onDisplayInfo: (callback: (info: DisplayInfo) => void) => () => void };
    const cleanup = api.onDisplayInfo(handleDisplayInfo);

    return () => {
      cleanup?.();
    };
  }, []);

  return <SongPresentation />;
};

const ProjectorApp: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ProjectorContent />
      </ThemeProvider>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ProjectorApp />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
