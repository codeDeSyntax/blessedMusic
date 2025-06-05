import React, { useEffect, useRef, useState, useMemo } from "react";
import { useBibleContext } from "@/Provider/Bible";
import { useEastVoiceContext } from "@/Provider/EastVoice";
import PresentationOverlay from "./PresentationOverlay";
import { useTheme } from "@/Provider/Theme";
import LanguageToggler from "./components/LanguagesToggle";
import NavigationBar from "./components/Navigator";
import ScriptureBlockView from "./components/ScriptureBlockView";
import ScriptureParagraphView from "./components/ScriptureParagraphView";

export type ViewMode = "block" | "paragraph";

interface Book {
  name: string;
  testament: string;
  chapters: { chapter: number }[];
}

const ScriptureContent: React.FC = () => {
  const {
    getCurrentChapterVerses,
    currentBook,
    setCurrentBook,
    currentChapter,
    setCurrentChapter,
    currentVerse,
    setCurrentVerse,
    getBookChapterCount,
    theme,
    fontSize,
    fontFamily,
    fontWeight,
    verseTextColor,
    bookmarks,
    addBookmark,
    removeBookmark,
    addToHistory,
    bookList,
    bibleData,
    currentTranslation,
  } = useBibleContext();

  const { bibleBgs } = useEastVoiceContext();
  const { isDarkMode } = useTheme();

  // State for dropdowns
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isVerseDropdownOpen, setIsVerseDropdownOpen] = useState(false);

  // State for verse tracking and interaction
  const [visibleVerses, setVisibleVerses] = useState<number[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(
    currentVerse || null
  );
  const [highlightedVerses, setHighlightedVerses] = useState<{
    [key: string]: string;
  }>({});
  const [activeDropdownVerse, setActiveDropdownVerse] = useState<number | null>(
    null
  );

  // State for presentation
  const [presentationCurrentVerse, setPresentationCurrentVerse] =
    useState<number>(1);
  const [presentationNavigation, setPresentationNavigation] = useState<{
    book: string;
    chapter: number;
    verse: number;
  }>({
    book: currentBook,
    chapter: currentChapter,
    verse: 1,
  });
  const [isPresentingVerse, setIsPresentingVerse] = useState(false);
  const [presentationText, setPresentationText] = useState("");
  const [presentationBg, setPresentationBg] = useState("");

  // New state for view mode
  const [viewMode, setViewMode] = useState<ViewMode>("block");

  const verses = useMemo(() => {
    return getCurrentChapterVerses();
  }, [currentBook, currentChapter, currentTranslation, bibleData]);

  const contentRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const chapterCount = getBookChapterCount(currentBook);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);

  // Update visible verses logic
  const updateVisibleVerses = () => {
    if (!contentRef.current) return;

    const container = contentRef.current;
    const visibleVerseNumbers: number[] = [];

    Object.entries(verseRefs.current).forEach(([verseNum, ref]) => {
      if (!ref) return;

      const rect = ref.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const topRelativeToContainer = rect.top - containerRect.top;
      const bottomRelativeToContainer = rect.bottom - containerRect.top;

      if (
        bottomRelativeToContainer > 0 &&
        topRelativeToContainer < container.clientHeight
      ) {
        visibleVerseNumbers.push(parseInt(verseNum));
      }
    });

    if (
      visibleVerseNumbers.length > 0 &&
      visibleVerseNumbers[0] !== selectedVerse
    ) {
      setSelectedVerse(visibleVerseNumbers[0]);
    }
  };

  // Scroll event listener
  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", updateVisibleVerses);
      return () => {
        container.removeEventListener("scroll", updateVisibleVerses);
      };
    }
  }, [contentRef.current]);

  // Reset when chapter changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setSelectedVerse(null);
    setIsVerseDropdownOpen(false);
  }, [currentBook, currentChapter, currentVerse]);

  // Scroll to current verse
  useEffect(() => {
    if (currentVerse && verseRefs.current[currentVerse]) {
      setTimeout(() => {
        verseRefs.current[currentVerse]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 300);
    }
  }, [currentVerse, currentBook, currentChapter]);

  // Navigation handlers
  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`);
      setCurrentChapter(Number(currentChapter) - 1);
    }
    setCurrentVerse(1);
  };

  const handleNextChapter = () => {
    if (currentChapter < chapterCount) {
      addToHistory(`${currentBook} ${currentChapter}`);
      setCurrentChapter(Number(currentChapter) + 1);
      setCurrentVerse(1);
    }
  };

  // Bookmark functions
  const isBookmarked = (verse: number) => {
    return bookmarks.includes(`${currentBook} ${currentChapter}:${verse}`);
  };

  const toggleBookmark = (verse: number) => {
    const reference = `${currentBook} ${currentChapter}:${verse}`;
    if (isBookmarked(verse)) {
      removeBookmark(reference);
    } else {
      addBookmark(reference);
    }
  };

  // Highlight functions
  const highlightVerse = (verse: number, color: string) => {
    const verseKey = `${currentBook}-${currentChapter}-${verse}`;

    if (color === "reset") {
      const newHighlights = { ...highlightedVerses };
      delete newHighlights[verseKey];
      setHighlightedVerses(newHighlights);
    } else {
      setHighlightedVerses({
        ...highlightedVerses,
        [verseKey]: color,
      });
    }
  };

  const getVerseHighlight = (verse: number) => {
    const verseKey = `${currentBook}-${currentChapter}-${verse}`;
    return highlightedVerses[verseKey] || null;
  };

  // Dropdown toggle functions
  const toggleShowPresentationBgs = (verseNumber: number) => {
    if (activeDropdownVerse === verseNumber) {
      setActiveDropdownVerse(null);
    } else {
      setActiveDropdownVerse(verseNumber);
    }
  };

  // Font size helper
  const getFontSize = () => {
    switch (fontSize) {
      case "small":
        return "text-xl";
      case "medium":
        return "text-4xl";
      case "large":
        return "text-6xl";
      case "xl":
        return "text-8xl";
      case "2xl":
        return "text-9xl";
      default:
        return "text-base";
    }
  };

  // Share function
  const handleShare = async (text: string, title: string) => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: window.location.href,
        });
        console.log("Content shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        const shareText = `${title}\n\n${text}`;
        await navigator.clipboard.writeText(shareText);

        const notification = document.createElement("div");
        notification.textContent = "Copied to clipboard!";
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.left = "50%";
        notification.style.transform = "translateX(-50%)";
        notification.style.backgroundColor =
          theme === "dark" ? "#333" : "#f0f0f0";
        notification.style.color = theme === "dark" ? "#fff" : "#333";
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "5px";
        notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        notification.style.zIndex = "1000";

        document.body.appendChild(notification);

        setTimeout(() => {
          document.body.removeChild(notification);
        }, 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        alert(
          "Failed to copy to clipboard. Your browser may not support this feature."
        );
      }
    }
  };

  // Selection handlers
  const handleBookSelect = (book: string) => {
    if (currentBook !== book) {
      addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`);
    }

    setCurrentBook(book);
    setCurrentChapter(1);
    setCurrentVerse(1);
    setSelectedVerse(1);
    setIsBookDropdownOpen(false);

    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      setIsChapterDropdownOpen(true);
    }, 100);
  };

  const handleChapterSelect = (chapter: number) => {
    if (currentChapter !== chapter) {
      addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`);
    }

    setCurrentChapter(chapter);
    setCurrentVerse(1);
    setSelectedVerse(1);
    setIsChapterDropdownOpen(false);

    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      setIsVerseDropdownOpen(true);
    }, 100);
  };

  const handleVerseSelect = (verse: number) => {
    setSelectedVerse(verse);
    setIsVerseDropdownOpen(false);
    if (verseRefs.current[verse]) {
      verseRefs.current[verse]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    addToHistory(`${currentBook} ${currentChapter}:${verse}`);
  };

  // Get chapters and verses
  const getChapters = () => {
    const bookData = bibleData[currentTranslation]?.books.find(
      (b: Book) => b.name === currentBook
    );
    return bookData?.chapters.map((chapter) => chapter.chapter) || [];
  };

  const getVerses = () => {
    return verses.map((verse) => verse.verse);
  };

  // Presentation functions
  const handlePresentVerse = (text: string, bgSrc: string, verse: number) => {
    setPresentationText(text);
    setPresentationBg(bgSrc);
    setPresentationNavigation({
      book: currentBook,
      chapter: currentChapter,
      verse: verse,
    });
    setPresentationCurrentVerse(verse);
    setIsPresentingVerse(true);
  };

  const handlePresentationNavigation = (direction: "prev" | "next") => {
    const currentVerses = getCurrentChapterVerses();
    const currentVerseIndex = currentVerses.findIndex(
      (v) => v.verse === presentationCurrentVerse
    );
    const chapterVerseCount = currentVerses.length;

    if (direction === "next" && currentVerseIndex < chapterVerseCount - 1) {
      const nextVerse = currentVerses[currentVerseIndex + 1];
      setPresentationCurrentVerse(nextVerse.verse);
      setPresentationText(nextVerse.text);
    } else if (direction === "prev" && currentVerseIndex > 0) {
      const prevVerse = currentVerses[currentVerseIndex - 1];
      setPresentationCurrentVerse(prevVerse.verse);
      setPresentationText(prevVerse.text);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".book-dropdown") && isBookDropdownOpen) {
        setIsBookDropdownOpen(false);
      }
      if (!target.closest(".chapter-dropdown") && isChapterDropdownOpen) {
        setIsChapterDropdownOpen(false);
      }
      if (!target.closest(".verse-dropdown") && isVerseDropdownOpen) {
        setIsVerseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  const iconColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`;
    };
    return {
      color1: generateRandomColor(),
      color2: generateRandomColor(),
      color3: generateRandomColor(),
      color4: generateRandomColor(),
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-ltgray text-white font-serif">
      <NavigationBar
        currentBook={currentBook}
        currentChapter={currentChapter}
        currentVerse={currentVerse}
        selectedVerse={selectedVerse}
        chapterCount={chapterCount}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isBookDropdownOpen={isBookDropdownOpen}
        setIsBookDropdownOpen={setIsBookDropdownOpen}
        isChapterDropdownOpen={isChapterDropdownOpen}
        setIsChapterDropdownOpen={setIsChapterDropdownOpen}
        isVerseDropdownOpen={isVerseDropdownOpen}
        setIsVerseDropdownOpen={setIsVerseDropdownOpen}
        handlePreviousChapter={handlePreviousChapter}
        handleNextChapter={handleNextChapter}
        handleBookSelect={handleBookSelect}
        handleChapterSelect={handleChapterSelect}
        handleVerseSelect={handleVerseSelect}
        getChapters={getChapters}
        getVerses={getVerses}
        bookList={bookList}
        iconColors={iconColors}
      />

      <PresentationOverlay
        backgroundSrc={presentationBg}
        text={presentationText}
        isPresenting={isPresentingVerse}
        onClose={() => setIsPresentingVerse(false)}
        onNext={() => handlePresentationNavigation("next")}
        onPrev={() => handlePresentationNavigation("prev")}
        currentVerse={presentationCurrentVerse}
        totalVerses={getCurrentChapterVerses().length}
      />

      <div
        ref={contentRef}
        className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-scroll no-scrollbar text-stone-500 relative ${
          isDarkMode ? "dottedb1" : "dottedb"
        }`}
        onScroll={updateVisibleVerses}
      >
        <LanguageToggler color={iconColors.color2} />

        {verses.length > 0 ? (
          viewMode === "block" ? (
            <ScriptureBlockView
              verses={verses}
              verseRefs={verseRefs}
              selectedVerse={selectedVerse}
              getFontSize={getFontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              theme={theme}
              verseTextColor={verseTextColor}
              getVerseHighlight={getVerseHighlight}
              isBookmarked={isBookmarked}
              toggleBookmark={toggleBookmark}
              handleShare={handleShare}
              currentBook={currentBook}
              currentChapter={currentChapter}
              toggleShowPresentationBgs={toggleShowPresentationBgs}
              activeDropdownVerse={activeDropdownVerse}
              bibleBgs={bibleBgs}
              handlePresentVerse={handlePresentVerse}
              selectedBg={selectedBg}
              highlightVerse={highlightVerse}
            />
          ) : (
            <ScriptureParagraphView
              verses={verses}
              verseRefs={verseRefs}
              selectedVerse={selectedVerse}
              getFontSize={getFontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              theme={theme}
              verseTextColor={verseTextColor}
              getVerseHighlight={getVerseHighlight}
              isBookmarked={isBookmarked}
              toggleBookmark={toggleBookmark}
              handleShare={handleShare}
              currentBook={currentBook}
              currentChapter={currentChapter}
              toggleShowPresentationBgs={toggleShowPresentationBgs}
              activeDropdownVerse={activeDropdownVerse}
              bibleBgs={bibleBgs}
              handlePresentVerse={handlePresentVerse}
              selectedBg={selectedBg}
              highlightVerse={highlightVerse}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading scripture content...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptureContent;
