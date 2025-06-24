import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Settings,
  Maximize,
  Home,
  Monitor,
  FolderEdit,
  Minimize,
  Info,
  LayoutGrid,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCurrentScreen, CurrentScreen } from "@/store/slices/appSlice";
import { useTheme } from "@/Provider/Theme";

interface SlideProps {
  content: React.ReactNode;
  currentSlide: number;
  slideIndex: number;
  backgroundImage: string;
}

const Slide: React.FC<SlideProps> = ({
  content,
  currentSlide,
  slideIndex,
  backgroundImage,
}) => {
  const { isDarkMode } = useTheme();
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      custom={currentSlide > slideIndex ? 1 : -1}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", ease: "easeInOut", duration: 0.8 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-5xl max-h-full overflow-scroll no-scrollbar text-center p-6 md:p-8 rounded-xl shadow-xl text-white">
          {content}
        </div>
      </div>
    </motion.div>
  );
};

export const PresentationSlideshow: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { currentPresentation, stopPresentation } = usePresenterOperations();
  const dispatch = useAppDispatch();
  const [presentationbgs, setPresentationbgs] = useState<string[]>([]);
  const changeScreen = (screen: CurrentScreen) => dispatch(setCurrentScreen(screen));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [slides, setSlides] = useState<React.ReactNode[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000); // 5 seconds
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [slidesPerPage, setSlidesPerPage] = useState(1);
  const [slideView, setSlideView] = useState<"grid" | "carousel">("carousel");
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load background image from localStorage
  useEffect(() => {
    const savedBg = localStorage.getItem("selectedBg");
    if (savedBg) {
      setBackgroundImage(savedBg);
    } else {
      // Set default background if none saved
      setBackgroundImage(presentationbgs[0] || "");
    }
  }, [presentationbgs]);

  //save selected background to localStorage
  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem("selectedBg", backgroundImage);
    }
  }, [backgroundImage]);

  // Add this effect to load custom images
  useEffect(() => {
    const loadCustomImages = async () => {
      const customImagesPath = localStorage.getItem("vmusicimages");
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
            "./wood11.jpg"
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
          "./wood11.jpg"
        ]);
      }
    };

    loadCustomImages();
  }, []);

  // Function to break text into slides if too long
  const createContentSlides = (text: string, title?: string) => {
    const wordLimit = 100; // Adjust based on your visual preference
    const words = text.split(" ");

    if (words.length <= wordLimit) {
      return [
        <div className="space-y-3 overflow-y-auto max-h-[80vh] no-scrollbar">
          {title && (
            <h2 className="text-2xl md:text-3xl font-semibold text-purple-300 mb-4">
              {title}
            </h2>
          )}
          <p
            className="text-2xl md:text-6xl font-bitter leading- "
            style={{
              lineHeight: 1.4,
            }}
          >
            {text}
          </p>
        </div>,
      ];
    }

    // Break into multiple slides
    const slides = [];
    for (let i = 0; i < words.length; i += wordLimit) {
      const slideText = words.slice(i, i + wordLimit).join(" ");
      slides.push(
        <div className=" overflow-y-auto max-h-[80vh] no-scrollbar">
          {title && i === 0 && (
            <h2 className="text-2xl md:text-3xl font-semibold text-purple-300 mb-4">
              {title}
            </h2>
          )}
          {i > 0 && (
            <h2 className="text-xl text-purple-300 mb-2">
              {title} (Continued {Math.floor(i / wordLimit) + 1})
            </h2>
          )}
          <p className="text-2xl md:text-6xl font-bitter leading-relaxed"
            style={{
              lineHeight: 1.4,
            }}
          >
            {slideText}
          </p>
        </div>
      );
    }

    return slides;
  };

  useEffect(() => {
    if (!currentPresentation) return;

    const buildSlides = () => {
      const newSlides: React.ReactNode[] = [];

      // Title slide
      newSlides.push(
        <div className="space-y-6">
          <h1
            className="text-4xl md:text-6xl  font-bold font-bitter text-white"
            style={{ lineHeight: 1.2 }}
          >
            {currentPresentation.title}
          </h1>
          {currentPresentation.type === "sermon" && (
            <h2 className="text-2xl md:text-3xl text-stone-300 mt-6">
              by {(currentPresentation as any).preacher}
            </h2>
          )}
        </div>
      );

      if (currentPresentation.type === "sermon") {
        // Scriptures slide
        if ((currentPresentation as any).scriptures?.length > 0) {
          newSlides.push(
            <div className="space-y-8 flex items-center justify-center flex-col">
              <h2 className="text-2xl md:text-3xl font-semibold text-purple-300 mb-2">
                Scripture References
              </h2>
              <div className="flex flex-wrap gap-4 justify-center items-center">
                {(currentPresentation as any).scriptures.map(
                  (scripture: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-white text-2xl font-bitter md:text-5xl font-bold p-4 rounded-lg shadow-lg backdrop-blur-sm "
                      style={{
                        border: "2px solid #4B5563",
                        borderRadius: "1rem",
                      }}
                    >
                      {scripture.text}
                    </div>
                  )
                )}
              </div>
            </div>
          );
        }

        // Main message slide(s) - break into multiple slides if needed
        if ((currentPresentation as any).mainMessage) {
          const messageSlides = createContentSlides(
            (currentPresentation as any).mainMessage,
            "Main Message"
          );
          messageSlides.forEach((slide) => newSlides.push(slide));
        }

        // Quote slide (if exists)
        if ((currentPresentation as any).quote) {
          newSlides.push(
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-purple-300 mb-6">
                Quote
              </h2>
              <p className="text-3xl md:text-4xl font-bitter text-white italic">
                "{(currentPresentation as any).quote}"
              </p>
              {(currentPresentation as any).quoteAuthor && (
                <p className="text-xl md:text-2xl text-gray-300 mt-6">
                  — {(currentPresentation as any).quoteAuthor}
                </p>
              )}
            </div>
          );
        }
      } else {
        // Content slide(s) for "other" type - also break into multiple slides if needed
        if ((currentPresentation as any).message) {
          const contentSlides = createContentSlides(
            (currentPresentation as any).message
          );
          contentSlides.forEach((slide) => newSlides.push(slide));
        }
      }

      return newSlides;
    };

    setSlides(buildSlides());
    setCurrentSlide(0);
  }, [currentPresentation]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else if (isAutoPlaying) {
      // Loop back to first slide if auto-playing
      setDirection(1);
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    } else if (isAutoPlaying) {
      // Loop to last slide if on first slide and auto-playing
      setDirection(-1);
      setCurrentSlide(slides.length - 1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    if (!isPresentationMode && !isAutoPlaying) {
      // Start autoplay when entering presentation mode if not already playing
      startAutoPlay();
    } else if (isPresentationMode && isAutoPlaying) {
      stopAutoPlay();
    }
  };

  // Improved autoplay implementation
  const startAutoPlay = () => {
    // Clear any existing interval
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    setIsAutoPlaying(true);

    // Set up the new interval
    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInterval = parseInt(e.target.value) * 1000;
    setAutoPlayInterval(newInterval);

    // If currently playing, restart with new interval
    if (isAutoPlaying) {
      stopAutoPlay();
      setTimeout(() => {
        startAutoPlay();
      }, 10);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      nextSlide();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "Escape") {
      if (isPresentationMode) {
        setIsPresentationMode(false);
        if (isAutoPlaying) stopAutoPlay();
      } else {
        stopPresentation();
      }
    } else if (e.key === "F" || e.key === "f") {
      toggleFullscreen();
    } else if (e.key === " " || e.code === "Space") {
      toggleAutoPlay();
      e.preventDefault(); // Prevent scroll
    }
  };

  const changeDirectory = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      localStorage.setItem("vmusicimages", path);
      const images = await window.api.getImages(path);
      setPresentationbgs(images);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [slides.length, currentSlide, isPresentationMode, isAutoPlaying]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!currentPresentation) return null;

  return (
    <div
      ref={containerRef}
      className="inset-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-black dark:text-white z-20 flex flex-col h-full"
    >
      {/* Top Controls - Only show when not in presentation mode */}
      {!isPresentationMode && (
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-1 flex justify-between items-center bg-white/95 dark:bg-gray-900/95 shadow-sm backdrop-blur-sm sticky top-0 z-30 h-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors flex items-center gap-1"
              title="Back to Home"
            >
              <Home size={18} />
              <span className="hidden sm:inline text-sm">Home</span>
            </button>
            <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-400 truncate max-w-xs md:max-w-md">
              {currentPresentation.title}
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${
                showInfo
                  ? "bg-violet-600 text-white"
                  : "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800"
              }`}
              title="Keyboard Shortcuts"
            >
              <Info size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? "bg-violet-600 text-white"
                  : "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800"
              }`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={togglePresentationMode}
              className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-1"
              title="Present"
            >
              <Monitor size={18} />
              <span className="hidden sm:inline">Present</span>
            </button>
            <button
              onClick={stopPresentation}
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {showInfo && !isPresentationMode && (
        <div className="absolute top-24 right-24 z-40 bg-white dark:bg-gray-900 p-5 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-72">
          <div className="flex justify-between items-center ">
            <h4 className="font-semibold text-violet-800 dark:text-violet-400 text-lg">
              Keyboard Shortcuts
            </h4>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y3 text-[12px]">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
              <span>Next Slide</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded shadow">
                →
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
              <span>Previous Slide</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded shadow">
                ←
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
              <span>Toggle Fullscreen</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded shadow">
                F
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
              <span>Toggle Autoplay</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded shadow">
                Space
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
              <span>Exit</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded shadow">
                Esc
              </kbd>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && !isPresentationMode && (
        <div className="absolute top-24 right-4 z-40 bg-white dark:bg-gray-900 px-5 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-80">
          <div className="flex justify-between items-center mb-">
            <h4 className="font-semibold text-violet-800 dark:text-violet-400 text-lg">
              Presentation Settings
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Autoplay Interval
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="15"
                value={autoPlayInterval / 1000}
                onChange={handleIntervalChange}
                className="flex-1 accent-violet-600"
              />
              <span className="text-sm bg-violet-100 dark:bg-violet-900/80 text-violet-800 dark:text-violet-200 px-3 py-1 rounded-md font-medium w-12 text-center">
                {autoPlayInterval / 1000}s
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 justify-between py-2 mb-2">
              <label className="block text-sm font-medium">
                Background Image
              </label>
              <button
                onClick={changeDirectory}
                className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 transition-colors flex items-center gap-1 text-sm"
                title="Change Background Directory"
              >
                <FolderEdit size={16} />
                <span>Change folder</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2">
              {presentationbgs.map((bg: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setBackgroundImage(bg)}
                  className={`h-12 w-full bg-cover bg-center rounded-lg overflow-hidden cursor-pointer transition-all ${
                    backgroundImage === bg
                      ? "ring-2 ring-violet-600 scale-105"
                      : "hover:ring-1 hover:ring-violet-400 hover:scale-105"
                  }`}
                  style={{ backgroundImage: `url(${bg})` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-scroll no-scrollbar h-[calc(100vh-7rem)] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950">
        <AnimatePresence initial={false} custom={direction}>
          <Slide
            key={currentSlide}
            content={slides[currentSlide]}
            currentSlide={currentSlide}
            slideIndex={currentSlide}
            backgroundImage={backgroundImage}
          />
        </AnimatePresence>

        {/* Slide Navigation Overlay */}
        {!isPresentationMode && (
          <div className="absolute inset-x-0 bottom-20 flex justify-center gap-1.5 p-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-violet-600 w-6"
                    : "bg-white/70 dark:bg-gray-600/70 w-2.5 hover:bg-white/90 dark:hover:bg-gray-400/90"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        className={`flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 ${
          isPresentationMode
            ? "absolute bottom-0 left-0 right-0 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md z-10 transition-all opacity-0 hover:opacity-100 lg:hover:opacity-90 duration-300"
            : ""
        }`}
      >
        <div className="flex gap-2 items-center">
          {isPresentationMode && (
            <button
              onClick={togglePresentationMode}
              className="p-2 bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
              title="Exit Presentation Mode"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={toggleAutoPlay}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              isAutoPlaying
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 hover:bg-violet-200 dark:hover:bg-violet-800"
            }`}
            title={isAutoPlaying ? "Stop Auto Play" : "Start Auto Play"}
          >
            {isAutoPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span className="hidden sm:inline text-sm font-medium">
              {isAutoPlaying ? "Stop" : "Auto Play"}
            </span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors flex items-center gap-1.5"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            <span className="hidden sm:inline text-sm font-medium">
              {isFullscreen ? "Exit" : "Fullscreen"}
            </span>
          </button>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0 && !isAutoPlaying}
            className={`p-2 rounded-lg transition-colors ${
              currentSlide === 0 && !isAutoPlaying
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
            title="Previous Slide"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="bg-gray-200 dark:bg-gray-800 px-4 py-1.5 rounded-full text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1 && !isAutoPlaying}
            className={`p-2 rounded-lg transition-colors ${
              currentSlide === slides.length - 1 && !isAutoPlaying
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
            title="Next Slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
