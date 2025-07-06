import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SongSection {
  type: string;
  content: string[];
  number?: number;
  isRepeating?: boolean;
}

interface SongData {
  title: string;
  content: string;
}

interface SongPresentationDisplayProps {
  initialSong?: SongData;
}

const SongPresentationDisplay: React.FC<SongPresentationDisplayProps> = ({
  initialSong,
}) => {
  // Debug logging to confirm component is loaded
  useEffect(() => {
    console.log("SongPresentationDisplay component mounted");
    console.log("Window location:", window.location.href);
    console.log("Hash:", window.location.hash);
  }, []);

  // State management
  const [songSections, setSongSections] = useState<SongSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [songTitle, setSongTitle] = useState("");
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [fontFamily, setFontFamily] = useState("Georgia, serif");
  const [isExternalDisplay, setIsExternalDisplay] = useState(false);

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const baseFontSize = 30;

  // Helper functions
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

  // Load settings from localStorage
  useEffect(() => {
    const savedMultiplier = getLocalStorageItem("bmusicFontMultiplier", "1.0");
    setFontSizeMultiplier(parseFloat(savedMultiplier!) || 1.0);

    const savedFont = getLocalStorageItem("bmusicfontFamily", "Georgia, serif");
    setFontFamily(savedFont!);

    const savedBg = getLocalStorageItem("bmusicpresentationbg");
    setBackgroundImage(savedBg || "./wood7.png");
  }, []);

  // Parse song content into sections
  const parseSongContent = useCallback((content: string): SongSection[] => {
    if (!content) {
      return [{ type: "Error", content: ["No song content available"] }];
    }

    const sections: SongSection[] = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const paragraphs = Array.from(doc.getElementsByTagName("p"));

      let currentType: string | null = null;
      let currentNumber: number | null = null;
      let currentContent: string[] = [];

      if (paragraphs.length === 0) {
        return [{ type: "Song", content: ["No lyrics found"] }];
      }

      paragraphs.forEach((p, index) => {
        const text = p.textContent?.trim() || "";
        const verseMatch = text.match(/^Verse (\d+)$/);
        const isChorus = text === "Chorus";

        if (verseMatch) {
          if (currentType && currentContent.length > 0) {
            sections.push({
              type: currentType,
              content: [...currentContent],
              number: currentNumber || undefined,
            });
          }
          currentType = "Verse";
          currentNumber = parseInt(verseMatch[1]);
          currentContent = [];
        } else if (isChorus) {
          if (currentType && currentContent.length > 0) {
            sections.push({
              type: currentType,
              content: [...currentContent],
              number: currentNumber || undefined,
            });
          }
          currentType = "Chorus";
          currentNumber = null;
          currentContent = [];
        } else if (text && !verseMatch && !isChorus) {
          currentContent.push(text);
        }

        if (index === paragraphs.length - 1 && currentContent.length > 0) {
          sections.push({
            type: currentType!,
            content: [...currentContent],
            number: currentNumber || undefined,
          });
        }
      });

      return sections.length > 0
        ? sections
        : [{ type: "Song", content: ["No structured lyrics found"] }];
    } catch (error) {
      console.error("Error parsing song content:", error);
      return [{ type: "Error", content: ["Error parsing song content"] }];
    }
  }, []);

  // Create display sequence with chorus repetitions
  const createDisplaySequence = useCallback(
    (sections: SongSection[]): SongSection[] => {
      const sequence: SongSection[] = [];
      const firstChorus = sections.find((section) => section.type === "Chorus");

      if (!firstChorus) {
        return [...sections];
      }

      sections.forEach((section, index) => {
        sequence.push(section);

        if (section.type === "Verse" && firstChorus) {
          const nextSectionIsChorus =
            index + 1 < sections.length &&
            sections[index + 1].type === "Chorus";

          if (!nextSectionIsChorus) {
            const chorusRepeat = {
              ...firstChorus,
              isRepeating: true,
            };
            sequence.push(chorusRepeat);
          }
        }
      });

      return sequence;
    },
    []
  );

  // Enhanced automatic font sizing algorithm (EasyWorship-style) - Robust 100vh enforcement
  const calculateOptimalFontSize = useCallback(
    (container: HTMLElement, lines: string[]): number => {
      if (!lines || lines.length === 0) return baseFontSize;

      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      // Use 95% of available height to ensure content never overflows 100vh
      const maxAllowedHeight = containerHeight * 0.95;
      const lineSpacing = 0.3; // Space between lines as fraction of font size

      // Create temporary element for precise measurements
      const temp = document.createElement("div");
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.fontFamily = fontFamily;
      temp.style.fontWeight = "bold";
      temp.style.lineHeight = "1.2";
      temp.style.textAlign = "center";
      temp.style.width = containerWidth * 0.95 + "px";
      temp.style.padding = "20px"; // Account for container padding
      temp.style.margin = "0";
      temp.style.boxSizing = "border-box";
      document.body.appendChild(temp);

      // Calculate base font size that would fit content in target area (80% of screen)
      const targetHeight = containerHeight * 0.8;
      let startingSize;
      if (lines.length <= 2) {
        startingSize = Math.min(120, targetHeight / (lines.length * 1.5));
      } else if (lines.length <= 4) {
        startingSize = Math.min(80, targetHeight / (lines.length * 1.3));
      } else {
        startingSize = Math.min(60, targetHeight / (lines.length * 1.2));
      }

      let maxFontSize = startingSize;
      let minFontSize = 20; // Minimum readable size
      let optimalSize = startingSize;
      let iterations = 0;
      const maxIterations = 25;

      // Binary search for optimal font size that fits in target area
      while (maxFontSize - minFontSize > 0.5 && iterations < maxIterations) {
        const testSize = (maxFontSize + minFontSize) / 2;
        temp.style.fontSize = testSize + "px";
        temp.innerHTML = "";

        // Add all lines with proper spacing
        lines.forEach((line, index) => {
          const p = document.createElement("p");
          p.textContent = line.trim() || " "; // Ensure empty lines have height
          p.style.margin = "0";
          p.style.fontWeight = "bold";
          p.style.lineHeight = "1.2";

          // Add spacing between lines
          if (index < lines.length - 1) {
            p.style.marginBottom = Math.floor(testSize * lineSpacing) + "px";
          }
          temp.appendChild(p);
        });

        const actualHeight = temp.scrollHeight;

        // Check if content fits within target height
        if (actualHeight <= targetHeight) {
          minFontSize = testSize;
          optimalSize = testSize;
        } else {
          maxFontSize = testSize;
        }

        iterations++;
      }

      // Apply user font size multiplier
      let finalSize = optimalSize * fontSizeMultiplier;

      // CRITICAL: Ensure final size with multiplier never exceeds screen bounds
      // Test the actual final size to guarantee no overflow
      temp.style.fontSize = finalSize + "px";
      temp.innerHTML = "";

      lines.forEach((line, index) => {
        const p = document.createElement("p");
        p.textContent = line.trim() || " ";
        p.style.margin = "0";
        p.style.fontWeight = "bold";
        p.style.lineHeight = "1.2";

        if (index < lines.length - 1) {
          p.style.marginBottom = Math.floor(finalSize * lineSpacing) + "px";
        }
        temp.appendChild(p);
      });

      const finalHeight = temp.scrollHeight;

      // If content would overflow with user multiplier, scale it down
      if (finalHeight > maxAllowedHeight) {
        const scaleFactor = maxAllowedHeight / finalHeight;
        finalSize = finalSize * scaleFactor * 0.98; // 98% for safety margin
      }

      // Absolute minimum and maximum bounds
      finalSize = Math.max(18, Math.min(finalSize, 300));

      document.body.removeChild(temp);

      return Math.floor(finalSize);
    },
    [fontFamily, fontSizeMultiplier]
  );

  // Handle song data
  const handleSongData = useCallback(
    (songData: SongData) => {
      if (!songData || !songData.content) {
        console.error("Invalid song data received");
        return;
      }

      try {
        setSongTitle(songData.title || "Untitled Song");
        const sections = parseSongContent(songData.content);
        const sequence = createDisplaySequence(sections);
        setSongSections(sequence);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error handling song data:", error);
      }
    },
    [parseSongContent, createDisplaySequence]
  );

  // Enhanced font control functions with overflow prevention
  const increaseFontSize = useCallback(() => {
    if (fontSizeMultiplier < 2.0) {
      const newMultiplier = Math.min(2.0, fontSizeMultiplier + 0.05);

      // Test if the new multiplier would cause overflow before applying
      const currentSection = songSections[currentIndex];
      if (contentRef.current && currentSection) {
        const testFontSize = calculateOptimalFontSize(
          contentRef.current,
          currentSection.content
        );

        // Temporarily test with the new multiplier
        const tempMultiplier = fontSizeMultiplier;
        const testSize = testFontSize * newMultiplier;

        // Create test element to check if content would overflow
        const temp = document.createElement("div");
        temp.style.position = "absolute";
        temp.style.visibility = "hidden";
        temp.style.fontFamily = fontFamily;
        temp.style.fontWeight = "bold";
        temp.style.lineHeight = "1.2";
        temp.style.textAlign = "center";
        temp.style.width = contentRef.current.clientWidth * 0.95 + "px";
        temp.style.padding = "20px";
        temp.style.boxSizing = "border-box";
        document.body.appendChild(temp);

        currentSection.content.forEach((line, index) => {
          const p = document.createElement("p");
          p.textContent = line.trim() || " ";
          p.style.margin = "0";
          p.style.fontWeight = "bold";
          p.style.lineHeight = "1.2";
          p.style.fontSize = testSize + "px";

          if (index < currentSection.content.length - 1) {
            p.style.marginBottom = Math.floor(testSize * 0.3) + "px";
          }
          temp.appendChild(p);
        });

        const testHeight = temp.scrollHeight;
        const maxAllowedHeight = contentRef.current.clientHeight * 0.95;
        document.body.removeChild(temp);

        // Only apply the increase if it won't cause overflow
        if (testHeight <= maxAllowedHeight) {
          setFontSizeMultiplier(newMultiplier);
          setLocalStorageItem("bmusicFontMultiplier", newMultiplier.toString());
        } else {
          console.log("Font size increase prevented to avoid overflow");
        }
      } else {
        // Apply normally if no content to test
        setFontSizeMultiplier(newMultiplier);
        setLocalStorageItem("bmusicFontMultiplier", newMultiplier.toString());
      }
    }
  }, [
    fontSizeMultiplier,
    currentIndex,
    songSections,
    fontFamily,
    calculateOptimalFontSize,
  ]);

  const decreaseFontSize = useCallback(() => {
    if (fontSizeMultiplier > 0.2) {
      const newMultiplier = fontSizeMultiplier - 0.05;
      setFontSizeMultiplier(newMultiplier);
      setLocalStorageItem("bmusicFontMultiplier", newMultiplier.toString());
    }
  }, [fontSizeMultiplier]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < songSections.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, songSections.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToSection = useCallback(
    (index: number) => {
      if (index >= 0 && index < songSections.length) {
        setCurrentIndex(index);
      }
    },
    [songSections.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "+":
        case "=":
          increaseFontSize();
          break;
        case "-":
          decreaseFontSize();
          break;
        case "f":
        case "F":
          // Font controls are now always visible in compact mode
          break;
        case "Escape":
          if (typeof window !== "undefined" && window.api?.minimizeProjection) {
            window.api.minimizeProjection();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, increaseFontSize, decreaseFontSize]);

  // Listen for song data from Electron
  useEffect(() => {
    if (typeof window !== "undefined" && window.api?.onDisplaySong) {
      window.api.onDisplaySong(handleSongData);
    }

    if (typeof window !== "undefined" && window.api?.onDisplayInfo) {
      window.api.onDisplayInfo((info: any) => {
        setIsExternalDisplay(info.isExternalDisplay);
      });
    }

    // Load initial song if provided
    if (initialSong) {
      handleSongData(initialSong);
    } else {
      // Load previously selected song from localStorage if no initial song
      const savedSong = getLocalStorageItem("selectedSong");
      if (savedSong) {
        try {
          const parsedSong = JSON.parse(savedSong);
          if (parsedSong && parsedSong.title && parsedSong.content) {
            handleSongData(parsedSong);
          }
        } catch (error) {
          console.error("Error parsing saved song:", error);
        }
      }
    }
  }, [handleSongData, initialSong]);

  const currentSection = songSections[currentIndex];
  const optimalFontSize =
    contentRef.current && currentSection
      ? calculateOptimalFontSize(contentRef.current, currentSection.content)
      : baseFontSize;

  // Real-time overflow protection - monitors and corrects font size if content overflows
  useEffect(() => {
    const currentSection = songSections[currentIndex];
    if (!contentRef.current || !currentSection) return;

    const checkForOverflow = () => {
      const container = contentRef.current;
      if (!container) return;

      const containerHeight = container.clientHeight;
      const contentElement = container.querySelector(
        ".space-y-4"
      ) as HTMLElement;

      if (contentElement) {
        const contentHeight = contentElement.scrollHeight;
        const maxAllowedHeight = containerHeight * 0.95;

        // If content is overflowing, automatically reduce font size
        if (contentHeight > maxAllowedHeight) {
          const scaleFactor = maxAllowedHeight / contentHeight;
          const adjustedMultiplier = fontSizeMultiplier * scaleFactor * 0.98; // 98% for safety

          // Only reduce if the adjustment is significant (more than 1% difference)
          if (adjustedMultiplier < fontSizeMultiplier * 0.99) {
            setFontSizeMultiplier(Math.max(0.3, adjustedMultiplier));
            setLocalStorageItem(
              "bmusicFontMultiplier",
              adjustedMultiplier.toString()
            );
            console.log(
              "Auto-adjusted font size to prevent overflow:",
              adjustedMultiplier
            );
          }
        }
      }
    };

    // Check immediately and after a brief delay for layout completion
    const timeoutId = setTimeout(checkForOverflow, 100);

    // Also check on window resize
    const handleResize = () => {
      clearTimeout(timeoutId);
      setTimeout(checkForOverflow, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentIndex, songSections, fontSizeMultiplier]);

  // Window resize handler to maintain proper font sizing
  useEffect(() => {
    const handleResize = () => {
      const currentSection = songSections[currentIndex];
      if (!contentRef.current || !currentSection) return;

      // Recalculate font size after resize with a small delay for layout completion
      setTimeout(() => {
        const container = contentRef.current;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const contentElement = container.querySelector(
          ".space-y-4"
        ) as HTMLElement;

        if (contentElement) {
          const contentHeight = contentElement.scrollHeight;
          const maxAllowedHeight = containerHeight * 0.95;

          // If content overflows after resize, adjust font size
          if (contentHeight > maxAllowedHeight) {
            const scaleFactor = maxAllowedHeight / contentHeight;
            const adjustedMultiplier = fontSizeMultiplier * scaleFactor * 0.98;

            if (adjustedMultiplier < fontSizeMultiplier) {
              setFontSizeMultiplier(Math.max(0.3, adjustedMultiplier));
              setLocalStorageItem(
                "bmusicFontMultiplier",
                adjustedMultiplier.toString()
              );
              console.log(
                "Font size auto-adjusted after window resize:",
                adjustedMultiplier
              );
            }
          }
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex, songSections, fontSizeMultiplier]);

  // Real-time localStorage updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bmusicfontFamily" && e.newValue) {
        setFontFamily(e.newValue);
      }
      if (e.key === "bmusicpresentationbg") {
        const newBg = e.newValue || "./wood7.png";
        setBackgroundImage(newBg);
      }
    };

    // Check for changes every second (fallback for same-window changes)
    const settingsCheck = setInterval(() => {
      const currentFont = getLocalStorageItem(
        "bmusicfontFamily",
        "Georgia, serif"
      );
      if (currentFont !== fontFamily) {
        setFontFamily(currentFont!);
      }

      const currentBg = getLocalStorageItem("bmusicpresentationbg");
      const expectedBg = currentBg || "./wood7.png";
      if (expectedBg !== backgroundImage) {
        setBackgroundImage(expectedBg);
      }
    }, 1000);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(settingsCheck);
    };
  }, [fontFamily, backgroundImage]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Enhanced Background with Multiple Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: "brightness(0.7) contrast(1.1)",
        }}
      />

      {/* Sophisticated Gradient Overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Subtle Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full bg-repeat animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: "60px 60px",
            animationDuration: "8s",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 h-full flex flex-col">
        {/* Enhanced Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div
            ref={contentRef}
            className="w-full h-full max-h-screen flex flex-col items-center justify-center text-center text-white font-bold overflow-hidden relative"
            style={{ fontFamily }}
          >
            {/* Content with Enhanced Animations */}
            <AnimatePresence mode="wait">
              {currentSection ? (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{
                    duration: 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    staggerChildren: 0.1,
                  }}
                  className="space-y-6 relative"
                >
                  {/* Content Background Blur Effect */}
                  <div className="absolute inset-0 -m-8  rounded-3xl border border-white/10" />

                  {currentSection.content.map((line, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: index * 0.15 + 0.3,
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{
                        fontSize: `${optimalFontSize}px`,
                        fontFamily: fontFamily,
                        lineHeight: 1.3,
                        textShadow:
                          "0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)",
                        filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
                      }}
                      className="m-0 relative z-10 transition-all duration-300"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center relative"
                >
                  {/* Welcome Screen Enhancement */}
                  <div className="absolute inset-0 -m-16 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
                  <h1
                    style={{
                      fontSize: "84px",
                      fontFamily: fontFamily,
                      textShadow:
                        "0 6px 30px rgba(0,0,0,0.9), 0 3px 12px rgba(0,0,0,0.7)",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                    className="font-bold drop-shadow-2xl relative z-10 animate-pulse"
                  >
                    Blessed Music
                  </h1>
                  {/* Decorative Elements */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Compact Control Panel - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-30"
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            {/* Section Indicator (Compact) */}
            {currentSection && (
              <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  <span className="text-white text-xs font-medium">
                    {currentSection.type}
                    {currentSection.number && ` ${currentSection.number}`}
                    {currentSection.isRepeating && " (R)"}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Progress (Compact) */}
            {songSections.length > 0 && (
              <div className="bg-black/50 rounded-md px-2 py-1 border border-white/10">
                <div className="flex items-center space-x-1">
                  <span className="text-white text-xs font-mono">
                    {currentIndex + 1}/{songSections.length}
                  </span>
                  {/* Mini progress dots */}
                  <div className="flex space-x-0.5 ml-1">
                    {songSections
                      .slice(0, Math.min(5, songSections.length))
                      .map((_, index) => (
                        <div
                          key={index}
                          className={`w-1 h-1 rounded-full transition-all duration-200 ${
                            index === currentIndex
                              ? "bg-blue-400"
                              : "bg-white/30"
                          }`}
                        />
                      ))}
                    {songSections.length > 5 && (
                      <span className="text-white/50 text-xs ml-0.5">…</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Font Size Control (Compact) */}
            <div className="bg-black/50 rounded-md border border-white/10">
              <div className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={decreaseFontSize}
                  className="p-1 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-l-md transition-all duration-200"
                  aria-label="Decrease font size"
                >
                  <Minus size={12} />
                </motion.button>

                <div className="text-white text-xs font-mono px-2 py-1 min-w-[32px] text-center border-x border-white/10">
                  {Math.round(fontSizeMultiplier * 100)}%
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={increaseFontSize}
                  className="p-1 text-green-300 hover:text-green-100 hover:bg-green-500/20 rounded-r-md transition-all duration-200"
                  aria-label="Increase font size"
                >
                  <Plus size={12} />
                </motion.button>
              </div>
            </div>

            {/* Navigation Arrows (Compact) */}
            {songSections.length > 0 && (
              <div className="bg-black/50 rounded-md border border-white/10">
                <div className="flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className={`p-1 rounded-l-md transition-all duration-200 ${
                      currentIndex === 0
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
                    }`}
                    aria-label="Previous section"
                  >
                    <ChevronLeft size={12} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNext}
                    disabled={currentIndex === songSections.length - 1}
                    className={`p-1 rounded-r-md transition-all duration-200 ${
                      currentIndex === songSections.length - 1
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
                    }`}
                    aria-label="Next section"
                  >
                    <ChevronRight size={12} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ambient Light Effects */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </div>
  );
};

export default SongPresentationDisplay;
