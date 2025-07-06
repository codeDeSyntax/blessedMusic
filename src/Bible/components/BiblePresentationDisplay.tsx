import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  setCurrentTranslation,
  setCurrentBook,
  setCurrentChapter,
  TRANSLATIONS,
} from "@/store/slices/bibleSlice";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

interface BiblePresentationDisplayProps {
  initialData?: {
    book: string;
    chapter: number;
    verses: Array<{ verse: number; text: string }>;
    translation: string;
    selectedVerse?: number;
  };
  initialSettings?: {
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    versesPerSlide: number;
  };
}

const BiblePresentationDisplay: React.FC<BiblePresentationDisplayProps> = ({
  initialData,
  initialSettings,
}) => {
  const dispatch = useAppDispatch();
  const { getCurrentChapterVerses, initializeBibleData } = useBibleOperations();

  // Debug logging to confirm component is loaded
  useEffect(() => {
    console.log("BiblePresentationDisplay component mounted");
    console.log("Window location:", window.location.href);
    console.log("Hash:", window.location.hash);
  }, []);

  // Connect to Redux store for font settings and Bible data
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const currentTranslation = useAppSelector(
    (state) => state.bible.currentTranslation
  );
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const bibleData = useAppSelector((state) => state.bible.bibleData);

  // Initialize Bible data if not already loaded
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Checking Bible data initialization:", {
        bibleDataKeys: Object.keys(bibleData || {}),
        currentTranslation,
      });
    }

    if (
      currentTranslation &&
      Object.keys(TRANSLATIONS).includes(currentTranslation)
    ) {
      if (!bibleData || Object.keys(bibleData).length === 0) {
        console.log("Initializing Bible data...");
        initializeBibleData();
      }
    }
  }, [bibleData, initializeBibleData, currentTranslation]);

  // Initialize Redux state from initial data if provided, or set defaults
  useEffect(() => {
    if (initialData && process.env.NODE_ENV === "development") {
      console.log("Initializing presentation display with:", initialData);
    }

    if (initialData) {
      // Always update Redux state with initial data
      if (initialData.book !== currentBook) {
        if (process.env.NODE_ENV === "development")
          console.log("Setting book:", initialData.book);
        dispatch(setCurrentBook(initialData.book));
      }
      if (initialData.chapter !== currentChapter) {
        if (process.env.NODE_ENV === "development")
          console.log("Setting chapter:", initialData.chapter);
        dispatch(setCurrentChapter(initialData.chapter));
      }
      if (initialData.translation !== currentTranslation) {
        if (process.env.NODE_ENV === "development")
          console.log("Setting translation:", initialData.translation);
        dispatch(setCurrentTranslation(initialData.translation));
      }
    } else if (!currentBook || !currentChapter || !currentTranslation) {
      // Set defaults if no initial data and Redux state is empty
      if (process.env.NODE_ENV === "development")
        console.log("Setting default values for presentation display");
      if (!currentBook) dispatch(setCurrentBook("Genesis"));
      if (!currentChapter) dispatch(setCurrentChapter(1));
      if (!currentTranslation) dispatch(setCurrentTranslation("KJV"));
    }
  }, [initialData, dispatch, currentBook, currentChapter, currentTranslation]);
  const [settings, setSettings] = useState(
    initialSettings || {
      fontSize: 6,
      textColor: "#ffffff",
      backgroundColor: "#1e293b",
      versesPerSlide: 1,
    }
  );
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [isTranslationSwitching, setIsTranslationSwitching] = useState(false);
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Available translations
  const availableTranslations = Object.keys(TRANSLATIONS);

  // Background gradient options
  const backgroundGradients = [
    "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900", // Current default
    "bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900",
    "bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900",
    "bg-gradient-to-br from-amber-900 via-orange-900 to-red-900",
  ];

  // Base font size calculation
  const baseFontSize = 32;

  // Helper functions for localStorage
  const getLocalStorageItem = (
    key: string,
    defaultValue: string | null = null
  ) => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, error);
      return defaultValue;
    }
  };

  const setLocalStorageItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
    }
  };

  // Load settings from localStorage - simplified to only handle background and local font multiplier
  useEffect(() => {
    const savedMultiplier = getLocalStorageItem("bibleFontMultiplier", "1.0");
    setFontSizeMultiplier(parseFloat(savedMultiplier!) || 1.0);

    const savedBg = getLocalStorageItem("biblepresentationbg");
    setBackgroundImage(savedBg || "");
  }, []);

  // Base font size for the presenter - independent of main Bible font size
  const getBaseFontSize = () => "2.5rem"; // Fixed base size for presenter

  // Get current verses to display - now from Redux via useBibleOperations with fallback to initialData
  const getCurrentVerses = useCallback(() => {
    let verses = getCurrentChapterVerses();

    // Fallback to initialData if Redux doesn't have verses yet
    if (!verses.length && initialData?.verses) {
      console.log("Using fallback verses from initialData");
      verses = initialData.verses;
    }

    if (!verses.length) return [];

    const startIndex = currentVerseIndex;
    const endIndex = Math.min(
      startIndex + settings.versesPerSlide,
      verses.length
    );

    return verses.slice(startIndex, endIndex);
  }, [
    getCurrentChapterVerses,
    currentVerseIndex,
    settings.versesPerSlide,
    initialData?.verses,
  ]);

  const currentVerses = getCurrentVerses();

  // Calculate dynamic text size based on text length (same as PresentationOverlay and VerseByVerseView)
  const getTextSizeClass = (text: string) => {
    const textLength = text.length;

    if (textLength > 400) return "text-2xl sm:text-3xl md:text-5xl lg:text-5xl";
    if (textLength > 200) return "text-3xl sm:text-4xl md:text-5xl lg:text-6xl";
    return "text-3xl sm:text-4xl md:text-6xl lg:text-7xl";
  };

  // Get font family class - match the in-app Bible presenter exactly
  const getFontFamilyClass = () => {
    const currentFontFamily = fontFamily;

    switch (currentFontFamily) {
      case "garamond":
      case "Garamond":
        return "font-garamond";
      case "'Georgia', serif":
      case "Georgia":
        return "font-serif";
      case "serif":
        return "font-serif";
      case "sans-serif":
        return "font-sans";
      case "Palatino":
        return "font-serif";
      case "'Impact', Charcoal, sans-serif":
      case "Impact":
        return "font-sans font-black";
      case "Comic Sans MS":
        return "font-sans";
      case "Trebuchet MS":
        return "font-sans";
      case "Arial Black":
      case "'Arial', sans-serif":
      case "Arial":
        return "font-sans font-black";
      case "cursive":
        return "font-serif";
      case "'Times New Roman', Times, serif":
      case "Times New Roman":
        return "font-serif";
      case "'Helvetica', sans-serif":
      case "Helvetica":
        return "font-sans";
      case "'Courier New', Courier, monospace":
      case "Courier New":
        return "font-mono";
      case "'Verdana', sans-serif":
      case "Verdana":
        return "font-sans";
      default:
        return "font-bitter"; // Default to bitter like PresentationOverlay
    }
  };

  // Calculate optimal font size based on content
  const calculateOptimalFontSize = useCallback(
    (verses: Array<{ verse: number; text: string }>) => {
      if (!contentRef.current || !verses.length) return baseFontSize;

      const container = contentRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      // Target 80% of screen height for content
      const targetHeight = containerHeight * 0.8;
      const targetWidth = containerWidth * 0.9;

      // Test different font sizes
      let testSize = baseFontSize * fontSizeMultiplier;
      const maxSize = Math.min(containerHeight * 0.15, 120);
      const minSize = 20;

      // Create temporary element for measurement
      const temp = document.createElement("div");
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.width = targetWidth + "px";
      temp.style.fontFamily = "Georgia, serif";
      temp.style.lineHeight = "1.4";
      temp.style.padding = "0";
      temp.style.margin = "0";
      document.body.appendChild(temp);

      // Test current verse content
      const testContent = verses.map((v) => v.text).join(" ");

      temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;

      let iterations = 0;
      while (iterations < 50) {
        const testHeight = temp.scrollHeight;

        if (testHeight <= targetHeight && testSize <= maxSize) {
          // Try larger
          testSize += 2;
          temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;
        } else if (testHeight > targetHeight && testSize > minSize) {
          // Go smaller
          testSize -= 2;
          temp.innerHTML = `<p style="margin: 0; padding: 0; font-size: ${testSize}px;">${testContent}</p>`;
        } else {
          break;
        }
        iterations++;
      }

      document.body.removeChild(temp);
      return Math.max(minSize, Math.min(maxSize, testSize));
    },
    [fontSizeMultiplier]
  );

  const optimalFontSize = calculateOptimalFontSize(currentVerses);

  // Font size adjustment functions
  const increaseFontSize = useCallback(() => {
    if (fontSizeMultiplier < 3.0) {
      const newMultiplier = fontSizeMultiplier + 0.1;
      setFontSizeMultiplier(newMultiplier);
      setLocalStorageItem("bibleFontMultiplier", newMultiplier.toString());
    }
  }, [fontSizeMultiplier]);

  const decreaseFontSize = useCallback(() => {
    if (fontSizeMultiplier > 0.3) {
      const newMultiplier = fontSizeMultiplier - 0.1;
      setFontSizeMultiplier(newMultiplier);
      setLocalStorageItem("bibleFontMultiplier", newMultiplier.toString());
    }
  }, [fontSizeMultiplier]);

  // Translation switching function - now uses Redux like the main app
  const switchTranslation = useCallback(async () => {
    if (isTranslationSwitching) return;

    setIsTranslationSwitching(true);

    try {
      const currentIndex = availableTranslations.indexOf(currentTranslation);
      const nextIndex = (currentIndex + 1) % availableTranslations.length;
      const nextTranslation = availableTranslations[nextIndex];

      console.log("Switching from", currentTranslation, "to", nextTranslation);

      // Dispatch Redux action to update translation
      dispatch(setCurrentTranslation(nextTranslation));
    } catch (error) {
      console.error("Error switching translation:", error);
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => {
        setIsTranslationSwitching(false);
      }, 300);
    }
  }, [
    currentTranslation,
    dispatch,
    availableTranslations,
    isTranslationSwitching,
  ]);

  // Gradient selection function
  const selectGradient = useCallback((gradientIndex: number) => {
    setSelectedGradient(gradientIndex);
  }, []);

  // Control panel toggle function
  const toggleControlPanel = useCallback(() => {
    setIsControlPanelVisible((prev) => !prev);
  }, []);

  // Real-time updates for font changes from Redux store
  useEffect(() => {
    // This effect will trigger whenever fontFamily, fontWeight, or fontSize changes in Redux
    // No need for additional polling since Redux updates are immediate
  }, [fontFamily, fontWeight, fontSize]);

  // Reset verse index when book or chapter changes (from live updates)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Book/Chapter changed, resetting verse index");
    }
    setCurrentVerseIndex(0);
  }, [currentBook, currentChapter]);

  // Real-time background image and font updates - sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "biblepresentationbg" && e.newValue) {
        setBackgroundImage(e.newValue);
      }
      if (e.key === "bibleFontMultiplier" && e.newValue) {
        setFontSizeMultiplier(parseFloat(e.newValue) || 1.0);
      }
    };

    // Check for changes every second to sync with localStorage
    const changeCheck = setInterval(() => {
      const currentBg = getLocalStorageItem("biblepresentationbg", "");
      if (currentBg !== backgroundImage) {
        setBackgroundImage(currentBg!);
      }

      const currentMultiplier = getLocalStorageItem(
        "bibleFontMultiplier",
        "1.0"
      );
      const newMultiplier = parseFloat(currentMultiplier!) || 1.0;
      if (newMultiplier !== fontSizeMultiplier) {
        setFontSizeMultiplier(newMultiplier);
      }
    }, 1000);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(changeCheck);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [backgroundImage, fontSizeMultiplier]);

  // Listen for IPC messages if in Electron context
  useEffect(() => {
    if (typeof window !== "undefined" && window.ipcRenderer) {
      const handleBiblePresentationUpdate = (event: any, data: any) => {
        switch (data.type) {
          case "update-data":
            // Handle live updates from main app
            if (process.env.NODE_ENV === "development") {
              console.log("Received live update from main app:", data.data);
            }

            // Check if this is just a verse change (same book/chapter)
            const isSameBookChapter =
              data.data.book === currentBook &&
              data.data.chapter === currentChapter &&
              data.data.translation === currentTranslation;

            // Update Redux state with the new data
            if (data.data.book !== currentBook) {
              dispatch(setCurrentBook(data.data.book));
            }
            if (data.data.chapter !== currentChapter) {
              dispatch(setCurrentChapter(data.data.chapter));
            }
            if (data.data.translation !== currentTranslation) {
              dispatch(setCurrentTranslation(data.data.translation));
            }

            // Always update the verse index if selectedVerse is provided
            if (data.data.selectedVerse !== undefined) {
              const verseIndex = Math.max(0, data.data.selectedVerse - 1); // Convert to 0-based index
              setCurrentVerseIndex(verseIndex);
            } else if (!isSameBookChapter) {
              // Reset to first verse only when book/chapter changes and no specific verse is provided
              setCurrentVerseIndex(0);
            }
            break;
          case "update-settings":
            setSettings((prev) => ({ ...prev, ...data.data }));
            break;
          case "navigate":
            if (data.data.direction === "next") {
              setCurrentVerseIndex((prev) =>
                Math.min(prev + 1, getCurrentChapterVerses().length - 1)
              );
            } else if (data.data.direction === "prev") {
              setCurrentVerseIndex((prev) => Math.max(prev - 1, 0));
            } else if (data.data.direction === "goto") {
              setCurrentVerseIndex(data.data.index || 0);
            }
            break;
        }
      };

      // Listen for updates from main process
      window.ipcRenderer.on(
        "bible-presentation-update",
        handleBiblePresentationUpdate
      );

      return () => {
        window.ipcRenderer.off(
          "bible-presentation-update",
          handleBiblePresentationUpdate
        );
      };
    }
  }, [
    getCurrentChapterVerses,
    dispatch,
    currentBook,
    currentChapter,
    currentTranslation,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+H for control panel toggle
      if (e.ctrlKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        toggleControlPanel();
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          setCurrentVerseIndex((prev) => {
            const verses = getCurrentChapterVerses();
            return Math.min(prev + 1, verses.length - 1);
          });
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentVerseIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          setCurrentVerseIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentVerseIndex(() => {
            const verses = getCurrentChapterVerses();
            return verses.length - 1;
          });
          break;
        case "=":
        case "+":
          e.preventDefault();
          increaseFontSize();
          break;
        case "-":
        case "_":
          e.preventDefault();
          decreaseFontSize();
          break;
        case "t":
        case "T":
          e.preventDefault();
          switchTranslation();
          break;
        case "Escape":
          e.preventDefault();
          // Focus the main window
          if (
            typeof window !== "undefined" &&
            window.api &&
            window.api.focusMainWindow
          ) {
            window.api.focusMainWindow().catch(console.error);
          }
          break;
        case "1":
        case "2":
        case "3":
        case "4":
          e.preventDefault();
          const gradientIndex = parseInt(e.key) - 1;
          if (
            gradientIndex >= 0 &&
            gradientIndex < backgroundGradients.length
          ) {
            selectGradient(gradientIndex);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    increaseFontSize,
    decreaseFontSize,
    switchTranslation,
    selectGradient,
    toggleControlPanel,
    backgroundGradients.length,
    getCurrentChapterVerses,
  ]);

  // Auto-adjust font size on content change
  useEffect(() => {
    const checkForOverflow = () => {
      if (!contentRef.current) return;

      const container = contentRef.current;
      const containerHeight = container.clientHeight;
      const contentElement = container.querySelector(
        ".verse-content"
      ) as HTMLElement;

      if (contentElement) {
        const contentHeight = contentElement.scrollHeight;
        const maxAllowedHeight = containerHeight * 0.95;

        // If content is overflowing, automatically reduce font size
        if (contentHeight > maxAllowedHeight) {
          const scaleFactor = maxAllowedHeight / contentHeight;
          const adjustedMultiplier = fontSizeMultiplier * scaleFactor * 0.98;

          if (adjustedMultiplier < fontSizeMultiplier * 0.99) {
            setFontSizeMultiplier(Math.max(0.3, adjustedMultiplier));
            setLocalStorageItem(
              "bibleFontMultiplier",
              adjustedMultiplier.toString()
            );
          }
        }
      }
    };

    const timeoutId = setTimeout(checkForOverflow, 100);
    return () => clearTimeout(timeoutId);
  }, [currentVerseIndex, getCurrentChapterVerses, fontSizeMultiplier]);

  // Check if we have any verses to display
  let verses = getCurrentChapterVerses();

  // Fallback to initialData if Redux doesn't have verses yet
  if (!verses.length && initialData?.verses) {
    verses = initialData.verses;
  }

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("BiblePresentationDisplay State:", {
        currentTranslation,
        currentBook,
        currentChapter,
        bibleDataKeys: Object.keys(bibleData || {}),
        versesFromRedux: getCurrentChapterVerses().length,
        versesFromInitialData: initialData?.verses?.length || 0,
        finalVersesLength: verses.length,
        currentVerseIndex,
      });
    }
  }, [
    currentTranslation,
    currentBook,
    currentChapter,
    bibleData,
    verses.length,
    initialData,
    getCurrentChapterVerses,
    currentVerseIndex,
  ]);
  if (!verses.length) {
    return (
      <div className="w-full h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className={`w-full h-full ${backgroundGradients[selectedGradient]}`}
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Welcome Content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl"
          >
            <div className="relative">
              <h1
                style={{
                  fontSize: `calc(${getBaseFontSize()} * 2.5 * ${fontSizeMultiplier})`,
                  textShadow:
                    "0 6px 30px rgba(0,0,0,0.9), 0 3px 12px rgba(0,0,0,0.7)",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: "1.4",
                  fontWeight: fontWeight || "bold",
                  fontFamily: fontFamily,
                }}
                className={`${getFontFamilyClass()} drop-shadow-2xl mb-6`}
              >
                The Word
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`text-white/80 font-light tracking-wide ${getFontFamilyClass()}`}
                style={{
                  fontSize: `calc(${getBaseFontSize()} * 0.8 * ${fontSizeMultiplier})`,
                  fontFamily: fontFamily,
                  fontWeight: "normal",
                }}
              >
                Waiting for Scripture...
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Enhanced Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-full h-full ${backgroundGradients[selectedGradient]}`}
        />
        {/* Multiple overlay effects for depth */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
      </div>

      {/* Main Content - improved centering and styling like verse-by-verse view */}
      <div
        ref={contentRef}
        className="relative z-10 w-[98%] h-full flex items-center justify-center p-6"
      >
        <div className="  mx-auto flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentVerseIndex}-${currentBook}-${currentChapter}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="verse-content text-center w-full flex flex-col items-center justify-center"
            >
              {/* Content Background Effect */}
              <div className="absolute inset-0 -m-12 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/10 backdrop-blur-sm" />

              {/* Verses Container - properly centered */}
              <div className="space-y-6 relative z-10 w-full flex flex-col items-center justify-center">
                {currentVerses.map((verse, index) => (
                  <motion.div
                    key={verse.verse}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: index * 0.2 + 0.3,
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="w-full flex flex-col items-center justify-center"
                  >
                    {/* Verse Text - styled exactly like verse-by-verse view */}
                    <div className="w-full max-w-5xl">
                      <p
                        className={`text-white tracking-wide drop-shadow-xl text-center leading-relaxed ${getFontFamilyClass()} ${getTextSizeClass(
                          verse.text
                        )}`}
                        style={{
                          textShadow: "0 4px 8px rgba(0,0,0,0.5)",
                          lineHeight: "1.4",
                          fontWeight: fontWeight || "bold",
                          fontFamily: fontFamily,
                          fontSize: `calc(${getBaseFontSize()} * ${fontSizeMultiplier})`,
                        }}
                      >
                        {verse.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Translation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-white/60 font-light uppercase tracking-[0.3em] relative mt-4"
                style={{
                  fontSize: `calc(${getBaseFontSize()} * 0.5 * ${fontSizeMultiplier})`,
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  fontFamily: fontFamily,
                  fontWeight: "normal",
                }}
              >
                {currentTranslation}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Compact Control Panel - Conditionally Visible */}
      <AnimatePresence>
        {isControlPanelVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="absolute bottom-4 right-4 z-30"
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-2 shadow-lg">
              <div className="flex items-center justify-center space-y-1 text-xs">
                {/* Keyboard shortcuts hint */}
                <div className="text-center">
                  <span className="text-white/50 text-[8px] font-mono">
                    T=Translation • 1-4=Colors • Ctrl+H=Hide • ESC=Focus Main
                  </span>
                </div>

                {/* Scripture Reference */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center">
                  <span className="text-white font-mono text-[10px]">
                    {currentBook} {currentChapter}:
                    {settings.versesPerSlide === 1
                      ? currentVerses[0]?.verse
                      : currentVerses.length > 0
                      ? `${currentVerses[0].verse}-${
                          currentVerses[currentVerses.length - 1].verse
                        }`
                      : "1"}
                  </span>
                </div>

                {/* Translation - Clickable */}
                <button
                  onClick={switchTranslation}
                  disabled={isTranslationSwitching}
                  className={`bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center transition-colors duration-200 ${
                    isTranslationSwitching
                      ? "bg-black/70 cursor-not-allowed"
                      : "hover:bg-black/70"
                  }`}
                  title="Click to switch translation (or press T)"
                >
                  <span className="text-white/80 font-mono text-[10px] uppercase tracking-wide">
                    {isTranslationSwitching ? "..." : currentTranslation}
                  </span>
                </button>

                {/* Current Position */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10 text-center">
                  <span className="text-white font-mono text-[10px]">
                    {currentVerseIndex + 1}/{verses.length}
                  </span>
                </div>

                {/* Color Palette for Background Gradients */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10">
                  <div className="flex items-center justify-center space-x-1">
                    {backgroundGradients.map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => selectGradient(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-110 ${
                          selectedGradient === index
                            ? "ring-1 ring-white/50"
                            : ""
                        }`}
                        style={{
                          background:
                            index === 0
                              ? "linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #312e81 100%)"
                              : index === 1
                              ? "linear-gradient(135deg, #581c87 0%, #be185d 50%, #be123c 100%)"
                              : index === 2
                              ? "linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #155e75 100%)"
                              : "linear-gradient(135deg, #78350f 0%, #ea580c 50%, #dc2626 100%)",
                        }}
                        title={`Background ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress Dots - Mini Version */}
                <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10">
                  <div className="flex items-center justify-center space-x-0.5">
                    {Array.from({
                      length: Math.min(
                        8,
                        Math.ceil(verses.length / settings.versesPerSlide)
                      ),
                    }).map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-full transition-all duration-300 ${
                          Math.floor(
                            currentVerseIndex / settings.versesPerSlide
                          ) === index
                            ? "w-1.5 h-1.5 bg-white/80"
                            : "w-1 h-1 bg-white/30"
                        }`}
                      />
                    ))}
                    {verses.length > 8 && (
                      <span className="text-white/50 text-[8px] ml-0.5">
                        ...
                      </span>
                    )}
                  </div>
                </div>

                {/* Font Size Control */}
                <div className="bg-black/50 rounded-md border border-white/10">
                  <div className="flex items-center">
                    <button
                      onClick={decreaseFontSize}
                      className="p-1 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-l-md transition-all duration-200 text-[10px]"
                      title="Decrease font size"
                    >
                      -
                    </button>
                    <div className="text-white text-[10px] font-mono px-1 py-1 min-w-[30px] text-center border-x border-white/10">
                      {Math.round(fontSizeMultiplier * 100)}%
                    </div>
                    <button
                      onClick={increaseFontSize}
                      className="p-1 text-green-300 hover:text-green-100 hover:bg-green-500/20 rounded-r-md transition-all duration-200 text-[10px]"
                      title="Increase font size"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel Hidden Indicator */}
      <AnimatePresence>
        {!isControlPanelVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 z-30"
          >
            <button
              onClick={toggleControlPanel}
              className="bg-black/20 backdrop-blur-sm rounded-full p-2 border border-white/10 shadow-lg hover:bg-black/40 transition-all duration-200 group"
              title="Show control panel (Ctrl+H)"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-1 h-1 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors duration-200"></div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Light Effects */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-3/4 left-3/4 w-64 h-64 bg-purple-500/6 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
    </div>
  );
};

export default BiblePresentationDisplay;
