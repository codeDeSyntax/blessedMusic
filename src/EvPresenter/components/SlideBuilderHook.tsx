import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPicker } from "antd";
import { AnimatedContent } from "./AnimatedContent";

interface SlideBuilderProps {
  currentPresentation: any;
  backgroundImage: string;
  titleColor: string;
  scriptureColor: string;
  quoteColor: string;
  mainMessageColor: string;
  titleFontSize: number;
  scriptureFontSize: number;
  quoteFontSize: number;
  mainMessageFontSize: number;
  titleFontFamily: string;
  scriptureFontFamily: string;
  quoteFontFamily: string;
  mainMessageFontFamily: string;
  selectedAnimation: string;
  scriptureScrollRef: React.RefObject<HTMLDivElement>;
  messagePointsScrollRef: React.RefObject<HTMLDivElement>;
  handleTextClick: (
    event: React.MouseEvent,
    type: "title" | "scripture" | "quote" | "mainMessage"
  ) => void;
  // Font controls
  handleTitleFontSizeChange: (size: number) => void;
  handleScriptureFontSizeChange: (size: number) => void;
  handleQuoteFontSizeChange: (size: number) => void;
  handleMainMessageFontSizeChange: (size: number) => void;
  handleTitleFontFamilyChange: (fontFamily: string) => void;
  handleScriptureFontFamilyChange: (fontFamily: string) => void;
  handleQuoteFontFamilyChange: (fontFamily: string) => void;
  handleMainMessageFontFamilyChange: (fontFamily: string) => void;
  handleTitleColorChange: (color: string) => void;
  handleScriptureColorChange: (color: string) => void;
  handleQuoteColorChange: (color: string) => void;
  handleMainMessageColorChange: (color: string) => void;
  lookupScripture: (
    reference: string
  ) => { reference: string; text: string } | null;
}

export const useSlideBuilder = ({
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
}: SlideBuilderProps) => {
  // Color picker states
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

  // Font family options
  const fontFamilyOptions = [
    { value: "Bitter Thin, serif", label: "Bitter" },
    { label: "Impact", value: "Impact" },
    { label: "Arial", value: "Arial black, sans-serif" },
    { label: "Garamond", value: "garamond, serif" },
    { label: "Roboto", value: "Roboto, sans-serif" },
  ];

  // Close all color pickers
  const closeAllColorPickers = () => {
    setShowTitleColorPicker(false);
    setShowScriptureColorPicker(false);
    setShowQuoteColorPicker(false);
    setShowMainMessageColorPicker(false);
  };

  // Enhanced text click handler
  const enhancedHandleTextClick = (
    event: React.MouseEvent,
    type: "title" | "scripture" | "quote" | "mainMessage"
  ) => {
    // Set color picker position
    setColorPickerPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Close all other pickers first
    closeAllColorPickers();

    // Open the specific picker
    if (type === "title") setShowTitleColorPicker(true);
    else if (type === "scripture") setShowScriptureColorPicker(true);
    else if (type === "quote") setShowQuoteColorPicker(true);
    else if (type === "mainMessage") setShowMainMessageColorPicker(true);

    // Also call the original handler
    handleTextClick(event, type);
  };
  // Font size utility functions
  const getTitleFontClass = () => {
    const sizeMap = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
      9: "text-9xl",
    };
    return sizeMap[titleFontSize as keyof typeof sizeMap] || "text-4xl";
  };

  const getScriptureFontClass = () => {
    const sizeMap = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
    };
    return sizeMap[scriptureFontSize as keyof typeof sizeMap] || "text-6xl";
  };

  const getQuoteFontClass = () => {
    const sizeMap = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
    };
    return sizeMap[quoteFontSize as keyof typeof sizeMap] || "text-5xl";
  };

  const getMainMessageFontClass = () => {
    const sizeMap = {
      1: "text-xl",
      2: "text-2xl",
      3: "text-3xl",
      4: "text-4xl",
      5: "text-5xl",
      6: "text-6xl",
      7: "text-7xl",
      8: "text-8xl",
      //   9: "text-9xl",
    };
    return sizeMap[mainMessageFontSize as keyof typeof sizeMap] || "text-4xl";
  };

  // Dynamic scripture font class function - moved outside buildSlides for proper dependency tracking
  const getDynamicScriptureFontClass = useCallback(
    (scriptureCount: number) => {
      if (scriptureCount <= 3) return getScriptureFontClass();
      if (scriptureCount <= 6) {
        const baseSize = scriptureFontSize;
        const adjustedSize = Math.max(1, baseSize - 1);
        const sizeMap: { [key: number]: string } = {
          1: "text-xl",
          2: "text-2xl",
          3: "text-3xl",
          4: "text-4xl",
          5: "text-5xl",
          6: "text-6xl",
          7: "text-7xl",
          8: "text-8xl",
          9: "text-9xl",
        };
        return sizeMap[adjustedSize] || "text-4xl";
      }
      if (scriptureCount <= 10) {
        const baseSize = scriptureFontSize;
        const adjustedSize = Math.max(1, baseSize - 2);
        const sizeMap: { [key: number]: string } = {
          1: "text-xl",
          2: "text-2xl",
          3: "text-3xl",
          4: "text-4xl",
          5: "text-5xl",
          6: "text-6xl",
        };
        return sizeMap[adjustedSize] || "text-3xl";
      }
      // For more than 10 scriptures, use smaller font
      const baseSize = scriptureFontSize;
      const adjustedSize = Math.max(1, baseSize - 3);
      const sizeMap: { [key: number]: string } = {
        1: "text-xl",
        2: "text-2xl",
        3: "text-3xl",
        4: "text-4xl",
        5: "text-5xl",
        6: "text-6xl",
      };
      return sizeMap[adjustedSize] || "text-2xl";
    },
    [scriptureFontSize, getScriptureFontClass]
  );

  const buildSlides = useCallback(() => {
    const newSlides: React.ReactNode[] = [];

    // Replace the entire title slide section (lines ~95-220) with this:

    // NEW MODERN TITLE SLIDE - Matching the provided layout exactly
    newSlides.push(
      <div key="title-slide" className="w-full h-full relative overflow-hidden">
        {/* Overall background image with blur */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #654321 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Backdrop blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

        {/* Horizontal brown section spanning full width */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-64">
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #654321 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/30"></div>

            {/* Right Side - Main Title Area (positioned within brown section) */}
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 z-20">
              <div className="text-right max-w-3xl">
                {/* Main Title */}
                <AnimatedContent animation={selectedAnimation} isVisible={true}>
                  <h1
                    className={`${getTitleFontClass()} font-bold leading-tight cursor-pointer hover:opacity-90 transition-all duration-300 text-right mb-4`}
                    style={{
                      color: titleColor || "#FFFFFF",
                      fontFamily: titleFontFamily,
                      textShadow:
                        "4px 4px 12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.1)",
                      letterSpacing: "0.02em",
                    }}
                    onClick={(e) => enhancedHandleTextClick(e, "title")}
                    title="Click to change color and font"
                  >
                    {currentPresentation.title || "Holy Bible PowerPoint"}
                  </h1>
                </AnimatedContent>

                {/* Inspirational Quote Section */}
                <div className="space-y-3 text-right"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tall vertical frame on the left - overlaying both sections */}
        <div className="absolute left-16 top-16 bottom-16 w-80 z-30">
          {/* White frame border */}
          <div className="w-full h-full bg-white rounded-xl shadow-2xl border-8 border-white p-2">
            {/* Frame inner content with image background */}
            <div
              className="w-full h-full rounded-lg relative"
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30 rounded-lg"></div>

              {/* Frame Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
                {/* Decorative top star */}
                <div className="text-4xl text-yellow-400 mb-8">✦</div>

                {/* Preacher Section */}
                {currentPresentation.type === "sermon" &&
                  (currentPresentation as any).preacher && (
                    <div className="space-y-3 mb-10">
                      <div className="text-sm text-white/80 uppercase tracking-wider font-medium">
                        Preached by
                      </div>
                      <div className="text-2xl font-bold text-white leading-tight">
                        {(currentPresentation as any).preacher}
                      </div>
                    </div>
                  )}

                {/* Date Section */}
                <div className="space-y-2 mb-8">
                  <div className="text-sm text-white/70 uppercase tracking-wider">
                    Date
                  </div>
                  <div className="text-lg font-semibold text-white/90">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Scripture Reference */}
                {currentPresentation.type === "sermon" &&
                  (currentPresentation as any).scriptures?.length > 0 && (
                    <div className="space-y-2 mb-8">
                      <div className="text-sm text-white/70 uppercase tracking-wider">
                        Scripture
                      </div>
                      <div className="text-base font-medium text-yellow-300">
                        {(currentPresentation as any).scriptures[0].reference}
                      </div>
                    </div>
                  )}

                {/* Bottom decorative star */}
                <div className="text-3xl text-yellow-400 mt-auto">✦</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative red stars */}
        <div className="absolute top-20 right-32 text-3xl text-red-500 z-10">
          ✦
        </div>
        <div className="absolute bottom-20 left-1/2 text-2xl text-red-500 z-10">
          ✦
        </div>
      </div>
    );

    // Scripture slides with modern glass card layout (RESTORED ORIGINAL STRUCTURE)
    if (
      currentPresentation.scriptures &&
      currentPresentation.scriptures.length > 0
    ) {
      const scriptures = currentPresentation.scriptures;
      const scriptureCount = scriptures.length;

      // Calculate dynamic font size based on scripture count
      const getDynamicScriptureFontClass = () => {
        if (scriptureCount <= 3) return getScriptureFontClass();
        if (scriptureCount <= 6) {
          const baseSize = scriptureFontSize;
          const adjustedSize = Math.max(1, baseSize - 1);
          const sizeMap: { [key: number]: string } = {
            1: "text-xl",
            2: "text-2xl",
            3: "text-3xl",
            4: "text-4xl",
            5: "text-5xl",
            6: "text-6xl",
            7: "text-7xl",
            8: "text-8xl",
            9: "text-9xl",
          };
          return sizeMap[adjustedSize] || "text-4xl";
        }
        if (scriptureCount <= 10) {
          const baseSize = scriptureFontSize;
          const adjustedSize = Math.max(1, baseSize - 2);
          const sizeMap: { [key: number]: string } = {
            1: "text-xl",
            2: "text-2xl",
            3: "text-3xl",
            4: "text-4xl",
            5: "text-5xl",
            6: "text-6xl",
          };
          return sizeMap[adjustedSize] || "text-3xl";
        }
        // For more than 10 scriptures, use smaller font
        const baseSize = scriptureFontSize;
        const adjustedSize = Math.max(1, baseSize - 3);
        const sizeMap: { [key: number]: string } = {
          1: "text-xl",
          2: "text-2xl",
          3: "text-3xl",
          4: "text-4xl",
          5: "text-5xl",
          6: "text-6xl",
        };
        return sizeMap[adjustedSize] || "text-2xl";
      };

      // Modern scripture slide with glassmorphism design
      newSlides.push(
        <div
          key="scripture-slide"
          className="w-full h-full relative overflow-hidden"
        >
          {/* Main background image */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Backdrop blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>

          {/* Modern header section */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <div className="flex items-center justify-center pt-12 pb-8">
              {/* Floating title card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-12 py-4 shadow-2xl">
                <AnimatedContent animation={selectedAnimation} isVisible={true}>
                  <h1
                    className="text-5xl font-bold cursor-pointer font-impact hover:opacity-80 transition-all duration-300 text-center"
                    style={{
                      color: titleColor,
                      //   fontFamily: "Georgia, serif",
                      textShadow: "3px 3px 8px rgba(0,0,0,0.9)",
                      letterSpacing: "0.05em",
                    }}
                    onClick={(e) => enhancedHandleTextClick(e, "title")}
                    title="Click to change color"
                  >
                    Scripture Reading
                  </h1>
                </AnimatedContent>

                {/* Decorative line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mt-4"></div>
              </div>
            </div>
          </div>

          {/* Main content area with modern grid layout */}
          <div className="absolute top-32 bottom-8 left-8 right-8 z-10">
            <div className="h-full flex items-center justify-center">
              {/* Scripture container with glassmorphism */}
              <div className="w-full max-w-5xl h-full">
                <div
                  className="bg-white/5 border border-white/15 rounded-3xl shadow-2xl h-full p-8"
                  style={{
                    backgroundImage: backgroundImage
                      ? `url(${backgroundImage})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Scripture count indicator */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <span className="text-white/80 text-sm font-medium">
                        {scriptureCount} Scripture
                        {scriptureCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>

                  {/* AUTO-FLIPPING SCRIPTURE DISPLAY (ONLY INNER CONTENT CHANGED) */}
                  <div className="h-[calc(100%-5rem)] overflow-hidden">
                    <div className="h-full relative">
                      {/* Scripture slider container */}
                      <div
                        className="scripture-slider w-full h-full flex items-center justify-center"
                        style={{
                          animation: `scriptureSlide ${
                            scriptureCount * 6
                          }s infinite linear`,
                        }}
                      >
                        {scriptures.map((scripture: any, index: number) => {
                          const scriptureData = lookupScripture
                            ? lookupScripture(
                                scripture.text ||
                                  `${scripture.book} ${scripture.chapter}:${scripture.verse}`
                              )
                            : null;

                          return (
                            <div
                              key={`scripture-${index}`}
                              className="scripture-card absolute inset-0 flex items-center justify-center p-8"
                              style={{
                                opacity: 0,
                                transform: "translateX(-100px) scale(0.8)",
                                animation: `slideInOut ${
                                  scriptureCount * 6
                                }s infinite`,
                                animationDelay: `${index * 6}s`,
                                zIndex: 1,
                                animationFillMode: "both",
                                visibility: "hidden",
                              }}
                            >
                              {/* SCRIPTURE CONTENT - REFERENCE AT TOP */}
                              <div className="w-full max-w-4xl text-center">
                                {/* Scripture Reference - AT THE VERY TOP */}
                                {(scripture.reference || scripture.book) && (
                                  <div className="mb-12">
                                    <div className="bg-yellow-400/40 backdrop-blur-md rounded-2xl px-10 py-8 border-3 border-yellow-400/70 inline-block shadow-2xl">
                                      <h2 className="text-yellow-100 text-4xl font-bold tracking-wide drop-shadow-xl">
                                        {scripture.reference ||
                                          `${scripture.book} ${scripture.chapter}:${scripture.verse}`}
                                      </h2>
                                    </div>
                                  </div>
                                )}

                                {/* Scripture text */}
                                <div className="mb-8 relative z-20">
                                  <p
                                    className={`${getDynamicScriptureFontClass()} font-medium leading-relaxed cursor-pointer hover:opacity-80 transition-all duration-300 relative z-20`}
                                    style={{
                                      color: scriptureColor,
                                      lineHeight: 1.6,
                                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                      fontFamily: scriptureFontFamily,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      enhancedHandleTextClick(e, "scripture");
                                    }}
                                    title="Click to change color and font"
                                  >
                                    {scriptureData?.text ||
                                      scripture.text ||
                                      `${scripture.book} ${scripture.chapter}:${scripture.verse}`}
                                  </p>
                                </div>

                                {/* Decorative line */}
                                <div className="flex justify-center items-center space-x-4">
                                  <div
                                    className="w-24 h-px"
                                    style={{
                                      background: `linear-gradient(90deg, transparent, ${scriptureColor}, transparent)`,
                                    }}
                                  />
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: scriptureColor,
                                    }}
                                  />
                                  <div
                                    className="w-24 h-px"
                                    style={{
                                      background: `linear-gradient(90deg, transparent, ${scriptureColor}, transparent)`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {scriptures.map((_: any, index: number) => (
                          <div
                            key={`indicator-${index}`}
                            className="w-2 h-2 rounded-full backdrop-blur-sm border border-white/20"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.3)",
                              animation: `indicatorPulse ${
                                scriptureCount * 6
                              }s infinite`,
                              animationDelay: `${index * 6}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-1/4 right-12 text-2xl text-yellow-400/60 animate-pulse">
            ✦
          </div>
          <div className="absolute bottom-1/4 left-12 text-xl text-yellow-400/60 animate-pulse delay-300">
            ✦
          </div>

          {/* Bottom progress indicator for multiple scriptures */}
          {scriptureCount > 5 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-white/70 text-xs">
                  Auto-sliding scriptures
                </span>
              </div>
            </div>
          )}

          {/* CSS animations for auto-sliding */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes scriptureSlide {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.01); }
                }

                @keyframes slideInOut {
                  0%, 85%, 100% { 
                    opacity: 0; 
                    transform: translateX(-100px) scale(0.8); 
                    visibility: hidden;
                    z-index: 1;
                  }
                  15%, 75% { 
                    opacity: 1; 
                    transform: translateX(0) scale(1); 
                    visibility: visible;
                    z-index: 10;
                  }
                }

                @keyframes indicatorPulse {
                  0%, 85%, 100% { 
                    opacity: 0.3; 
                    transform: scale(1);
                    background-color: rgba(255, 255, 255, 0.3);
                  }
                  10%, 75% { 
                    opacity: 1; 
                    transform: scale(1.2);
                    background-color: ${
                      scriptureColor || "rgba(255, 255, 255, 0.8)"
                    };
                  }
                }

                .scripture-slider {
                  perspective: 1000px;
                }

                .scripture-card {
                  will-change: opacity, transform, z-index, visibility;
                  transition: none;
                  backface-visibility: hidden;
                  pointer-events: none;
                }
                
                .scripture-card[style*="z-index: 10"] {
                  pointer-events: auto;
                }
              `,
            }}
          />

          {/* Custom scrollbar styles */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: ${scriptureColor};
                  border-radius: 3px;
                  opacity: 0.7;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  opacity: 1;
                }
              `,
            }}
          />
        </div>
      );
    }

    // Quote slides - Split screen design FULL WIDTH (exact original)
    if (currentPresentation.quotes && currentPresentation.quotes.length > 0) {
      currentPresentation.quotes.forEach(
        (quoteItem: any, quoteIndex: number) => {
          newSlides.push(
            <div key={`quote-${quoteIndex}`} className="w-full h-full flex">
              {/* Left side - Background image with centered title (1/3 width) - FULL WIDTH */}
              <div className="w-1/3 h-full relative flex items-center justify-center">
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: backgroundImage
                      ? `url(${backgroundImage})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Centered Quotes Title */}
                <div className="relative z-10 text-center ">
                  <AnimatedContent
                    animation={selectedAnimation}
                    isVisible={true}
                  >
                    <h1
                      className="text-6xl font-impact italic cursor-pointer hover:opacity-80 transition-all duration-300"
                      style={{
                        color: titleColor,
                        fontFamily: titleFontFamily,
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                      onClick={(e) => enhancedHandleTextClick(e, "title")}
                      title="Click to change color and font"
                    >
                      Quotes
                    </h1>
                  </AnimatedContent>

                  {/* Author or reference below the title */}
                  <div className="mt-6 flex items-center justify-between">
                    {/* Left side - Reference and Prophet Initials */}
                    <div className="flex flex-col items-center gap-3">
                      {(quoteItem.reference || quoteItem.author) && (
                        <div className="inline-block px-4 py-2 font-bitter text-white rounded-full text-xl font-thin backdrop-blur-sm italic">
                          {quoteItem.reference || quoteItem.author}
                        </div>
                      )}

                      {/* Prophet initials on the left side */}
                      {quoteItem.prophetInitials && (
                        <div className="w-12 h-12 font-[garamond] rounded-full text-white flex items-center justify-center text-xl font-bold backdrop-blur-sm border-2 italic border-white/20">
                          {quoteItem.prophetInitials}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Quote content with blurred background (2/3 width) - FULL WIDTH */}
              <div className="w-2/3 h-full relative flex items-center justify-center overflow-hidden bg-gray-800">
                {/* Blurred background image - REMOVED SKEW */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: backgroundImage
                      ? `url(${backgroundImage})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    filter: "blur(15px)",
                    transform: "scale(1.2)",
                  }}
                />

                {/* Overlay for better text readability */}
                <div className="absolute -skew-y-12 inset-0 bg-gradient-to-br from-black/30 via-black/30 to-black/30"></div>

                {/* Quote container with border design */}
                <div className="relative mx-16 z-10">
                  <img
                    src={
                      quoteItem.prophetInitials === "WMB"
                        ? "./wmb.jpeg"
                        : "./bob.jpg"
                    }
                    alt=""
                    className="h-16 w-16 rounded-full absolute -right-5 -top-5 z-20"
                  />

                  {/* Top-left quote mark */}
                  <div className="absolute -top-4 -left-4 z-10">
                    <div className="text-6xl font-bold text-gray-800 leading-none">
                      "
                    </div>
                  </div>

                  {/* Quote box with border */}
                  <div className="relative border-4 border-white/20 p-12 border-dashed max-h-[70vh] overflow-hidden">
                    {/* Quote text container with scrolling */}
                    <div
                      className="max-h-[60vh] overflow-y-auto no-scrollbar"
                      style={{
                        scrollBehavior: "smooth",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <div className="text-center">
                        <p
                          className={`${getQuoteFontClass()} font-bitter leading-relaxed cursor-pointer hover:opacity-80 transition-all duration-300`}
                          style={{
                            color: quoteColor || "#2d3748",
                            fontFamily: quoteFontFamily,
                            lineHeight: 1.6,
                          }}
                          onClick={(e) => enhancedHandleTextClick(e, "quote")}
                          title="Click to change color and font"
                        >
                          {quoteItem.text || quoteItem.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote tracker indicators (positioned over the split) */}
              {currentPresentation.quotes.length > 1 && (
                <div className="absolute bottom-8 right-2/3 transform -translate-x-1/2 flex gap-3 z-20">
                  {currentPresentation.quotes.map((_: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                        idx === quoteIndex
                          ? "bg-white/90 border-gray-800 scale-110"
                          : "bg-white/60 border-gray-600 hover:bg-white/80"
                      }`}
                      style={{
                        boxShadow:
                          idx === quoteIndex
                            ? "0 0 20px rgba(0, 0, 0, 0.3)"
                            : "0 0 10px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <span
                          className={`text-xs font-bold ${
                            idx === quoteIndex ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
      );
    }

    // Message points slides - FULL WIDTH with corner animations (exact original)
    if (
      currentPresentation.messagePoints &&
      currentPresentation.messagePoints.length > 0
    ) {
      currentPresentation.messagePoints.forEach((point: any, index: number) => {
        newSlides.push(
          <div
            key={`message-${index}`}
            className="w-full h-full relative overflow-hidden"
            style={{ minHeight: "100vh" }}
          >
            {/* Background image - FULL WIDTH */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Additional backdrop blur overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>

            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/30 to-black/10"></div>

            {/* Content container - FULL WIDTH */}
            <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
              <div className="relative w-full max-w-6xl">
                {/* Message Points with auto-scrolling */}
                <div className="flex-1 overflow-hidden relative">
                  {/* Corner blinking decorations */}
                  <div className="absolute top-2 left-2 w-3 h-3 z-30">
                    <div className="corner-blink-tl"></div>
                  </div>
                  <div className="absolute top-2 right-2 w-3 h-3 z-30">
                    <div className="corner-blink-tr"></div>
                  </div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 z-30">
                    <div className="corner-blink-bl"></div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 z-30">
                    <div className="corner-blink-br"></div>
                  </div>

                  <div
                    ref={messagePointsScrollRef}
                    className="h-full overflow-y-auto no-scrollbar pr-4 max-h-[70vh]"
                    style={{
                      scrollBehavior: "smooth",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <div className="space-y-6 py-8">
                      <AnimatedContent
                        animation={selectedAnimation}
                        isVisible={true}
                      >
                        <div className="group">
                          <div className="flex items-start gap-6">
                            {/* Animated bullet point */}
                            <div
                              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mt-1 hover:scale-110 transition-transform"
                              style={{
                                backgroundColor: mainMessageColor,
                                color: "#ffffff",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                border: `2px solid ${mainMessageColor}`,
                              }}
                            >
                              <span className="font-impact">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </div>

                            {/* Point content */}
                            <div className="flex-1">
                              <div
                                className={`${getMainMessageFontClass()} leading-relaxed cursor-pointer hover:opacity-80 transition-all duration-300 group-hover:translate-x-2 font-[garamond] hover:scale-105 hover:-translate-y-1`}
                                style={{
                                  color: mainMessageColor,
                                  fontFamily: mainMessageFontFamily,
                                  lineHeight: 1.3,
                                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                }}
                                onClick={(e) =>
                                  enhancedHandleTextClick(e, "mainMessage")
                                }
                                title="Click to change color, font, and size"
                              >
                                {point.text}
                              </div>

                              {/* Decorative line under each point */}
                              <div
                                className="w-full h-px mt-4 opacity-50 transform origin-left scale-x-100 transition-transform duration-600"
                                style={{
                                  backgroundColor: mainMessageColor,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </AnimatedContent>
                    </div>
                  </div>
                </div>

                {/* Corner label */}
                <div className="absolute top-20 left-[40%] z-20">
                  <div className="px-4 py-2 bg-black/60 rounded-lg backdrop-blur-sm border border-white/20 opacity-100 transition-opacity duration-800">
                    <span className="text-sm font-[garamond] font-bold text-white/90 tracking-wider">
                      Message highlights
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      });
    }

    return newSlides;
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
    titleFontFamily,
    scriptureFontFamily,
    quoteFontFamily,
    mainMessageFontFamily,
    selectedAnimation,
    scriptureScrollRef,
    messagePointsScrollRef,
    getTitleFontClass,
    getScriptureFontClass,
    getQuoteFontClass,
    getMainMessageFontClass,
    getDynamicScriptureFontClass,
    enhancedHandleTextClick,
  ]);

  // Color picker components - Compact version
  const ColorPickerComponents = () => (
    <AnimatePresence>
      {/* Title Color Picker */}
      {showTitleColorPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed z-50 backdrop-blur-xl rounded-xl p-3 shadow-2xl border color-picker-container"
          style={{
            left: colorPickerPosition.x - 100,
            top: colorPickerPosition.y - 60,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            width: "130px",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-2">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
              Title Style
            </h4>
          </div>

          {/* Font Family Control - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Font
            </label>
            <select
              value={titleFontFamily}
              onChange={(e) => handleTitleFontFamilyChange(e.target.value)}
              className="w-full p-1 rounded-md bg-white/10 dark:bg-black/20 border border-white/20 text-gray-800 dark:text-white text-xs backdrop-blur-sm"
            >
              {fontFamilyOptions.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  className="bg-gray-800 text-white"
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Control - Compact */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Size
              </label>
              <div className="px-1 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {getTitleFontClass().replace("text-", "")}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={titleFontSize}
              onChange={(e) =>
                handleTitleFontSizeChange(parseInt(e.target.value))
              }
              className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Color
            </label>
            <ColorPicker
              value={titleColor}
              onChange={(color) => handleTitleColorChange(color.toHexString())}
              size="small"
              showText={false}
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
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Scripture Color Picker */}
      {showScriptureColorPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed z-50 backdrop-blur-xl rounded-xl p-3 shadow-2xl border color-picker-container"
          style={{
            left: colorPickerPosition.x - 100,
            top: colorPickerPosition.y - 60,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            width: "130px",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-2">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
              Scripture Style
            </h4>
          </div>

          {/* Font Family Control - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Font
            </label>
            <select
              value={scriptureFontFamily}
              onChange={(e) => handleScriptureFontFamilyChange(e.target.value)}
              className="w-full p-1 rounded-md bg-white/10 dark:bg-black/20 border border-white/20 text-gray-800 dark:text-white text-xs backdrop-blur-sm"
            >
              {fontFamilyOptions.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  className="bg-gray-800 text-white"
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Color
            </label>
            <ColorPicker
              value={scriptureColor}
              onChange={(color) =>
                handleScriptureColorChange(color.toHexString())
              }
              size="small"
              showText={false}
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
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Quote Color Picker */}
      {showQuoteColorPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed z-50 backdrop-blur-xl rounded-xl p-3 shadow-2xl border color-picker-container"
          style={{
            left: colorPickerPosition.x - 100,
            top: colorPickerPosition.y - 60,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            width: "130px",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-2">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
              Quote Style
            </h4>
          </div>

          {/* Font Family Control - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Font
            </label>
            <select
              value={quoteFontFamily}
              onChange={(e) => handleQuoteFontFamilyChange(e.target.value)}
              className="w-full p-1 rounded-md bg-white/10 dark:bg-black/20 border border-white/20 text-gray-800 dark:text-white text-xs backdrop-blur-sm"
            >
              {fontFamilyOptions.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  className="bg-gray-800 text-white"
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Control - Compact */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Size
              </label>
              <div className="px-1 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {getQuoteFontClass().replace("text-", "")}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={quoteFontSize}
              onChange={(e) =>
                handleQuoteFontSizeChange(parseInt(e.target.value))
              }
              className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Color
            </label>
            <ColorPicker
              value={quoteColor}
              onChange={(color) => handleQuoteColorChange(color.toHexString())}
              size="small"
              showText={false}
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
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Main Message Color Picker */}
      {showMainMessageColorPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed z-50 backdrop-blur-xl rounded-xl p-3 shadow-2xl border color-picker-container"
          style={{
            left: colorPickerPosition.x - 100,
            top: colorPickerPosition.y - 60,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            width: "130px",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-2">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
              Main Message Style
            </h4>
          </div>

          {/* Font Family Control - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Font
            </label>
            <select
              value={mainMessageFontFamily}
              onChange={(e) =>
                handleMainMessageFontFamilyChange(e.target.value)
              }
              className="w-full p-1 rounded-md bg-white/10 dark:bg-black/20 border border-white/20 text-gray-800 dark:text-white text-xs backdrop-blur-sm"
            >
              {fontFamilyOptions.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  className="bg-gray-800 text-white"
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Control - Compact */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Size
              </label>
              <div className="px-1 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {getMainMessageFontClass().replace("text-", "")}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={mainMessageFontSize}
              onChange={(e) =>
                handleMainMessageFontSizeChange(parseInt(e.target.value))
              }
              className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker - Compact */}
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Color
            </label>
            <ColorPicker
              value={mainMessageColor}
              onChange={(color) =>
                handleMainMessageColorChange(color.toHexString())
              }
              size="small"
              showText={false}
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
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { buildSlides, ColorPickerComponents };
};

export default useSlideBuilder;
