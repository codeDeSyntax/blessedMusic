import React, { useState } from "react";
import { Star, StarOff, Copy, Monitor } from "lucide-react";

interface Verse {
  verse: number;
  text: string;
}

interface ScriptureParagraphViewProps {
  verses: Verse[];
  verseRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  selectedVerse: number | null;
  getFontSize: () => string;
  fontFamily: string;
  fontWeight: string;
  theme: string;
  verseTextColor: string;
  getVerseHighlight: (verse: number) => string | null;
  isBookmarked: (verse: number) => boolean;
  toggleBookmark: (verse: number) => void;
  handleShare: (text: string, title: string) => Promise<void>;
  currentBook: string;
  currentChapter: number;
  toggleShowPresentationBgs: (verseNumber: number) => void;
  activeDropdownVerse: number | null;
  bibleBgs: string[];
  handlePresentVerse: (text: string, bgSrc: string, verse: number) => void;
  selectedBg: string | null;
  highlightVerse: (verse: number, color: string) => void;
}

const ScriptureParagraphView: React.FC<ScriptureParagraphViewProps> = ({
  verses,
  verseRefs,
  selectedVerse,
  getFontSize,
  fontFamily,
  fontWeight,
  theme,
  verseTextColor,
  getVerseHighlight,
  isBookmarked,
  toggleBookmark,
  handleShare,
  currentBook,
  currentChapter,
  toggleShowPresentationBgs,
  activeDropdownVerse,
  bibleBgs,
  handlePresentVerse,
  selectedBg,
  highlightVerse,
}) => {
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);

  const formatVerseText = (text: string, highlightColor: string | null) => {
    const parts = text.trim().split(/[\u2039\u203a]/);

    if (parts.length <= 1 && !highlightColor) return text;

    const result = [];
    let isInside = false;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        if (isInside) {
          result.push(
            <span
              key={`red-${i}`}
              style={{ color: "red" }}
              className="underline text-center"
            >
              {parts[i]}
            </span>
          );
        } else {
          result.push(
            <span
              key={`normal-${i}`}
              className="hover:underline text-center"
              style={
                highlightColor
                  ? {
                      backgroundColor: `${highlightColor}80`,
                      color: `${verseTextColor}`,
                      // textDecoration: "underline",
                    }
                  : {}
              }
            >
              {parts[i]}
            </span>
          );
        }
      }
      isInside = !isInside;
    }

    return result;
  };

  return (
    <div
      className={`${getFontSize()} leading-relaxed w-full`}
      style={{
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        color:
          theme === "dark"
            ? verseTextColor || "#f9fafb"
            : verseTextColor || "#78716c",
      }}
    >
      <p className="text-left leading-normal scripturetext">
        {verses.map((verse, index) => (
          <span key={verse.verse} className="relative inline text-center">
            {/* Hidden ref element for scrolling */}
            <div
              ref={(el) => (verseRefs.current[verse.verse] = el)}
              className="absolute"
              style={{ top: "-60px" }}
            />

            {/* Verse number */}
            <sup
              className="text-black dark:text-orange-300 font-anton font-bold cursor-pointer hover:bg-gray-200 bg-gray-100 dark:bg-bgray px-1 py-0.5 rounded mr-1 relative"
              style={{
                fontSize: "0.6em",
                // backgroundColor: hoveredVerse === verse.verse ? (theme === "dark" ? "#374151" : "#e5e7eb") : "transparent"
              }}
              onMouseEnter={() => setHoveredVerse(verse.verse)}
              onMouseLeave={() => setHoveredVerse(null)}
            >
              {verse.verse}

              {/* Action buttons - show on hover */}
              {hoveredVerse === verse.verse && (
                <div className="absolute -top-2 left-full pl-3 flex items-center gap-1 z-10">
                  <div className="flex flex-row items-start gap-1 bg-white dark:bg-stone-800 p-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => toggleBookmark(verse.verse)}
                      className="flex outline-none border-none items-center justify-center h-5 w-5 shadow bg-white dark:bg-ltgray p-1 rounded-full dark:hover:bg-gray-700 hover:bg-gray-100"
                      title={
                        isBookmarked(verse.verse)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                    >
                      {isBookmarked(verse.verse) ? (
                        <Star size={10} className="text-primary" />
                      ) : (
                        <StarOff size={10} className="text-primary" />
                      )}
                    </button>

                    <button
                      onClick={() =>
                        handleShare(
                          `${currentBook} ${currentChapter}:${verse.verse}`,
                          verse.text
                        )
                      }
                      className="flex items-center justify-center h-5 w-5 bg-white dark:bg-ltgray shadow-sm p-1 rounded-full dark:hover:bg-gray-700 hover:bg-gray-100"
                      title="Share or copy verse"
                    >
                      <Copy size={10} className="text-primary" />
                    </button>

                    <div
                      onClick={() => toggleShowPresentationBgs(verse.verse)}
                      className="flex outline-none border-none items-center justify-center h-5 w-5 shadow bg-white dark:bg-ltgray p-1 rounded-full cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-100 relative"
                      title="Show presentation backgrounds"
                    >
                      <Monitor className="text-primary z-20 size-2" />

                      {/* Dropdown menu - only show for the active verse */}
                      {activeDropdownVerse === verse.verse && (
                        <div className="absolute top-6 left-0 bg-white dark:bg-gray-800 shadow-md rounded-md p-1 z-10 w-auto">
                          <div className="flex flex-row -space-x-2 overflow-x-auto py-1 px-1 max-w-40">
                            {bibleBgs.length === 0 &&
                              "No backgrounds available"}
                            {bibleBgs?.map((bg, index) => (
                              <img
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePresentVerse(
                                    verse.text,
                                    bg || bibleBgs[0],
                                    verse.verse
                                  );
                                }}
                                style={{
                                  borderWidth: 2,
                                  borderStyle: "dashed",
                                  borderColor:
                                    theme === "dark" ? "#f9fafb" : "#78716c",
                                }}
                                src={bg}
                                alt={`Bg ${index + 1}`}
                                className={`h-6 w-6 object-cover hover:cursor-pointer rounded-full border-2 border-white dark:border-gray-700
                                  ${
                                    selectedBg === bg
                                      ? "ring-2 ring-primary z-10"
                                      : ""
                                  }
                                  `}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Highlight color options */}
                    <div className="flex flex-row items-center gap-1 bg-white dark:bg-ltgray p-1 rounded-full shadow">
                      {/* Yellow highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "#FFD700")}
                        className="h-3 w-3 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm cursor-pointer"
                        title="Highlight yellow"
                      ></div>
                      {/* Green highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "#4CAF50")}
                        className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600 shadow-sm cursor-pointer"
                        title="Highlight green"
                      ></div>
                      {/* Blue highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "#2196F3")}
                        className="h-3 w-3 rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm cursor-pointer"
                        title="Highlight blue"
                      ></div>
                      {/* Reset highlight */}
                      <div
                        onClick={() => highlightVerse(verse.verse, "reset")}
                        className="h-3 w-3 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-sm cursor-pointer"
                        title="Remove highlight"
                      >
                        <span className="text-xs">×</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </sup>

            {/* Verse text with formatting */}
            <span
              className="hover:underline text-center"
              style={{
                backgroundColor: getVerseHighlight(verse.verse)
                  ? `${getVerseHighlight(verse.verse)}80`
                  : "transparent",
                textDecoration: getVerseHighlight(verse.verse) ? "" : "none",
              }}
            >
              {formatVerseText(
                verse.text.trim(),
                getVerseHighlight(verse.verse)
              )}
            </span>

            {/* Add space between verses */}
            {index < verses.length - 1 && " "}
          </span>
        ))}
      </p>
    </div>
  );
};

export default ScriptureParagraphView;
