import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import PresentationOverlay from "./PresentationOverlay";
import { useTheme } from "@/Provider/Theme";
import LanguageToggler from "./components/LanguagesToggle";
import FloatingActionBar from "./components/FloatingActionBar";
import ScriptureBlockView from "./components/ScriptureBlockView";
import ScriptureParagraphView from "./components/ScriptureParagraphView";
import VerseByVerseView from "./components/VerseByVerseView";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import {
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setVerseTextColor,
  addBookmark,
  removeBookmark,
  addToHistory,
} from "@/store/slices/bibleSlice";

export type ViewMode = "block" | "paragraph" | "verse-by-verse";

interface Book {
  name: string;
  testament: string;
  chapters: { chapter: number }[];
}

const ScriptureContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses, getBookChapterCount } = useBibleOperations();

  // Select state from Redux
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const theme = useAppSelector((state) => state.bible.theme);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const bookList = useAppSelector((state) => state.bible.bookList);
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const verseByVerseMode = useAppSelector(
    (state) => state.bible.verseByVerseMode
  );
  const isFullScreen = useAppSelector((state) => state.bible.isFullScreen);
  const imageBackgroundMode = useAppSelector(
    (state) => state.bible.imageBackgroundMode
  );
  const selectedBackground = useAppSelector(
    (state) => state.bible.selectedBackground
  );

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
  const [viewMode, setViewMode] = useState<ViewMode>("block"); // Auto-scroll state and functionality
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(25); // pixels per second for comfortable reading speed
  const [autoScrollStatus, setAutoScrollStatus] = useState<string | null>(null); // Status message for auto-scroll
  const autoScrollAnimationRef = useRef<number | null>(null);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserScrollRef = useRef<number>(0);
  const isNavigatingRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const accumulatedScrollRef = useRef<number>(0); // Auto-scroll functions - truly smooth continuous flow using requestAnimationFrame
  const startAutoScroll = useCallback(() => {
    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current);
    }

    // Start from current verse position if available and not currently navigating
    if (
      currentVerse &&
      verseRefs.current[currentVerse] &&
      !isNavigatingRef.current
    ) {
      verseRefs.current[currentVerse]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // Reset timing and accumulation
    lastTimeRef.current = 0;
    accumulatedScrollRef.current = 0;

    const animateScroll = (currentTime: number) => {
      if (!isAutoScrolling) return;

      // Initialize timing on first frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        autoScrollAnimationRef.current = requestAnimationFrame(animateScroll);
        return;
      }

      // Calculate time delta for smooth, frame-rate independent scrolling
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Only scroll if user hasn't interacted recently
      const now = Date.now();
      if (now - lastUserScrollRef.current > 1000 && contentRef.current) {
        const container = contentRef.current;
        const scrollHeight = container.scrollHeight - container.clientHeight;

        // Calculate smooth scroll distance based on speed and time delta
        // This creates truly continuous, flowing movement
        const scrollDistance = (autoScrollSpeed * deltaTime) / 1000; // pixels per frame
        accumulatedScrollRef.current += scrollDistance;

        // Apply the accumulated scroll in small, smooth increments
        const currentScroll = container.scrollTop;
        if (currentScroll < scrollHeight) {
          // Smooth continuous scrolling - no discrete jumps
          container.scrollTop = Math.min(
            currentScroll + scrollDistance,
            scrollHeight
          );
        } else {
          // Reached the bottom - pause and restart
          cancelAnimationFrame(autoScrollAnimationRef.current!);
          setAutoScrollStatus("Pausing...");
          setTimeout(() => {
            if (isAutoScrolling && contentRef.current) {
              setAutoScrollStatus("Restarting...");
              contentRef.current.scrollTop = 0;
              accumulatedScrollRef.current = 0;
              setTimeout(() => {
                setAutoScrollStatus(null);
                if (isAutoScrolling) {
                  startAutoScroll();
                }
              }, 500);
            }
          }, 3000);
          return;
        }
      }

      // Continue the animation loop
      autoScrollAnimationRef.current = requestAnimationFrame(animateScroll);
    };

    // Start the smooth animation loop
    autoScrollAnimationRef.current = requestAnimationFrame(animateScroll);
  }, [autoScrollSpeed, currentVerse, isAutoScrolling]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollAnimationRef.current) {
      cancelAnimationFrame(autoScrollAnimationRef.current);
      autoScrollAnimationRef.current = null;
    }
    setAutoScrollStatus(null);
    accumulatedScrollRef.current = 0;
  }, []);

  const pauseAutoScrollTemporarily = useCallback(() => {
    if (isAutoScrolling && !isNavigatingRef.current) {
      lastUserScrollRef.current = Date.now();

      // Clear existing timeout
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }

      // Resume auto-scroll after 4 seconds of no user interaction
      userInteractionTimeoutRef.current = setTimeout(() => {
        if (isAutoScrolling) {
          lastUserScrollRef.current = 0; // Reset to allow auto-scroll to resume
        }
      }, 4000);
    }
  }, [isAutoScrolling]);

  const toggleAutoScroll = useCallback(() => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      stopAutoScroll();
      // Clear user interaction timeout when manually stopping
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    } else {
      setIsAutoScrolling(true);
      lastUserScrollRef.current = 0; // Reset user interaction tracking
      startAutoScroll();
    }
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  // Handle user scroll interaction
  useEffect(() => {
    const handleUserScroll = (e: Event) => {
      // Don't interfere if this is navigation-triggered scroll
      if (isNavigatingRef.current) return;

      pauseAutoScrollTemporarily();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
          e.key
        )
      ) {
        pauseAutoScrollTemporarily();
      }
    };

    if (isAutoScrolling && contentRef.current) {
      // Listen for scroll events on the main content container
      contentRef.current.addEventListener("scroll", handleUserScroll, {
        passive: true,
      });
      contentRef.current.addEventListener("wheel", handleUserScroll, {
        passive: true,
      });
      contentRef.current.addEventListener("touchmove", handleUserScroll, {
        passive: true,
      });
      // Listen for keyboard events on the window
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleUserScroll);
        contentRef.current.removeEventListener("wheel", handleUserScroll);
        contentRef.current.removeEventListener("touchmove", handleUserScroll);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAutoScrolling, pauseAutoScrollTemporarily]);

  // Handle navigation changes - temporarily pause auto-scroll during navigation
  useEffect(() => {
    isNavigatingRef.current = true;
    const timeoutId = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000); // Allow 1 second for navigation to complete

    return () => clearTimeout(timeoutId);
  }, [currentBook, currentChapter, currentVerse]);

  // Start/stop auto-scroll when state changes
  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => {
      stopAutoScroll();
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, [isAutoScrolling, startAutoScroll, stopAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScrollAnimationRef.current) {
        cancelAnimationFrame(autoScrollAnimationRef.current);
      }
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, []);

  // Function to open Bible presentation window directly
  const handleOpenBiblePresentation = () => {
    // Prepare presentation data
    if (currentBook && currentChapter && bibleData && currentTranslation) {
      const translationData = bibleData[currentTranslation];
      if (translationData && translationData.books) {
        const bookData = translationData.books.find(
          (book: any) => book.name === currentBook
        );

        if (bookData) {
          const chapterData = bookData.chapters?.find(
            (ch: any) => ch.chapter === currentChapter
          );

          if (chapterData?.verses) {
            const presentationData = {
              book: currentBook,
              chapter: currentChapter,
              verses: chapterData.verses,
              translation: currentTranslation,
              selectedVerse: currentVerse || undefined,
            };

            // Default settings
            const settings = {
              fontSize: 6,
              textColor: "#ffffff",
              backgroundColor: "#1e293b",
              versesPerSlide: 1,
            };

            // Open external presentation window directly
            if (typeof window !== "undefined" && window.api) {
              window.api.createBiblePresentationWindow({
                presentationData,
                settings,
              });
            }
          }
        }
      }
    }
  };

  // Function to send live updates to presentation window
  const sendLiveUpdateToPresentation = useCallback(() => {
    if (currentBook && currentChapter && bibleData && currentTranslation) {
      const translationData = bibleData[currentTranslation];
      if (translationData && translationData.books) {
        const bookData = translationData.books.find(
          (book: any) => book.name === currentBook
        );

        if (bookData) {
          const chapterData = bookData.chapters?.find(
            (ch: any) => ch.chapter === currentChapter
          );

          if (chapterData?.verses) {
            const presentationData = {
              book: currentBook,
              chapter: currentChapter,
              verses: chapterData.verses,
              translation: currentTranslation,
              selectedVerse: currentVerse || undefined,
            };

            // Send update to presentation window
            if (typeof window !== "undefined" && window.api) {
              window.api.sendToBiblePresentation({
                type: "update-data",
                data: presentationData,
              });
            }
          }
        }
      }
    }
  }, [
    currentBook,
    currentChapter,
    currentTranslation,
    currentVerse,
    bibleData,
  ]);

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

  // set versetextcolor on theme change
  useEffect(() => {
    if (isDarkMode) {
      dispatch(setVerseTextColor("#fcd8c0"));
    } else {
      dispatch(setVerseTextColor("#1d1c1c"));
    }
  }, [isDarkMode, dispatch]);

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

  // Send live updates to presentation window when navigation changes
  useEffect(() => {
    // Add a small delay to avoid sending too many updates during rapid navigation
    const timeoutId = setTimeout(() => {
      sendLiveUpdateToPresentation();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    sendLiveUpdateToPresentation,
    currentBook,
    currentChapter,
    currentTranslation,
    currentVerse,
  ]);

  // Scroll to current verse
  useEffect(() => {
    if (currentVerse) {
      // Use a longer timeout to ensure DOM updates and navigation complete
      const timeout = setTimeout(() => {
        // Try multiple methods to find and scroll to the verse
        const scrollToVerse = () => {
          // Method 1: Use ref
          const verseElement = verseRefs.current[currentVerse];
          if (verseElement) {
            verseElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            return true;
          }

          // Method 2: Use data attribute selector
          const verseByDataAttr = document.querySelector(
            `[data-verse="${currentVerse}"]`
          ) as HTMLElement;
          if (verseByDataAttr) {
            verseByDataAttr.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            return true;
          }

          return false;
        };

        // Try immediately
        if (!scrollToVerse()) {
          // If first attempt fails, try again after a short delay
          setTimeout(scrollToVerse, 200);
        }
      }, 500); // Increased timeout for better reliability

      return () => clearTimeout(timeout);
    }
  }, [currentVerse, currentBook, currentChapter, viewMode]); // Added viewMode dependency

  // Navigation handlers
  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      dispatch(
        addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`)
      );
      dispatch(setCurrentChapter(Number(currentChapter) - 1));
    }
    dispatch(setCurrentVerse(1));
  };

  const handleNextChapter = () => {
    if (currentChapter < chapterCount) {
      dispatch(addToHistory(`${currentBook} ${currentChapter}`));
      dispatch(setCurrentChapter(Number(currentChapter) + 1));
      dispatch(setCurrentVerse(1));
    }
  };

  // Bookmark functions
  const isBookmarked = (verse: number) => {
    return bookmarks.includes(`${currentBook} ${currentChapter}:${verse}`);
  };

  const toggleBookmark = (verse: number) => {
    const reference = `${currentBook} ${currentChapter}:${verse}`;
    if (isBookmarked(verse)) {
      dispatch(removeBookmark(reference));
    } else {
      dispatch(addBookmark(reference));
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
      dispatch(
        addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`)
      );
    }

    dispatch(setCurrentBook(book));
    dispatch(setCurrentChapter(1));
    dispatch(setCurrentVerse(1));
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
      dispatch(
        addToHistory(`${currentBook} ${currentChapter}:${selectedVerse || 1}`)
      );
    }

    dispatch(setCurrentChapter(chapter));
    dispatch(setCurrentVerse(1));
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
    // Also update currentVerse for external projection sync
    dispatch(setCurrentVerse(verse));
    if (verseRefs.current[verse]) {
      verseRefs.current[verse]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    dispatch(addToHistory(`${currentBook} ${currentChapter}:${verse}`));
    addToHistory(`${currentBook} ${currentChapter}:${verse}`);
  };

  // Handler for verse clicks to set current verse
  const handleVerseClick = (verse: number) => {
    // Update both selectedVerse and currentVerse for consistency
    setSelectedVerse(verse);
    dispatch(setCurrentVerse(verse));
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

  // Handle verse-by-verse navigation
  const handleVerseByVerseNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      handlePreviousChapter();
    } else {
      handleNextChapter();
    }
  };

  // Initialize current verse if not set
  useEffect(() => {
    if (!currentVerse) {
      dispatch(setCurrentVerse(1));
    }
  }, [currentVerse, dispatch]);

  // Send real-time updates to Bible presentation window when navigation changes
  useEffect(() => {
    // Check if presentation window exists and send updates
    if (currentBook && currentChapter && bibleData && currentTranslation) {
      const translationData = bibleData[currentTranslation];
      if (translationData && translationData.books) {
        const bookData = translationData.books.find(
          (book: any) => book.name === currentBook
        );

        if (bookData) {
          const chapterData = bookData.chapters?.find(
            (ch: any) => ch.chapter === currentChapter
          );

          if (chapterData?.verses) {
            const presentationData = {
              book: currentBook,
              chapter: currentChapter,
              verses: chapterData.verses,
              translation: currentTranslation,
              selectedVerse: currentVerse || undefined,
            };

            // Send update to presentation window if it exists
            if (typeof window !== "undefined" && window.api) {
              window.api.sendToBiblePresentation({
                type: "update-data",
                data: presentationData,
              });
            }
          }
        }
      }
    }
  }, [
    currentBook,
    currentChapter,
    currentVerse,
    currentTranslation,
    bibleData,
  ]);

  return (
    <div
      className={`h-screen flex flex-col overflow-y-scroll bg-white dark:bg-ltgray no-scrollbar text-gray-900 dark:text-gray-100`}
      id="biblediv"
      ref={contentRef}
      style={{
        backgroundImage:
          verseByVerseMode && imageBackgroundMode && selectedBackground
            ? `url(${selectedBackground})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Auto-scroll status indicator */}
      {autoScrollStatus && (
        <div className="fixed bottom-20 right-6 z-50">
          <div className="bg-green-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm animate-pulse">
            {autoScrollStatus}
          </div>
        </div>
      )}

      {/* Language Toggler - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageToggler />
      </div>

      {!verseByVerseMode ? (
        <>
          <div className="absolute top-12 left-0 right-0 z-40">
            <FloatingActionBar
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
              handleBookSelect={handleBookSelect}
              handleChapterSelect={handleChapterSelect}
              handleVerseSelect={handleVerseSelect}
              getChapters={getChapters}
              getVerses={getVerses}
              bookList={bookList}
              isDarkMode={isDarkMode}
              handlePreviousChapter={handlePreviousChapter}
              handleNextChapter={handleNextChapter}
              onOpenPresentation={handleOpenBiblePresentation}
              isAutoScrolling={isAutoScrolling}
              onToggleAutoScroll={toggleAutoScroll}
              autoScrollSpeed={autoScrollSpeed}
              onSpeedChange={setAutoScrollSpeed}
            />
          </div>

          <div className="flex-1 ">
            {viewMode === "block" ? (
              <ScriptureBlockView
                verses={verses}
                verseRefs={verseRefs}
                selectedVerse={selectedVerse}
                getFontSize={() => `${fontSize}rem`}
                fontSize={fontSize}
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
                imageBackgroundMode={imageBackgroundMode}
                isFullScreen={isFullScreen}
                onVerseClick={handleVerseClick} // Add onVerseClick handler
              />
            ) : (
              <ScriptureParagraphView
                verses={verses}
                verseRefs={verseRefs}
                selectedVerse={selectedVerse}
                getFontSize={() => `${fontSize}rem`}
                fontSize={fontSize}
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
                imageBackgroundMode={imageBackgroundMode}
                isFullScreen={isFullScreen}
                onVerseClick={handleVerseClick} // Add onVerseClick handler
              />
            )}
          </div>
        </>
      ) : (
        <VerseByVerseView
          onNavigate={handleVerseByVerseNavigation}
          currentBook={currentBook}
          currentChapter={currentChapter}
          currentVerse={currentVerse || 1}
          selectedVerse={selectedVerse}
          chapterCount={chapterCount}
          isBookDropdownOpen={isBookDropdownOpen}
          setIsBookDropdownOpen={setIsBookDropdownOpen}
          isChapterDropdownOpen={isChapterDropdownOpen}
          setIsChapterDropdownOpen={setIsChapterDropdownOpen}
          isVerseDropdownOpen={isVerseDropdownOpen}
          setIsVerseDropdownOpen={setIsVerseDropdownOpen}
          handleBookSelect={handleBookSelect}
          handleChapterSelect={handleChapterSelect}
          handleVerseSelect={handleVerseSelect}
          getChapters={getChapters}
          getVerses={getVerses}
          bookList={bookList}
          isDarkMode={isDarkMode}
          handlePreviousChapter={handlePreviousChapter}
          handleNextChapter={handleNextChapter}
          imageBackgroundMode={imageBackgroundMode}
          isFullScreen={isFullScreen}
          getFontSize={() => `${fontSize}rem`}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
        />
      )}

      {/* Presentation Overlay */}
      <PresentationOverlay
        isPresenting={isPresentingVerse}
        onClose={() => setIsPresentingVerse(false)}
        text={presentationText}
        backgroundSrc={presentationBg}
        currentVerse={presentationCurrentVerse}
        totalVerses={verses.length}
        onNext={() => handlePresentationNavigation("next")}
        onPrev={() => handlePresentationNavigation("prev")}
      />
    </div>
  );
};

export default ScriptureContent;
