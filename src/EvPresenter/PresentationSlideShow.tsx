import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPicker } from "antd";
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
  animation?: string;
  titleColor?: string;
  scriptureColor?: string;
  quoteColor?: string;
}

// Custom Animation Wrapper Component
const AnimatedContent: React.FC<{
  children: React.ReactNode;
  animation: string;
  isVisible: boolean;
}> = ({ children, animation, isVisible }) => {
  const getAnimationVariants = () => {
    switch (animation) {
      case "bouncing-text":
        return {
          hidden: {
            opacity: 0,
            y: -100,
            scale: 0.3,
            rotateX: 90,
          },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            transition: {
              type: "spring",
              damping: 10,
              stiffness: 100,
              duration: 1.2,
              delay: 0.2,
              when: "beforeChildren",
              staggerChildren: 0.1,
            },
          },
        };

      case "gliding-sweep":
        return {
          hidden: {
            opacity: 0,
            x: -200,
            scale: 0.8,
            filter: "blur(10px)",
          },
          visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              type: "tween",
              ease: [0.25, 0.46, 0.45, 0.94],
              duration: 1.5,
              delay: 0.3,
            },
          },
        };

      case "explosive-zoom":
        return {
          hidden: {
            opacity: 0,
            scale: 0.1,
            rotate: -180,
            filter: "brightness(0)",
          },
          visible: {
            opacity: 1,
            scale: [0.1, 1.2, 1],
            rotate: 0,
            filter: "brightness(1)",
            transition: {
              duration: 1.0,
              ease: "easeOut",
              times: [0, 0.7, 1],
              delay: 0.1,
            },
          },
        };

      case "wave-reveal":
        return {
          hidden: {
            opacity: 0,
            y: 50,
            scaleY: 0,
            skewX: 45,
          },
          visible: {
            opacity: 1,
            y: 0,
            scaleY: 1,
            skewX: 0,
            transition: {
              type: "spring",
              damping: 20,
              stiffness: 200,
              duration: 1.3,
              delay: 0.2,
            },
          },
        };

      case "spiral-entrance":
        return {
          hidden: {
            opacity: 0,
            scale: 0.2,
            rotate: -720,
            x: 100,
            y: -100,
          },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            x: 0,
            y: 0,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 80,
              duration: 1.8,
              delay: 0.1,
            },
          },
        };

      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
          },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const Slide: React.FC<SlideProps> = ({
  content,
  currentSlide,
  slideIndex,
  backgroundImage,
  animation = "bouncing-text",
  titleColor,
  scriptureColor,
  quoteColor,
}) => {
  const { isDarkMode } = useTheme();
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Trigger content animation when slide becomes active
  useEffect(() => {
    if (currentSlide === slideIndex) {
      // Small delay to ensure slide transition starts first
      const timer = setTimeout(() => {
        setIsContentVisible(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsContentVisible(false);
    }
  }, [currentSlide, slideIndex]);

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
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "luminosity",
      }}
    >
      <div className="w-full h-full flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-5xl max-h-full overflow-scroll no-scrollbar text-center p-6 md:p-8 font-archivo rounded-xl shadow-xl text-[#9a674a] dark:text-white relative">
          <AnimatedContent animation={animation} isVisible={isContentVisible}>
            {content}
          </AnimatedContent>

          {/* Add particle effects for certain animations */}
          {animation === "gliding-sweep" && isContentVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm"
            />
          )}

          {animation === "explosive-zoom" && isContentVisible && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 360],
                    x: [0, Math.cos((i * 60 * Math.PI) / 180) * 100],
                    y: [0, Math.sin((i * 60 * Math.PI) / 180) * 100],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5 + i * 0.1,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full"
                  style={{
                    background: `radial-gradient(circle at center, ${
                      titleColor || "#ffffff"
                    }, transparent)`,
                  }}
                />
              ))}
            </>
          )}
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
  const changeScreen = (screen: CurrentScreen) =>
    dispatch(setCurrentScreen(screen));
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
  const [temporaryBackground, setTemporaryBackground] = useState<string | null>(
    null
  );
  const settingsRef = useRef<HTMLDivElement>(null);

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

  // Custom powerful animations combining AOS and Framer Motion
  const powerAnimations = [
    {
      value: "bouncing-text",
      label: "🚀 Bouncing Text",
      description: "Bouncy text with spring physics",
    },
    {
      value: "gliding-sweep",
      label: "✨ Gliding Sweep",
      description: "Smooth gliding with particle effect",
    },
    {
      value: "explosive-zoom",
      label: "💥 Explosive Zoom",
      description: "Explosive zoom with shake effect",
    },
    {
      value: "wave-reveal",
      label: "🌊 Wave Reveal",
      description: "Wave-like text revelation",
    },
    {
      value: "spiral-entrance",
      label: "🌪️ Spiral Entrance",
      description: "Spiral rotation with scaling",
    },
  ];

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
      // Use presentation's background image as default
      setBackgroundImage(currentPresentation.backgroundImage);
    } else {
      // If no presentation background, try localStorage
      const savedBg = localStorage.getItem("selectedBg");
      if (savedBg) {
        setBackgroundImage(savedBg);
      } else {
        // Set default background if none saved
        setBackgroundImage(presentationbgs[0] || "");
      }
    }
  }, [currentPresentation, presentationbgs]);

  // Handle temporary background changes from settings
  useEffect(() => {
    if (temporaryBackground !== null) {
      setBackgroundImage(temporaryBackground);
    } else if (currentPresentation?.backgroundImage) {
      setBackgroundImage(currentPresentation.backgroundImage);
    }
  }, [temporaryBackground, currentPresentation]);

  // Save temporary background to localStorage
  useEffect(() => {
    if (temporaryBackground) {
      localStorage.setItem("selectedBg", temporaryBackground);
    }
  }, [temporaryBackground]);

  // Reset temporary background when presentation changes
  useEffect(() => {
    setTemporaryBackground(null);
  }, [currentPresentation]);

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
  const handleTextClick = (
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
  };

  const closeAllColorPickers = () => {
    setShowTitleColorPicker(false);
    setShowScriptureColorPicker(false);
    setShowQuoteColorPicker(false);
    setShowMainMessageColorPicker(false);
  };

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
      showQuoteColorPicker
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
  ]);

  // Background change handler
  const handleBackgroundChange = (newBackground: string) => {
    setTemporaryBackground(newBackground);
  };

  // Helper functions to get font size classes
  const getTitleFontClass = () => {
    const sizeMap: { [key: number]: string } = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
    };
    return sizeMap[titleFontSize] || "text-4xl";
  };

  const getScriptureFontClass = () => {
    const sizeMap: { [key: number]: string } = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
    };
    return sizeMap[scriptureFontSize] || "text-6xl";
  };

  const getQuoteFontClass = () => {
    const sizeMap: { [key: number]: string } = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
    };
    return sizeMap[quoteFontSize] || "text-5xl";
  };

  const getMainMessageFontClass = () => {
    const sizeMap: { [key: number]: string } = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
    };
    return sizeMap[mainMessageFontSize] || "text-4xl";
  };

  // Add this effect to load custom images
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

  // Function to break text into slides if too long
  const createContentSlides = (text: string, title?: string) => {
    const wordLimit = 100; // Adjust based on your visual preference
    const words = text.split(" ");

    if (words.length <= wordLimit) {
      return [
        <div className="space-y-3 overflow-y-auto max-h-[80vh] no-scrollbar">
          {title && (
            <h2
              className={`${getTitleFontClass()} font-semibold text-[#9a674a] dark:text-purple-300 mb-4`}
            >
              {title}
            </h2>
          )}
          <p
            className={`${getScriptureFontClass()} font-cooper leading-relaxed text-[#9a674a] dark:text-white`}
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
        <div className=" overflow-y-auto max-h-[80vh] no-scrollbar rounded-t-3xl">
          {title && i === 0 && (
            <h2
              className={`${getTitleFontClass()} font-semibold text-[#9a674a] dark:text-purple-300 mb-4`}
            >
              {title}
            </h2>
          )}
          {i > 0 && (
            <h2 className="text-xl text-[#9a674a] dark:text-purple-300 mb-2">
              {title} (Continued {Math.floor(i / wordLimit) + 1})
            </h2>
          )}
          <p
            className={`${getScriptureFontClass()} font-oswald leading-relaxed text-[#9a674a] dark:text-white`}
            style={{
              lineHeight: 1.4,
              // fontFamily: "garamond",
            }}
          >
            {slideText}
          </p>
        </div>
      );
    }
    return slides;
  };

  const createMainMessageSlides = (text: string, title?: string) => {
    const wordLimit = 100; // Adjust based on your visual preference
    const words = text.split(" ");

    if (words.length <= wordLimit) {
      return [
        <div className="space-y-3 overflow-y-auto max-h-[80vh] no-scrollbar">
          {title && (
            <h2
              className={`${getTitleFontClass()} font-semibold text-[#9a674a] dark:text-purple-300 mb-4`}
            >
              {title}
            </h2>
          )}
          <p
            className={`${getMainMessageFontClass()} font-cooper leading-relaxed cursor-pointer hover:opacity-80 transition-opacity`}
            style={{
              lineHeight: 1.4,
              color: mainMessageColor,
            }}
            onClick={(e) => handleTextClick(e, "mainMessage")}
            title="Click to change color and font size"
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
        <div className=" overflow-y-auto max-h-[80vh] no-scrollbar rounded-t-3xl">
          {title && i === 0 && (
            <h2
              className={`${getTitleFontClass()} font-semibold text-[#9a674a] dark:text-purple-300 mb-4`}
            >
              {title}
            </h2>
          )}
          {i > 0 && (
            <h2 className="text-xl text-[#9a674a] dark:text-purple-300 mb-2">
              {title} (Continued {Math.floor(i / wordLimit) + 1})
            </h2>
          )}
          <p
            className={`${getMainMessageFontClass()} font-oswald leading-relaxed cursor-pointer hover:opacity-80 transition-opacity`}
            style={{
              lineHeight: 1.4,
              color: mainMessageColor,
            }}
            onClick={(e) => handleTextClick(e, "mainMessage")}
            title="Click to change color and font size"
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
            className={`${getTitleFontClass()} font-impact font-bold cursor-pointer hover:opacity-80 transition-opacity`}
            style={{ lineHeight: 1.2, color: titleColor }}
            onClick={(e) => handleTextClick(e, "title")}
            title="Click to change color"
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
              {/* <h2 className="text-2xl md:text-3xl font-semibold text-purple-300 mb-2">
                Scripture References
              </h2> */}
              <div className="flex flex-wrap  gap-4 justify-center items-center overflow-y-scroll no-scrollbar">
                {(currentPresentation as any).scriptures.map(
                  (scripture: any, idx: number) => (
                    <div
                      key={idx}
                      className={`${getScriptureFontClass()} font-anton font-bold p-4 rounded-lg shadow-lg backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity`}
                      style={{
                        border: "2px solid #4B5563",
                        borderRadius: "1rem",
                        letterSpacing: 2,
                        color: scriptureColor,
                      }}
                      onClick={(e) => handleTextClick(e, "scripture")}
                      title="Click to change color"
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
          const messageSlides = createMainMessageSlides(
            (currentPresentation as any).mainMessage,
            "Main Message"
          );
          messageSlides.forEach((slide) => newSlides.push(slide));
        }

        // Main message points slide (if exists)
        if ((currentPresentation as any).mainMessagePoints?.length > 0) {
          newSlides.push(
            <div className="space-y-1 overflow-y-auto max-h-[80vh] no-scrollbar">
              {/* <h2 className="text-2xl md:text-3xl font-semibold text-white bg-clip-border text-clip mb-2">
                Key Points
              </h2> */}
              <div className="flex flex-col gap-1">
                {(currentPresentation as any).mainMessagePoints.map(
                  (point: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex items-center justify-center gap-3 py-1 max-h-24 "
                    >
                      <div
                        className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-[white] to-[white] message-bullet"
                        style={{ color: mainMessageColor }}
                      ></div>
                      <p
                        className={`${getMainMessageFontClass()} font-teko leading-relaxed cursor-pointer hover:opacity-80 transition-all duration-300 hover:translate-x-1`}
                        style={{ color: mainMessageColor }}
                        onClick={(e) => handleTextClick(e, "mainMessage")}
                        title="Click to change color and font size"
                      >
                        {point.text}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          );
        }

        // Quote slide (if exists)
        if ((currentPresentation as any).quote) {
          newSlides.push(
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-purple-300 mb-6">
                Quote
              </h2>
              <p
                className={`${getQuoteFontClass()} font-archivo italic cursor-pointer hover:opacity-80 transition-opacity`}
                style={{ color: quoteColor }}
                onClick={(e) => handleTextClick(e, "quote")}
                title="Click to change color"
              >
                "
                {(currentPresentation as any).quote
                  .split(",")
                  .map((part: string) => (
                    <p key={part.trim()}>{part.trim()}</p>
                  ))}
                "
              </p>
              {(currentPresentation as any).quoteAuthor && (
                <p className="text-xl md:text-2xl text-gray-300 mt-6">
                  — {(currentPresentation as any).quoteAuthor}
                </p>
              )}
            </div>
          );
        }
      } else if (currentPresentation.type === "custom") {
        // Custom slides - render each slide's elements
        const customSlides = (currentPresentation as any).slides || [];
        customSlides.forEach((slide: any) => {
          newSlides.push(
            <div className="w-full h-full relative">
              {slide.elements?.map((element: any) => (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height,
                    backgroundColor: element.style.backgroundColor,
                    borderRadius: element.style.borderRadius,
                    color: element.style.color,
                    fontSize: element.style.fontSize,
                    fontWeight: element.style.fontWeight,
                  }}
                >
                  {element.type === "text" ? (
                    <div className="w-full h-full p-2 overflow-hidden">
                      {element.content}
                    </div>
                  ) : element.type === "shape" ? (
                    <div className="w-full h-full" />
                  ) : null}
                </div>
              ))}
            </div>
          );
        });
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
  }, [
    currentPresentation,
    titleFontSize,
    scriptureFontSize,
    quoteFontSize,
    mainMessageFontSize,
    titleColor,
    scriptureColor,
    quoteColor,
    mainMessageColor,
  ]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else if (isAutoPlaying) {
      // Loop back to first slide if auto-playing
      setDirection(1);
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length, isAutoPlaying]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    } else if (isAutoPlaying) {
      // Loop to last slide if on first slide and auto-playing
      setDirection(-1);
      setCurrentSlide(slides.length - 1);
    }
  }, [currentSlide, isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

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
  };

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setIsAutoPlaying(false);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isAutoPlaying, stopAutoPlay]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInterval = parseInt(e.target.value) * 1000;
    setAutoPlayInterval(newInterval);
  };

  // Add effect to handle auto-play state
  useEffect(() => {
    if (isAutoPlaying && slides.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => {
          if (prevSlide >= slides.length - 1) {
            return 0; // Loop back to first slide
          }
          return prevSlide + 1;
        });
      }, autoPlayInterval);

      return () => {
        if (autoPlayTimerRef.current) {
          clearInterval(autoPlayTimerRef.current);
        }
      };
    }
  }, [isAutoPlaying, autoPlayInterval, slides.length]);

  // Separate effect for keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys in all modes to ensure consistent navigation
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
      }

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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    nextSlide,
    prevSlide,
    isPresentationMode,
    isAutoPlaying,
    stopAutoPlay,
    toggleFullscreen,
    toggleAutoPlay,
    stopPresentation,
  ]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, []);

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
      className={`relative h-full w-full bg-black text-[#9a674a] dark:text-white overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50" : "rounded-3xl"
      }`}
    >
      {/* Controls */}
      {!isPresentationMode && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 f4d0] to-transparent">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-white dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors"
            >
              <Home size={20} />
            </button>
            <button
              onClick={togglePresentationMode}
              className="p-2 rounded-full bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-white dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors"
            >
              <Monitor size={20} />
            </button>
            <button
              onClick={toggleAutoPlay}
              className={`p-2 rounded-full ${
                isAutoPlaying
                  ? "bg-[#9a674a] text-white"
                  : "bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-white"
              } dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors`}
            >
              {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${
                showSettings
                  ? "bg-[#9a674a] text-white"
                  : "bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-white"
              } dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors`}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-full ${
                showInfo
                  ? "bg-[#9a674a] text-white"
                  : "bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-white"
              } dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors`}
            >
              <Info size={20} />
            </button>
            <button
              onClick={() =>
                setSlideView(slideView === "grid" ? "carousel" : "grid")
              }
              className={`p-2 rounded-full ${
                slideView === "grid"
                  ? "bg-[#9a674a] text-white"
                  : "bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-white"
              } dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            ref={settingsRef}
            initial={{ opacity: 0, x: -300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -300, scale: 0.9 }}
            className="absolute top-16 left-4 z-20  max-w-5xl  bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-4"
          >
            <div className="space-y-">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#9a674a] to-[#7a5236] flex items-center justify-center shadow-lg">
                  <Settings size={12} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-[#9a674a] dark:text-white">
                  Presentation Settings
                </h3>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Auto-play & Animation Column */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300 border-b border-white/10 pb-2">
                    ⚡ Playback & Animation
                  </h4>

                  {/* Auto-play Interval */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#9a674a] dark:text-gray-300">
                        Auto-play Interval
                      </label>
                      <div className="px-2 py-1 rounded text-xs font-medium bg-[#9a674a]/10 text-[#9a674a] dark:bg-white/10 dark:text-white border border-[#9a674a]/20">
                        {autoPlayInterval / 1000}s
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={autoPlayInterval / 1000}
                      onChange={handleIntervalChange}
                      className="w-full h-1.5 bg-gray-200/30 dark:bg-gray-700/30 rounded-lg appearance-none cursor-pointer slider-thumb backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(90deg, #9a674a 0%, #7a5236 ${
                          ((autoPlayInterval / 1000 - 1) / (10 - 1)) * 100
                        }%, rgba(156, 163, 175, 0.3) ${
                          ((autoPlayInterval / 1000 - 1) / (10 - 1)) * 100
                        }%, rgba(156, 163, 175, 0.3) 100%)`,
                      }}
                    />
                  </div>

                  {/* Animation Settings */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#9a674a] dark:text-gray-300">
                      Power Animation
                    </label>
                    <div className="relative">
                      <select
                        value={selectedAnimation}
                        onChange={(e) => {
                          setSelectedAnimation(e.target.value);
                          localStorage.setItem(
                            "presentationAnimation",
                            e.target.value
                          );
                        }}
                        className="w-full px-3 py-2 text-xs bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg text-[#9a674a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#9a674a]/50 focus:border-[#9a674a] transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                      >
                        {powerAnimations.map((animation) => (
                          <option
                            key={animation.value}
                            value={animation.value}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {animation.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-3 h-3 text-[#9a674a] dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {powerAnimations.find(
                        (a) => a.value === selectedAnimation
                      )?.description || "Choose a powerful animation effect"}
                    </div>
                    <div className="text-xs text-blue-400 dark:text-blue-300 mt-2">
                      💡 Tip: Click on text elements to change colors & font
                      sizes!
                    </div>
                  </div>
                  {/* Background Images Column */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300 border-b border-white/10 pb-2">
                      🖼️ Backgrounds
                    </h4>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#9a674a] dark:text-gray-300">
                        Background Images
                      </label>
                      <div className="relative overflow-hidden">
                        <div
                          className="flex space-x-[-12px] overflow-x-auto scrollbar-hide pb-2"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          {presentationbgs.map((bg, index) => (
                            <div
                              key={index}
                              onClick={() => handleBackgroundChange(bg)}
                              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:z-10 hover:shadow-lg ${
                                backgroundImage === bg
                                  ? "border-[#9a674a] shadow-lg ring-1 ring-[#9a674a]/50 z-20 scale-105"
                                  : "border-white/20 hover:border-[#9a674a]/60"
                              }`}
                              style={{
                                marginLeft: index === 0 ? "0" : "-8px",
                                zIndex:
                                  backgroundImage === bg ? 20 : 10 - index,
                              }}
                            >
                              <img
                                src={bg}
                                alt={`BG ${index + 1}`}
                                className="w-full h-full object-cover rounded-full"
                              />
                              <div
                                className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
                                  backgroundImage === bg
                                    ? "opacity-100"
                                    : "opacity-0 hover:opacity-60"
                                }`}
                              />
                              {backgroundImage === bg && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-[#9a674a] shadow-lg border border-white animate-pulse" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Scroll hint indicator */}
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            ref={settingsRef}
            initial={{ opacity: 0, x: -300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -300, scale: 0.9 }}
            className="absolute top-20 left-4 z-20 w-80 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-6"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9a674a] to-[#7a5236] flex items-center justify-center shadow-lg">
                  <Info size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#9a674a] dark:text-white">
                  Keyboard Shortcuts
                </h3>
              </div>

              {/* Shortcuts */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 dark:bg-black/20 border border-white/10">
                  <span className="text-[#9a674a] dark:text-gray-300 font-medium">
                    Next Slide
                  </span>
                  <kbd className="px-3 py-1.5 text-sm bg-gradient-to-br from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30 rounded-lg text-[#9a674a] dark:text-white font-mono shadow-sm">
                    →
                  </kbd>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 dark:bg-black/20 border border-white/10">
                  <span className="text-[#9a674a] dark:text-gray-300 font-medium">
                    Previous Slide
                  </span>
                  <kbd className="px-3 py-1.5 text-sm bg-gradient-to-br from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30 rounded-lg text-[#9a674a] dark:text-white font-mono shadow-sm">
                    ←
                  </kbd>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 dark:bg-black/20 border border-white/10">
                  <span className="text-[#9a674a] dark:text-gray-300 font-medium">
                    Toggle Fullscreen
                  </span>
                  <kbd className="px-3 py-1.5 text-sm bg-gradient-to-br from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30 rounded-lg text-[#9a674a] dark:text-white font-mono shadow-sm">
                    F
                  </kbd>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 dark:bg-black/20 border border-white/10">
                  <span className="text-[#9a674a] dark:text-gray-300 font-medium">
                    Toggle Presentation
                  </span>
                  <kbd className="px-3 py-1.5 text-sm bg-gradient-to-br from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30 rounded-lg text-[#9a674a] dark:text-white font-mono shadow-sm">
                    P
                  </kbd>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 dark:bg-black/20 border border-white/10">
                  <span className="text-[#9a674a] dark:text-gray-300 font-medium">
                    Toggle Auto-play
                  </span>
                  <kbd className="px-3 py-1.5 text-sm bg-gradient-to-br from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30 rounded-lg text-[#9a674a] dark:text-white font-mono shadow-sm">
                    Space
                  </kbd>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid View */}
      {slideView === "grid" ? (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-16 ${
            !isFullscreen && "rounded-3xl"
          }`}
        >
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setSlideView("carousel");
              }}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                currentSlide === index
                  ? "border-[#9a674a] dark:border-purple-500 scale-105"
                  : "border-transparent hover:border-[#9a674a]/50 dark:hover:border-purple-500/50"
              }`}
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="w-full text-center  text-white transform scale-50">
                  {slide}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Carousel View */}
          <div
            className={`relative w-full h-full ${
              !isFullscreen && "rounded-3xl overflow-hidden"
            }`}
          >
            <AnimatePresence initial={false} custom={direction}>
              <Slide
                key={currentSlide}
                content={slides[currentSlide]}
                currentSlide={currentSlide}
                slideIndex={currentSlide}
                backgroundImage={backgroundImage}
                animation={selectedAnimation}
                titleColor={titleColor}
                scriptureColor={scriptureColor}
                quoteColor={quoteColor}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {!isPresentationMode && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] dark:bg-black/30 dark:hover:bg-black/50 dark:text-white transition-colors"
                  disabled={currentSlide === slides.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Slide Counter */}
            {!isPresentationMode && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-[#9a674a]/10 dark:bg-black/30 text-[#9a674a] dark:text-white text-sm">
                {currentSlide + 1} / {slides.length}
              </div>
            )}
          </div>
        </>
      )}

      {/* Inline Color Pickers */}
      <AnimatePresence>
        {showTitleColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
            style={{
              left: colorPickerPosition.x - 120,
              top: colorPickerPosition.y - 80,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                Title Style
              </h4>
            </div>

            {/* Font Size Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Font Size
                </label>
                <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {getTitleFontClass().replace("text-", "")}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={titleFontSize}
                onChange={(e) =>
                  handleTitleFontSizeChange(parseInt(e.target.value))
                }
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Color Picker */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
                Color
              </label>
              <ColorPicker
                value={titleColor}
                onChange={(color) => {
                  handleTitleColorChange(color.toHexString());
                }}
                size="large"
                showText
                format="hex"
                placement="bottom"
                presets={[
                  {
                    label: "Common",
                    colors: [
                      "#ffffff",
                      "#000000",
                      "#ff4d4f",
                      "#52c41a",
                      "#1890ff",
                      "#faad14",
                      "#722ed1",
                      "#eb2f96",
                    ],
                  },
                ]}
                onOpenChange={(open) => {
                  // Prevent auto-closing
                  if (!open && showTitleColorPicker) {
                    // Force it to stay open
                    setTimeout(() => {
                      const colorPicker =
                        document.querySelector(".ant-color-picker");
                      if (colorPicker) {
                        (colorPicker as HTMLElement).click();
                      }
                    }, 0);
                  }
                }}
              />
            </div>

            <button
              onClick={closeAllColorPickers}
              className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}

        {showScriptureColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
            style={{
              left: colorPickerPosition.x - 120,
              top: colorPickerPosition.y - 80,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                Scripture Style
              </h4>
            </div>

            {/* Font Size Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Font Size
                </label>
                <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {getScriptureFontClass().replace("text-", "")}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={scriptureFontSize}
                onChange={(e) =>
                  handleScriptureFontSizeChange(parseInt(e.target.value))
                }
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Color Picker */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
                Color
              </label>
              <ColorPicker
                value={scriptureColor}
                onChange={(color) => {
                  handleScriptureColorChange(color.toHexString());
                }}
                size="large"
                showText
                format="hex"
                placement="bottom"
                presets={[
                  {
                    label: "Common",
                    colors: [
                      "#ffffff",
                      "#000000",
                      "#ff4d4f",
                      "#52c41a",
                      "#1890ff",
                      "#faad14",
                      "#722ed1",
                      "#eb2f96",
                    ],
                  },
                ]}
                onOpenChange={(open) => {
                  // Prevent auto-closing
                  if (!open && showScriptureColorPicker) {
                    // Force it to stay open
                    setTimeout(() => {
                      const colorPicker =
                        document.querySelector(".ant-color-picker");
                      if (colorPicker) {
                        (colorPicker as HTMLElement).click();
                      }
                    }, 0);
                  }
                }}
              />
            </div>

            <button
              onClick={closeAllColorPickers}
              className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}

        {showQuoteColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
            style={{
              left: colorPickerPosition.x - 120,
              top: colorPickerPosition.y - 80,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                Quote Style
              </h4>
            </div>

            {/* Font Size Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Font Size
                </label>
                <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {getQuoteFontClass().replace("text-", "")}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={quoteFontSize}
                onChange={(e) =>
                  handleQuoteFontSizeChange(parseInt(e.target.value))
                }
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Color Picker */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
                Color
              </label>
              <ColorPicker
                value={quoteColor}
                onChange={(color) => {
                  handleQuoteColorChange(color.toHexString());
                }}
                size="large"
                showText
                format="hex"
                placement="bottom"
                presets={[
                  {
                    label: "Common",
                    colors: [
                      "#ffffff",
                      "#000000",
                      "#ff4d4f",
                      "#52c41a",
                      "#1890ff",
                      "#faad14",
                      "#722ed1",
                      "#eb2f96",
                    ],
                  },
                ]}
                onOpenChange={(open) => {
                  // Prevent auto-closing
                  if (!open && showQuoteColorPicker) {
                    // Force it to stay open
                    setTimeout(() => {
                      const colorPicker =
                        document.querySelector(".ant-color-picker");
                      if (colorPicker) {
                        (colorPicker as HTMLElement).click();
                      }
                    }, 0);
                  }
                }}
              />
            </div>

            <button
              onClick={closeAllColorPickers}
              className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}

        {showMainMessageColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
            style={{
              left: colorPickerPosition.x - 120,
              top: colorPickerPosition.y - 80,
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                Main Message Style
              </h4>
            </div>

            {/* Font Size Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Font Size
                </label>
                <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {getMainMessageFontClass().replace("text-", "")}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={mainMessageFontSize}
                onChange={(e) =>
                  handleMainMessageFontSizeChange(parseInt(e.target.value))
                }
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Color Picker */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
                Color
              </label>
              <ColorPicker
                value={mainMessageColor}
                onChange={(color) => {
                  handleMainMessageColorChange(color.toHexString());
                }}
                size="large"
                showText
                format="hex"
                placement="bottom"
                presets={[
                  {
                    label: "Common",
                    colors: [
                      "#ffffff",
                      "#000000",
                      "#ff4d4f",
                      "#52c41a",
                      "#1890ff",
                      "#faad14",
                      "#722ed1",
                      "#eb2f96",
                    ],
                  },
                ]}
                onOpenChange={(open) => {
                  // Prevent auto-closing
                  if (!open && showMainMessageColorPicker) {
                    // Force it to stay open
                    setTimeout(() => {
                      const colorPicker =
                        document.querySelector(".ant-color-picker");
                      if (colorPicker) {
                        (colorPicker as HTMLElement).click();
                      }
                    }, 0);
                  }
                }}
              />
            </div>

            <button
              onClick={closeAllColorPickers}
              className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9a674a 0%, #7a5236 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(154, 103, 74, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(154, 103, 74, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9a674a 0%, #7a5236 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(154, 103, 74, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(154, 103, 74, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        /* Background gallery scrollbar hiding */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Stylish blinking bullet animation */
        @keyframes stylishBlink {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(154, 103, 74, 0.8);
          }
          50% { 
            opacity: 0.4; 
            transform: scale(1.2);
            box-shadow: 0 0 0 10px rgba(154, 103, 74, 0);
          }
        }

        @keyframes bulletGlow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(154, 103, 74, 0.6), 0 0 10px rgba(154, 103, 74, 0.4);
          }
          50% { 
            box-shadow: 0 0 10px rgba(154, 103, 74, 0.8), 0 0 20px rgba(154, 103, 74, 0.6);
          }
        }

        .message-bullet {
          animation: stylishBlink 3s ease-in-out infinite, bulletGlow 2s ease-in-out infinite alternate;
          position: relative;
        }

        .message-bullet::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: innerGlow 2.5s ease-in-out infinite;
        }

        @keyframes innerGlow {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }

        .message-bullet:hover {
          animation-play-state: paused;
          transform: scale(1.3);
          box-shadow: 0 0 15px rgba(154, 103, 74, 0.8), 0 0 25px rgba(154, 103, 74, 0.6);
        }

        .message-bullet:hover::before {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
