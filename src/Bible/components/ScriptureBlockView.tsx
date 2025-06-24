import React from "react";
import { Star, StarOff, Copy, Monitor } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface Verse {
  verse: number;
  text: string;
}

interface ScriptureBlockViewProps {
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

const ScriptureBlockView: React.FC<ScriptureBlockViewProps> = ({
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
  const { isDarkMode } = useTheme();
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
              className="underline"
            >
              {parts[i]}
            </span>
          );
        } else {
          result.push(
            <span
              key={`normal-${i}`}
              style={
                highlightColor
                  ? {
                      backgroundColor: `${highlightColor}80`,
                      color: `${verseTextColor}`,
                      textDecoration: "underline",
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
      className={`flex flex-col ${getFontSize()}`}
      style={{
        fontFamily: fontFamily,
        fontWeight: fontWeight,
      }}
    >
      {verses.map((verse, index) => (
        <div
          key={verse.verse.toString().trim()}
          className={`relative group px-2 rounded-md hover:bg-white dark:hover:bg-bgray/40 transition-colors duration-150 bg-transparent ${
            index === 0 ? "pt-1" : ""
          } ${index === verses.length - 1 ? "pb-1" : ""}`}
          ref={(el) => (verseRefs.current[verse.verse] = el)}
          // style={{ marginBottom: '1px' }}
        >
          <div className="flex items-start">
            {/* Verse number */}
            <div className="flex-shrink-0 text-center pt-1 ml-2">
              <span
                className="text-ltgray dark:text-yellow-700  font-archivo inline-block"
                style={{ fontSize: "0.75em" }}
              >
                {verse.verse}
              </span>
            </div>

            {/* Verse text */}
            <div className="flex-grow">
              <p
                className={`text-left leading-normal px-3 ${
                  theme === "dark" ? "text-gray-50" : "text-red-500"
                } scripturetext pr-10`}
                style={{
                  color:
                    getVerseHighlight(verse.verse) ||
                    (theme === "dark"
                      ? verseTextColor || "#f9fafb"
                      : verseTextColor || "#78716c"),
                  fontSize: getFontSize(),
                  fontFamily: fontFamily,
                  marginBottom: "4px",
                  paddingBottom: 0,
                }}
              >
                {formatVerseText(
                  verse.text.trim(),
                  getVerseHighlight(verse.verse)
                )}
              </p>
              <div
                className=""
                style={{
                  borderWidth: 2,
                  borderColor: !isDarkMode ? "#e1e3e4" : "#432c14",
                  borderStyle: "dashed",
                }}
              />
              <div
                className="mt-1 rounded-full"
                style={{
                  borderWidth: 2,
                  borderColor: !isDarkMode ? "#e1e3e4" : "#432c14",
                  borderStyle: "dashed",
                }}
              />
            </div>
          </div>

          {/* Action buttons - absolutely positioned */}
          <div className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-row items-start gap-1">
              <button
                onClick={() => toggleBookmark(verse.verse)}
                className="flex outline-none border-none items-center justify-center h-6 w-6 shadow bg-white dark:bg-ltgray p-1 rounded-full dark:hover:bg-gray-800 hover:bg-gray-200"
                title={
                  isBookmarked(verse.verse) ? "Remove bookmark" : "Add bookmark"
                }
              >
                {isBookmarked(verse.verse) ? (
                  <Star size={12} className="text-primary" />
                ) : (
                  <StarOff size={12} className="text-primary" />
                )}
              </button>

              <button
                onClick={() =>
                  handleShare(
                    `${currentBook} ${currentChapter}:${verse.verse}`,
                    verse.text
                  )
                }
                className="flex items-center justify-center h-6 w-6 bg-white dark:bg-ltgray shadow-sm p-1 rounded-full dark:hover:bg-gray-800 hover:bg-gray-200"
                title="Share or copy verse"
              >
                <Copy size={12} className="text-primary" />
              </button>

              <div
                onClick={() => toggleShowPresentationBgs(verse.verse)}
                className="flex outline-none border-none items-center justify-center h-6 w-6 shadow bg-white dark:bg-ltgray p-1 rounded-full cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-200 relative"
                title="Show presentation backgrounds"
              >
                <Monitor className="text-primary z-20 size-3" />

                {/* Dropdown menu - only show for the active verse */}
                {activeDropdownVerse === verse.verse && (
                  <div className="absolute top-8 right-0 bg-transparent shadow-md rounded-md p-1 z-10 w-auto">
                    <div className="flex flex-row -space-x-2 overflow-x-auto py-1 px-1 max-w-40">
                      {bibleBgs.length === 0 && "No backgrounds available"}
                      {bibleBgs.map((bg, index) => (
                        <div
                          key={index}
                          className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => handlePresentVerse(verse.text, bg, verse.verse)}
                        >
                          <img
                            src={bg}
                            alt={`Background ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
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
                  className="h-4 w-4 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-sm cursor-pointer"
                  title="Highlight yellow"
                ></div>
                {/* Green highlight */}
                <div
                  onClick={() => highlightVerse(verse.verse, "#4CAF50")}
                  className="h-4 w-4 rounded-full bg-green-500 hover:bg-green-600 shadow-sm cursor-pointer"
                  title="Highlight green"
                ></div>
                {/* Blue highlight */}
                <div
                  onClick={() => highlightVerse(verse.verse, "#2196F3")}
                  className="h-4 w-4 rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm cursor-pointer"
                  title="Highlight blue"
                ></div>
                {/* Reset highlight */}
                <div
                  onClick={() => highlightVerse(verse.verse, "reset")}
                  className="h-4 w-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shadow-sm cursor-pointer"
                  title="Remove highlight"
                >
                  <span className="text-xs">×</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScriptureBlockView;
