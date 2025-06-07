import React from "react";
import { X, Search } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";
import { BookmarkPanel } from "./BookmarkPanel";
import HistoryPanel from "./HistoryPanel";
import LibraryPanel from "./LibraryPanel";
import SettingsPanel from "./SettingsPanel";
// import { theme } from "antd";

const FeaturePanel: React.FC = () => {
  const { activeFeature, setActiveFeature, theme, sidebarExpanded } =
    useBibleContext();

  if (!activeFeature) return null;

  const renderPanel = () => {
    switch (activeFeature) {
      case "favorites":
        return <BookmarkPanel />;
      case "history":
        return <HistoryPanel />;
      case "library":
        return <LibraryPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-64 no-scrollbar md:w-80 border-r bg-white dark:bg-ltgray border-gray-100 dark:border-gray-700 overflow-y-auto h-[calc(100vh-2rem)] fixed top-8 ${
        sidebarExpanded ? "left-48" : "left-12"
      }  transition-all duration-300 `}
      // style={{
      //   scrollbarWidth: "thin",
      //   scrollbarColor:
      //     theme === "light" ? "#f9fafb #f3f4f6" : "#424242 #202020",
      //   // scrollbarGutter: "stable",
      // }}
    >
      {renderPanel()}
    </div>
  );
};

export default FeaturePanel;
