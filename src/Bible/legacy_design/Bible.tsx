import React, { useEffect } from "react";
import TitleBar from "./Titlebar";
import BibleSidebar from "./Sidebar";
import FeaturePanel from "./Features";
import ScriptureContent from "./ScriptureContent";
import SearchPanel from "./SearchPanel";
import Help from "@/shared/Help";
import { useAppSelector } from "@/store";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

const Biblelayout: React.FC = () => {
  const { sidebarExpanded, activeFeature, searchOpen, theme } = useAppSelector((state) => state.bible);
  const { initializeBibleData } = useBibleOperations();

  // Initialize Bible data
  useEffect(() => {
    initializeBibleData();
  }, [initializeBibleData]);

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

  // Calculate content padding based on sidebar and panel states
  const getContentClass = () => {
    if (activeFeature || searchOpen) {
      return sidebarExpanded ? "pl-48 md:pl-[512px]" : "pl-12 md:pl-[368px]";
    }
    return sidebarExpanded ? "pl-48" : "pl-12";
  };

  return (
    <div
      className="h-screen flex flex-col overflow-y-scroll bg-white dark:bg-ltgray no-scrollbar text-gray-900 dark:text-gray-100"
      id="biblediv"
    >
      <TitleBar />
      {/* <Help/> */}

      <div className="flex-1 flex overflow-hidden">
        <BibleSidebar />

        {/* Feature panels */}
        {activeFeature && <FeaturePanel />}

        {/* Search panel */}
        <SearchPanel />

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ${getContentClass()}`}
        >
          <ScriptureContent />
        </main>
      </div>
    </div>
  );
};

export default Biblelayout;
