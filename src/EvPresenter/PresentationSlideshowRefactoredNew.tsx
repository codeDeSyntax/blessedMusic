import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPicker } from "antd";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useAppDispatch, useAppSelector } from "../store";
import { setCurrentScreen, CurrentScreen } from "../store/slices/appSlice";

// Extracted components
import { useSlideBuilder } from "./components/SlideBuilderHook";
import SettingsPanel from "./components/SettingsPanel";
import EnhancedNavigationControls from "./components/EnhancedNavigationControls";
import GridView from "./components/GridView";
import CarouselView from "./components/CarouselView";
import InfoPanel from "./components/InfoPanel";
import { useAutoScrollManager } from "./components/AutoScrollManager";
import { useKeyboardHandler } from "./components/KeyboardHandler";

export const PresentationSlideshowRefactored: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const { currentPresentation, stopPresentation, savePresentation } =
    usePresenterOperations();
  const { initializeBibleData } = useBibleOperations();
  const bibleData = useAppSelector((state) => state.bible.bibleData);
  const dispatch = useAppDispatch();
  const [presentationbgs, setPresentationbgs] = useState<string[]>([]);
  const changeScreen = (screen: CurrentScreen) =>
    dispatch(setCurrentScreen(screen));

  // Slide management state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [slides, setSlides] = useState<React.ReactNode[]>([]);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000); // 5 seconds
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [slidesPerPage, setSlidesPerPage] = useState(1);
  const [slideView, setSlideView] = useState<"grid" | "carousel">("carousel");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [temporaryBackground, setTemporaryBackground] = useState<string | null>(
    null
  );
  const settingsRef = useRef<HTMLDivElement>(null);
  const previousPresentationRef = useRef<any>(null);

  // Auto-scroll refs and state
  const scriptureScrollRef = useRef<HTMLDivElement>(null);
  const messagePointsScrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const [isMessagePointsAutoScrollPaused, setIsMessagePointsAutoScrollPaused] =
    useState(false);

  // Font size states with persistence
  const [titleFontSize, setTitleFontSize] = useState(() => {
    const saved = localStorage.getItem("presentationTitleFontSize");
    return saved ? parseInt(saved) : 4; // Default to text-4xl (4rem)
  });

  const [scriptureFontSize, setScriptureFontSize] = useState(() => {
    const saved = localStorage.getItem("presentationScriptureFontSize");
    return saved ? parseInt(saved) : 6; // Default to text-6xl (6rem)
  });

  const [quoteFontSize, setQuoteFontSize] = useState(() => {
    const saved = localStorage.getItem("presentationQuoteFontSize");
    return saved ? parseInt(saved) : 5; // Default to text-5xl (5rem)
  });

  // Animation settings
  const [selectedAnimation, setSelectedAnimation] = useState(() => {
    const saved = localStorage.getItem("presentationAnimation");
    return saved || "bouncing-text"; // Default animation
  });

  // Color settings with persistence
  const [titleColor, setTitleColor] = useState(() => {
    const saved = localStorage.getItem("presentationTitleColor");
    return saved || "#ffffff"; // Default to white
  });

  const [scriptureColor, setScriptureColor] = useState(() => {
    const saved = localStorage.getItem("presentationScriptureColor");
    return saved || "#ffffff"; // Default to white
  });

  const [quoteColor, setQuoteColor] = useState(() => {
    const saved = localStorage.getItem("presentationQuoteColor");
    return saved || "#ffffff"; // Default to white
  });

  const [mainMessageColor, setMainMessageColor] = useState(() => {
    const saved = localStorage.getItem("presentationMainMessageColor");
    return saved || "#ffffff"; // Default to white
  });

  // Font size state for main message
  const [mainMessageFontSize, setMainMessageFontSize] = useState(() => {
    const saved = localStorage.getItem("presentationMainMessageFontSize");
    return saved ? parseInt(saved) : 4; // Default to medium size
  });

  // Font family states with persistence
  const [titleFontFamily, setTitleFontFamily] = useState(() => {
    return (
      localStorage.getItem("presentationTitleFontFamily") || "Georgia, serif"
    );
  });

  const [scriptureFontFamily, setScriptureFontFamily] = useState(() => {
    return (
      localStorage.getItem("presentationScriptureFontFamily") ||
      "Impact, Arial black"
    );
  });

  const [quoteFontFamily, setQuoteFontFamily] = useState(() => {
    return (
      localStorage.getItem("presentationQuoteFontFamily") ||
      "Bitter Thin, serif"
    );
  });

  const [mainMessageFontFamily, setMainMessageFontFamily] = useState(() => {
    return (
      localStorage.getItem("presentationMainMessageFontFamily") ||
      "Bitter Thin, serif"
    );
  });

  // Inline color picker states
  const [showTitleColorPicker, setShowTitleColorPicker] = useState(false);
  const [showScriptureColorPicker, setShowScriptureColorPicker] =
    useState(false);
  const [showQuoteColorPicker, setShowQuoteColorPicker] = useState(false);
  const [showMainMessageColorPicker, setShowMainMessageColorPicker] =
    useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({
    x: 0,
    y: 0,
  });

  // Load background image from presentation or localStorage
  useEffect(() => {
    if (currentPresentation?.backgroundImage) {
      setBackgroundImage(currentPresentation.backgroundImage);
    } else {
      const savedBg = localStorage.getItem("selectedBg");
      if (savedBg) {
        setBackgroundImage(savedBg);
      } else {
        setBackgroundImage(presentationbgs[0] || "");
      }
    }
  }, [currentPresentation, presentationbgs]);

  // Handle temporary background changes from settings
  useEffect(() => {
    if (temporaryBackground !== null) {
      setBackgroundImage(temporaryBackground);
    }
  }, [temporaryBackground]);

  // Save temporary background to localStorage and make it permanent
  useEffect(() => {
    if (temporaryBackground) {
      localStorage.setItem("selectedBg", temporaryBackground);
    }
  }, [temporaryBackground]);

  // Font size handlers with persistence
  const handleTitleFontSizeChange = (size: number) => {
    setTitleFontSize(size);
    localStorage.setItem("presentationTitleFontSize", size.toString());
  };

  const handleScriptureFontSizeChange = (size: number) => {
    setScriptureFontSize(size);
    localStorage.setItem("presentationScriptureFontSize", size.toString());
  };

  const handleQuoteFontSizeChange = (size: number) => {
    setQuoteFontSize(size);
    localStorage.setItem("presentationQuoteFontSize", size.toString());
  };

  const handleMainMessageFontSizeChange = (size: number) => {
    setMainMessageFontSize(size);
    localStorage.setItem("presentationMainMessageFontSize", size.toString());
  };

  // Font family handlers with persistence
  const handleTitleFontFamilyChange = (fontFamily: string) => {
    setTitleFontFamily(fontFamily);
    localStorage.setItem("presentationTitleFontFamily", fontFamily);
  };

  const handleScriptureFontFamilyChange = (fontFamily: string) => {
    setScriptureFontFamily(fontFamily);
    localStorage.setItem("presentationScriptureFontFamily", fontFamily);
  };

  const handleQuoteFontFamilyChange = (fontFamily: string) => {
    setQuoteFontFamily(fontFamily);
    localStorage.setItem("presentationQuoteFontFamily", fontFamily);
  };

  const handleMainMessageFontFamilyChange = (fontFamily: string) => {
    setMainMessageFontFamily(fontFamily);
    localStorage.setItem("presentationMainMessageFontFamily", fontFamily);
  };

  // Color handlers with persistence
  const handleTitleColorChange = (color: string) => {
    setTitleColor(color);
    localStorage.setItem("presentationTitleColor", color);
  };

  const handleScriptureColorChange = (color: string) => {
    setScriptureColor(color);
    localStorage.setItem("presentationScriptureColor", color);
  };

  const handleQuoteColorChange = (color: string) => {
    setQuoteColor(color);
    localStorage.setItem("presentationQuoteColor", color);
  };

  const handleMainMessageColorChange = (color: string) => {
    setMainMessageColor(color);
    localStorage.setItem("presentationMainMessageColor", color);
  };

  // Inline color picker handlers
  const handleTextClick = useCallback(
    (
      event: React.MouseEvent,
      type: "title" | "scripture" | "quote" | "mainMessage"
    ) => {
      if (!isPresentationMode) {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        setColorPickerPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });

        // Close all other pickers first
        setShowTitleColorPicker(false);
        setShowScriptureColorPicker(false);
        setShowQuoteColorPicker(false);
        setShowMainMessageColorPicker(false);

        // Open the specific picker
        if (type === "title") setShowTitleColorPicker(true);
        else if (type === "scripture") setShowScriptureColorPicker(true);
        else if (type === "quote") setShowQuoteColorPicker(true);
        else if (type === "mainMessage") setShowMainMessageColorPicker(true);
      }
    },
    [isPresentationMode]
  );

  const closeAllColorPickers = () => {
    setShowTitleColorPicker(false);
    setShowScriptureColorPicker(false);
    setShowQuoteColorPicker(false);
    setShowMainMessageColorPicker(false);
  };

  // Create a simple debounce function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }

  // Memoized handleIntervalChange to prevent unnecessary re-renders
  const handleIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInterval = parseInt(e.target.value) * 1000;
      setAutoPlayInterval(newInterval);
    },
    []
  );

  // Debounced background save to prevent excessive API calls
  const debouncedSaveBackground = useCallback(
    debounce(async (presentationId: string, newBackground: string) => {
      try {
        await savePresentation(presentationId, {
          backgroundImage: newBackground,
        });
      } catch (error) {
        console.error("Failed to save background change:", error);
      }
    }, 500),
    [savePresentation]
  );

  // Click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is inside settings panel
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setShowSettings(false);
        setShowInfo(false);
      }

      // Check if click is inside any color picker or its related elements
      const isColorPickerClick =
        target &&
        (target.closest(".color-picker-container") ||
          target.closest(".ant-color-picker") ||
          target.closest(".ant-color-picker-panel") ||
          target.closest(".ant-popover") ||
          target.closest('[class*="color-picker"]') ||
          target.classList.contains("ant-color-picker") ||
          target.classList.contains("ant-color-picker-panel") ||
          target.classList.contains("ant-popover") ||
          target.classList.contains("color-picker-container") ||
          // Check for any parent with color picker classes
          (target.parentElement &&
            target.parentElement.closest(".color-picker-container")) ||
          (target.parentElement &&
            target.parentElement.closest(".ant-color-picker")));

      // Only close color pickers if it's not a color picker related click
      if (!isColorPickerClick) {
        closeAllColorPickers();
      }
    };

    if (
      showSettings ||
      showInfo ||
      showTitleColorPicker ||
      showScriptureColorPicker ||
      showQuoteColorPicker ||
      showMainMessageColorPicker
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [
    showSettings,
    showInfo,
    showTitleColorPicker,
    showScriptureColorPicker,
    showQuoteColorPicker,
    showMainMessageColorPicker,
  ]);

  // Background change handler - now saves to presentation with debouncing
  const handleBackgroundChange = useCallback(
    async (newBackground: string) => {
      setTemporaryBackground(newBackground);

      // Save to presentation if we have a current presentation (debounced)
      if (currentPresentation?.id) {
        debouncedSaveBackground(currentPresentation.id, newBackground);
      }
    },
    [currentPresentation, debouncedSaveBackground]
  );

  // Optimized settings toggle handler
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Scripture lookup function
  const lookupScripture = useCallback(
    (reference: string): { reference: string; text: string } | null => {
      if (!bibleData || !bibleData.KJV) {
        return null;
      }

      try {
        // Parse reference like "John 3:16" or "Genesis 1:1-3"
        const match = reference.match(/^(\d?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) {
          return {
            reference,
            text: "Scripture reference format not recognized",
          };
        }

        const [, bookName, chapterNum, startVerse, endVerse] = match;
        const chapter = parseInt(chapterNum);
        const start = parseInt(startVerse);
        const end = endVerse ? parseInt(endVerse) : start;

        // Find the book in Bible data
        const book = bibleData.KJV.books.find(
          (b: any) =>
            b.name.toLowerCase() === bookName.toLowerCase() ||
            b.name.toLowerCase().includes(bookName.toLowerCase()) ||
            bookName.toLowerCase().includes(b.name.toLowerCase())
        );

        if (!book) {
          return { reference, text: `Book "${bookName}" not found` };
        }

        // Find the chapter
        const chapterData = book.chapters.find(
          (c: any) => c.chapter === chapter
        );
        if (!chapterData) {
          return {
            reference,
            text: `Chapter ${chapter} not found in ${book.name}`,
          };
        }

        // Get the verses
        const verses = [];
        for (let verseNum = start; verseNum <= end; verseNum++) {
          const verse = chapterData.verses.find(
            (v: any) => v.verse === verseNum
          );
          if (verse) {
            verses.push(verse.text);
          }
        }

        if (verses.length === 0) {
          return {
            reference,
            text: `Verse(s) ${start}${end > start ? `-${end}` : ""} not found`,
          };
        }

        return {
          reference: `${book.name} ${chapter}:${start}${
            end > start ? `-${end}` : ""
          }`,
          text: verses.join(" "),
        };
      } catch (error) {
        console.error("Error looking up scripture:", error);
        return { reference, text: "Error looking up scripture" };
      }
    },
    [bibleData]
  );

  // Initialize slide builder
  const { buildSlides, ColorPickerComponents } = useSlideBuilder({
    currentPresentation,
    backgroundImage,
    titleColor,
    scriptureColor,
    quoteColor,
    mainMessageColor,
    titleFontSize,
    scriptureFontSize,
    quoteFontSize,
    mainMessageFontSize,
    titleFontFamily,
    scriptureFontFamily,
    quoteFontFamily,
    mainMessageFontFamily,
    selectedAnimation,
    scriptureScrollRef,
    messagePointsScrollRef,
    handleTextClick,
    handleTitleFontSizeChange,
    handleScriptureFontSizeChange,
    handleQuoteFontSizeChange,
    handleMainMessageFontSizeChange,
    handleTitleFontFamilyChange,
    handleScriptureFontFamilyChange,
    handleQuoteFontFamilyChange,
    handleMainMessageFontFamilyChange,
    handleTitleColorChange,
    handleScriptureColorChange,
    handleQuoteColorChange,
    handleMainMessageColorChange,
    lookupScripture,
  });

  // Load presentation backgrounds
  useEffect(() => {
    const loadCustomImages = async () => {
      const customImagesPath = localStorage.getItem("evpresenterimagespath");
      if (customImagesPath) {
        try {
          const images = await window.api.getImages(customImagesPath);
          setPresentationbgs(images);
        } catch (error) {
          console.error("Failed to load custom images:", error);
          // Load default backgrounds if custom images fail
          setPresentationbgs([
            "./wood2.jpg",
            "./snow1.jpg",
            "./wood6.jpg",
            "./wood7.png",
            "./pic2.jpg",
            "./wood10.jpg",
            "./wood11.jpg",
          ]);
        }
      } else {
        // Load default backgrounds if no custom path
        setPresentationbgs([
          "./wood2.jpg",
          "./snow1.jpg",
          "./wood6.jpg",
          "./wood7.png",
          "./pic2.jpg",
          "./wood10.jpg",
          "./wood11.jpg",
        ]);
      }
    };

    loadCustomImages();
  }, []);

  // Initialize Bible data for scripture lookups
  useEffect(() => {
    if (!bibleData || Object.keys(bibleData).length === 0) {
      initializeBibleData();
    }
  }, [bibleData, initializeBibleData]);

  // Build slides when presentation changes
  useEffect(() => {
    if (currentPresentation && buildSlides) {
      const newSlides = buildSlides();
      setSlides(newSlides);
    }
  }, [
    currentPresentation,
    backgroundImage,
    titleColor,
    scriptureColor,
    quoteColor,
    mainMessageColor,
    titleFontSize,
    scriptureFontSize,
    quoteFontSize,
    mainMessageFontSize,
    selectedAnimation,
  ]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && slides.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev < slides.length - 1) {
            setDirection(1);
            return prev + 1;
          } else {
            setDirection(1);
            return 0; // Loop back to first slide
          }
        });
      }, autoPlayInterval);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, autoPlayInterval, slides.length]);

  // Initialize auto-scroll manager
  useAutoScrollManager({
    currentSlide,
    currentPresentation,
    scriptureScrollRef,
    messagePointsScrollRef,
    isAutoScrollPaused,
    isMessagePointsAutoScrollPaused,
  });

  // Initialize keyboard handler
  useKeyboardHandler({
    currentSlide,
    totalSlides: slides.length,
    setCurrentSlide,
    setDirection,
    setIsPresentationMode,
    setIsAutoPlaying,
    toggleFullscreen,
    isAutoPlaying,
    isPresentationMode,
  });

  // Reset slide when presentation changes
  useEffect(() => {
    if (
      currentPresentation &&
      previousPresentationRef.current &&
      currentPresentation.id !== previousPresentationRef.current.id
    ) {
      setCurrentSlide(0);
      setDirection(0);
    }
    previousPresentationRef.current = currentPresentation;
  }, [currentPresentation]);

  // Early return if no presentation
  if (!currentPresentation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No presentation selected</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden bg-[#30261d] ${
        isPresentationMode ? "cursor-none" : ""
      }`}
      onClick={closeAllColorPickers}
    >
      {/* Navigation Controls */}
      <EnhancedNavigationControls
        currentSlide={currentSlide}
        slides={slides}
        setCurrentSlide={setCurrentSlide}
        setDirection={setDirection}
        slideView={slideView}
        setSlideView={setSlideView}
        isAutoPlaying={isAutoPlaying}
        setIsAutoPlaying={setIsAutoPlaying}
        isPresentationMode={isPresentationMode}
        setIsPresentationMode={setIsPresentationMode}
        showSettings={showSettings}
        toggleSettings={toggleSettings}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onBack={onBack}
      />

      {/* Settings Panel */}
      <SettingsPanel
        showSettings={showSettings}
        settingsRef={settingsRef}
        autoPlayInterval={autoPlayInterval}
        handleIntervalChange={handleIntervalChange}
        selectedAnimation={selectedAnimation}
        setSelectedAnimation={setSelectedAnimation}
        presentationbgs={presentationbgs}
        backgroundImage={backgroundImage}
        handleBackgroundChange={handleBackgroundChange}
      />

      {/* Info Panel */}
      <InfoPanel
        showInfo={showInfo}
        currentPresentation={currentPresentation}
        currentSlide={currentSlide}
        totalSlides={slides.length}
      />

      {/* Color Pickers from SlideBuilderHook */}
      <ColorPickerComponents />

      {/* Main Slide Display */}
      <div className="absolute inset-0 bg-[#30261d]">
        {slideView === "grid" ? (
          <GridView
            slides={slides}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            setDirection={setDirection}
            slideView={slideView}
            slidesPerPage={slidesPerPage}
            backgroundImage={backgroundImage}
          />
        ) : (
          <CarouselView
            slides={slides}
            currentSlide={currentSlide}
            direction={direction}
            backgroundImage={backgroundImage}
            selectedAnimation={selectedAnimation}
            titleColor={titleColor}
            scriptureColor={scriptureColor}
            quoteColor={quoteColor}
          />
        )}
      </div>

      {/* Dynamic Styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #9a674a;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          background: #7a5236;
          transform: scale(1.1);
        }

        /* Enhanced scrollbar for scripture area */
        .scripture-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .scripture-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .scripture-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .scripture-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Smooth scroll behavior */
        .smooth-scroll {
          scroll-behavior: smooth;
        }

        /* Corner blinking decorations for message points slide */
        .corner-blink-tl, .corner-blink-tr, .corner-blink-bl, .corner-blink-br {
          position: absolute;
          width: 12px;
          height: 12px;
          background: linear-gradient(45deg, ${
            mainMessageColor || "#ffffff"
          }, transparent);
          opacity: 0.7;
          animation: cornerBlink 2s ease-in-out infinite;
        }

        .corner-blink-tl {
          border-top: 2px solid ${mainMessageColor || "#ffffff"};
          border-left: 2px solid ${mainMessageColor || "#ffffff"};
          top: 0;
          left: 0;
          animation-delay: 0s;
        }

        .corner-blink-tr {
          border-top: 2px solid ${mainMessageColor || "#ffffff"};
          border-right: 2px solid ${mainMessageColor || "#ffffff"};
          top: 0;
          right: 0;
          animation-delay: 0.5s;
        }

        .corner-blink-bl {
          border-bottom: 2px solid ${mainMessageColor || "#ffffff"};
          border-left: 2px solid ${mainMessageColor || "#ffffff"};
          bottom: 0;
          left: 0;
          animation-delay: 1s;
        }

        .corner-blink-br {
          border-bottom: 2px solid ${mainMessageColor || "#ffffff"};
          border-right: 2px solid ${mainMessageColor || "#ffffff"};
          bottom: 0;
          right: 0;
          animation-delay: 1.5s;
        }

        @keyframes cornerBlink {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(0.8);
            box-shadow: 0 0 5px ${mainMessageColor || "#ffffff"}33;
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.1);
            box-shadow: 0 0 15px ${mainMessageColor || "#ffffff"}66;
          }
        }

        .corner-blink-tl:hover, .corner-blink-tr:hover, 
        .corner-blink-bl:hover, .corner-blink-br:hover {
          animation-play-state: paused;
          opacity: 1;
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
};

export default PresentationSlideshowRefactored;
