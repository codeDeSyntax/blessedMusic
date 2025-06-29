import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AudioLines } from "lucide-react";
import { useSongOperations } from "@/features/songs/hooks/useSongOperations";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";

interface SongSection {
  type: "Verse" | "Chorus";
  content: string[];
  number: number | null;
  pages: string[][];
}

const SongPresentation = () => {
  const [fontSize, setFontSize] = useState<string>("");
  const [fontFamily, setFontFamily] = useState<string>("serif");
  const [presentationBg, setPresentationBg] =
    useState<string>("url(wood7.png)");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [songPages, setSongPages] = useState<
    {
      type: "Verse" | "Chorus";
      content: string[];
      number: number | null;
      pageIndex: number;
    }[]
  >([]);
  const [direction, setDirection] = useState(0);
  const { selectedSong } = useSongOperations();
  const dispatch = useAppDispatch();
  const selectedHymnBackground = null; // TODO: Implement selected background in Redux

  // Settings from local storage
  useEffect(() => {
    const fontSize = localStorage.getItem("fontSize");
    const fontFamily = localStorage.getItem("fontFamily");
    const backgroundImg = localStorage.getItem("bmusicpresentationbg");
    if (fontSize) setFontSize(fontSize);
    if (fontFamily) setFontFamily(fontFamily);
    if (backgroundImg) setPresentationBg(backgroundImg);
  }, []);

  // Song content parsing
  useEffect(() => {
    if (!selectedSong?.content) return;
    const parseSongContent = (content: string) => {
      const sections: SongSection[] = [];
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const paragraphs = Array.from(doc.getElementsByTagName("p"));

      let currentType: "Verse" | "Chorus" | null = null;
      let currentNumber: number | null = null;
      let currentContent: string[] = [];
      let verseCount = 0;
      let chorusCount = 0;

      paragraphs.forEach((p) => {
        const text = p.textContent?.trim() || "";

        if (text.includes("Verse")) {
          if (currentType && currentContent.length > 0) {
            sections.push({
              type: currentType,
              content: currentContent,
              number: currentNumber,
              pages: [],
            });
          }
          verseCount++;
          currentType = "Verse";
          currentNumber = verseCount;
          currentContent = [];
        } else if (text.includes("Chorus")) {
          if (currentType && currentContent.length > 0) {
            sections.push({
              type: currentType,
              content: currentContent,
              number: currentNumber,
              pages: [],
            });
          }
          chorusCount++;
          currentType = "Chorus";
          currentNumber = chorusCount > 1 ? chorusCount : null;
          currentContent = [];
        } else if (text && !text.includes("<!--") && !text.includes("-->")) {
          currentContent.push(text);
        }
      });

      if (currentType && currentContent.length > 0) {
        sections.push({
          type: currentType,
          content: currentContent,
          number: currentNumber,
          pages: [],
        });
      }

      // Convert sections into pages of 6 lines each
      const pages: {
        type: "Verse" | "Chorus";
        content: string[];
        number: number | null;
        pageIndex: number;
      }[] = [];
      sections.forEach((section) => {
        const linesPerPage = 6;
        for (let i = 0; i < section.content.length; i += linesPerPage) {
          pages.push({
            type: section.type,
            content: section.content.slice(i, i + linesPerPage),
            number: section.number,
            pageIndex: Math.floor(i / linesPerPage),
          });
        }
      });

      return pages;
    };

    try {
      const pages = parseSongContent(selectedSong.content);
      setSongPages(pages);
    } catch (error) {
      console.error("Error parsing song content:", error);
    }
  }, [selectedSong]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < songPages.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, songPages.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") handleNext();
      else if (event.key === "ArrowLeft") handlePrev();
      else if (event.key === "Escape") dispatch(setCurrentScreen("Songs"));
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrev, dispatch]);

  // Loading state
  if (!selectedSong || songPages.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <p className="text-xl">Loading song content...</p>
      </div>
    );
  }

  const currentPage = songPages[currentIndex];
  const sectionTitle = `${currentPage.type}${
    currentPage.number ? ` ${currentPage.number}` : ""
  }${currentPage.pageIndex > 0 ? ` (cont.)` : ""} - ${
    selectedSong.title || ""
  }`;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div
        className={`absolute inset-0 ${selectedHymnBackground} bg-cover bg-center bg-gradient-to-r from-blue-900 to-purple-900`}
        style={{
          backgroundBlendMode: "overlay",
          backgroundImage: `url(${presentationBg})`,
          fontFamily: fontFamily,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/40" />

      {/* Content Container */}
      <div className="relative h-screen flex flex-col text-white">
        {/* Title Section */}
        <div className="py-2 text-center">
          <motion.h2
            className="text-2xl md:text-3xl font-light text-shadow-md tracking-wide flex justify-center items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            key={sectionTitle}
          >
            {sectionTitle}
            <AudioLines className="h-6 w-6 opacity-70 animate-pulse" />
          </motion.h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full max-w-6xl mx-auto"
            >
              <div className="flex flex-col items-center space-y-1">
                {currentPage.content.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center font-semibold text-shadow-lg leading-tight tracking-wide"
                    style={{
                      fontSize: `${2.2 + Number(fontSize)}rem`,
                      fontFamily: fontFamily,
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-4">
          {/* Progress Indicators */}
          <div className="flex gap-1">
            {songPages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-1 transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-3 bg-white/50"
                    : "w-1 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                currentIndex === 0
                  ? "bg-white/10 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 active:bg-white/40"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              disabled={currentIndex === songPages.length - 1}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                currentIndex === songPages.length - 1
                  ? "bg-white/10 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 active:bg-white/40"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPresentation;
