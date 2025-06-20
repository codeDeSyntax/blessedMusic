import React, { useMemo, useEffect } from "react";
import { Menu, X, Search, Star, RotateCcw, Book, Settings } from "lucide-react";
import { useBibleOperations } from "../features/bible/hooks/useBibleOperations";
import { useAppSelector, useAppDispatch } from "../store";
import { setSidebarExpanded, setActiveFeature, setSearchOpen, BibleFeature } from "../store/slices/bibleSlice";

const BibleSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarExpanded, activeFeature, searchOpen } = useAppSelector((state) => state.bible);
  const theme = useAppSelector((state) => state.app.theme);
  const {
    // Bible operations...
  } = useBibleOperations();

  const handleSetSidebarExpanded = (expanded: boolean) => dispatch(setSidebarExpanded(expanded));
  const handleSetActiveFeature = (feature: BibleFeature) => dispatch(setActiveFeature(feature));
  const handleSetSearchOpen = (open: boolean) => dispatch(setSearchOpen(open));

  useEffect(() => {
    const hisvoicediv = document.getElementById("hisvoicediv");
    if (theme === "dark") {
      hisvoicediv?.classList.add("dark");
      localStorage.setItem("vsermontheme", theme);
    } else {
      hisvoicediv?.classList.remove("dark");
      localStorage.setItem("vsermontheme", theme);
    }
  }, [theme]);

  // Generate random colors only once on component mount using useMemo
  const iconColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`;
    };

    return {
      menu: generateRandomColor(),
      search: generateRandomColor(),
      bookmark: generateRandomColor(),
      history: generateRandomColor(),
      library: generateRandomColor(),
      settings: generateRandomColor(),
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  const toggleSidebar = () => {
    handleSetSidebarExpanded(!sidebarExpanded);
  };

  const toggleFeature = (feature: BibleFeature) => {
    if (activeFeature === feature) {
      handleSetActiveFeature(null);
    } else {
      handleSetActiveFeature(feature);
    }
  };

  const toggleSearch = () => {
    handleSetSearchOpen(!searchOpen);
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-black flex flex-col fixed left-0 top-8 h-[calc(100vh-2rem)]  shadow-md transition-all duration-300 ${
        sidebarExpanded ? "w-48" : "w-12"
      }`}
    >
      {/* Top sidebar button */}
      <div
        onClick={toggleSidebar}
        className="p-3 text-gray-900 dark:text-gray-300 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-ltgray text-left"
      >
        {sidebarExpanded ? (
          <X size={20} color={iconColors.menu} />
        ) : (
          <Menu size={20} color={iconColors.menu} />
        )}
      </div>

      {/* Sidebar menu items */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black">
        <div
          onClick={toggleSearch}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-ltgray ${
            searchOpen ? "bg-gray-200 dark:bg-ltgray" : ""
          }`}
        >
          <Search size={20} color={iconColors.search} />
          {sidebarExpanded && <span className="ml-3">Search</span>}
        </div>
        <div
          onClick={() => toggleFeature("bookmarks")}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-ltgray ${
            activeFeature === "bookmarks" ? "bg-gray-200 dark:bg-gray-800" : ""
          }`}
        >
          <Star size={20} color={iconColors.bookmark} />
          {sidebarExpanded && <span className="ml-3">Bookmarks</span>}
        </div>
        <div
          onClick={() => toggleFeature("history")}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-ltgray ${
            activeFeature === "history" ? "bg-gray-200 dark:bg-gray-800" : ""
          }`}
        >
          <RotateCcw size={20} color={iconColors.history} />
          {sidebarExpanded && <span className="ml-3">History</span>}
        </div>
        <div
          onClick={() => toggleFeature("library")}
          className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-ltgray ${
            activeFeature === "library" ? "bg-gray-200 dark:bg-gray-800" : ""
          }`}
        >
          <Book size={20} color={iconColors.library} />
          {sidebarExpanded && <span className="ml-3">Library</span>}
        </div>
      </div>

      {/* Settings at bottom */}
      <div
        onClick={() => toggleFeature("settings")}
        className={`p-3 flex items-center font-serif text-gray-900 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-ltgray ${
          activeFeature === "settings" ? "bg-gray-200 dark:bg-gray-800" : ""
        }`}
      >
        <Settings size={20} color={iconColors.settings} />
        {sidebarExpanded && <span className="ml-3">Settings</span>}
      </div>
    </div>
  );
};

export default BibleSidebar;
