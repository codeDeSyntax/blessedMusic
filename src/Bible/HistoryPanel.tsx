import React, { useMemo, useState } from "react";
import { X, Clock } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";
import { useTheme } from "@/Provider/Theme";

const HistoryPanel: React.FC = () => {
  const {
    setActiveFeature,
    history,
    setCurrentBook,
    setCurrentChapter,
    currentVerse,
    setCurrentVerse,
  } = useBibleContext();
  const { isDarkMode } = useTheme();

  const handleHistoryClick = (reference: string) => {
    // Check if reference includes a verse (format: "Book Chapter:Verse")
    if (reference.includes(":")) {
      const [chapterPart, versePart] = reference.split(":");
      const verse = parseInt(versePart);

      // Handle chapter part which contains book and chapter
      const parts = chapterPart.split(" ");
      const chapterNumber = parseInt(parts[parts.length - 1]);
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      setCurrentBook(bookName);
      setCurrentChapter(chapterNumber);
      setCurrentVerse(null);
      setCurrentVerse(verse);
    } else {
      // Original handling for just book and chapter
      const parts = reference.split(" ");
      const chapterNumber = parseInt(parts[parts.length - 1]);
      const bookName = parts.slice(0, parts.length - 1).join(" ");

      setCurrentBook(bookName);
      setCurrentChapter(chapterNumber);
      setCurrentVerse(1); // Reset verse when navigating to just a chapter
    }

    setActiveFeature(null);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const bgColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},0.8)`;
    };

    return {
      cl1: generateRandomColor(),
      cl2: generateRandomColor(),
      cl3: generateRandomColor(),
      cl4: generateRandomColor(),
      cl5: generateRandomColor(),
      cl6: generateRandomColor(),
    };
  }, []);

  return (
    <div
      className="h-full overflow-y-scroll no-scrollbar p-4 bg-gray-50 dark:bg-black font-serif"

      // style={{
      //   scrollbarWidth: "thin",
      //   scrollbarColor: !isDarkMode ? "#f9fafb #3f63aa" : "#424242 #202020",
      //   // scrollbarGutter: "stable",
      // }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          History
        </h2>
        <button
          onClick={() => setActiveFeature(null)}
          className="p1 hover:bg-gray-100 bg-gray-50 shadow dark:bg-bgray dark:hover:bg-bgray rounded"
        >
          <X size={20} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      <div className="grid grid-cols-2 flexcol gap-2">
        {history.length > 0 ? (
          history.map((item, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(item.reference)}
              className="flex flex-col group items-start p-2 px-4 shadow bg-gray-100 dark:bg-bgray hover:bg-gray-200 dark:hover:bg-bgray/40 rounded-full text-left transition-colors "
              style={{
                // backgroundColor: "#f9fafb",
                fontFamily: "Palatino",
              }}
            >
              <span
                className=" text-gray-900 dark:text-white  text-[12px] font-bold shadow px-1 bg-white dark:bg-primary  rounded-full truncate"
                // style={{
                //   color: bgColors.cl3,
                // }}
              >
                {item.reference}
              </span>
              <span
                className="text-[10px] text-gray-500 dark:text-white bg-white dark:bg-[#674f34]  rounded-full p-1 flex items-center mt-1"
                style={{
                  color: !isDarkMode ? bgColors.cl3 : "white",
                  textShadow: "0px 0px 1px rgba(0, 0, 0, 0.9)",
                }}
              >
                {/* <Clock size={12} className="mr-1" />{" "} */}
                {formatTimestamp(item.timestamp)}
              </span>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No history yet
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
