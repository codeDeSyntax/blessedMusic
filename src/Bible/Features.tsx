import React from "react";
import { useAppSelector } from "@/store";
import SearchPanel from "./SearchPanel";
import HistoryPanel from "./HistoryPanel";
import { BookmarkPanel } from "./BookmarkPanel";
import SettingsPanel from "./SettingsPanel";
import LibraryPanel from "./LibraryPanel";

const Features: React.FC = () => {
  const { activeFeature } = useAppSelector((state) => state.bible);

  switch (activeFeature) {
    case "search":
      return <SearchPanel />;
    case "history":
      return <HistoryPanel />;
    case "bookmarks":
      return <BookmarkPanel />;
    case "settings":
      return <SettingsPanel />;
    case "library":
      return <LibraryPanel />;
    default:
      return null;
  }
};

export default Features;
