import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Pause,
  Play,
  Settings,
  ChevronLeft,
  RotateCcw,
  Maximize,
  Info,
} from "lucide-react";

interface NavigationControlsProps {
  currentSlide: number;
  slides: React.ReactNode[];
  setCurrentSlide: (slide: number) => void;
  setDirection: (direction: number) => void;
  slideView: "grid" | "carousel";
  setSlideView: (view: "grid" | "carousel") => void;
  isAutoPlaying: boolean;
  setIsAutoPlaying: (playing: boolean) => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  showSettings: boolean;
  toggleSettings: () => void;
  showInfo: boolean;
  setShowInfo: (show: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onBack: () => void;
}

export const EnhancedNavigationControls: React.FC<NavigationControlsProps> = ({
  currentSlide,
  slides,
  setCurrentSlide,
  setDirection,
  slideView,
  setSlideView,
  isAutoPlaying,
  setIsAutoPlaying,
  isPresentationMode,
  setIsPresentationMode,
  showSettings,
  toggleSettings,
  showInfo,
  setShowInfo,
  isFullscreen,
  toggleFullscreen,
  onBack,
}) => {
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  };

  if (isPresentationMode) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-4 transition-all duration-300 hover:bg-black/70">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-white hover:text-[#9a674a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="text-white text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </span>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-white hover:text-[#9a674a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowRight size={20} />
        </button>

        <div className="w-px h-4 bg-white/30" />

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-white hover:text-[#9a674a] transition-colors"
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={() => setIsPresentationMode(false)}
          className="text-white hover:text-red-400 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-40 flex justify-between items-center">
      {/* Left controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#9a674a] hover:bg-[#8a5a3a] text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ChevronLeft size={16} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <button
          onClick={() =>
            setSlideView(slideView === "grid" ? "carousel" : "grid")
          }
          className={`p-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            slideView === "grid"
              ? "bg-[#9a674a] text-white"
              : "bg-white/80 dark:bg-gray-800/80 text-[#9a674a] dark:text-white hover:bg-white dark:hover:bg-gray-800"
          }`}
        >
          <Grid3X3 size={16} />
        </button>

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`p-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isAutoPlaying
              ? "bg-red-500 text-white"
              : "bg-white/80 dark:bg-gray-800/80 text-[#9a674a] dark:text-white hover:bg-white dark:hover:bg-gray-800"
          }`}
        >
          {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Center slide indicator */}
      {slideView === "carousel" && (
        <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-[#9a674a] dark:text-white hover:text-[#7a5236] dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <span className="text-sm font-medium text-[#9a674a] dark:text-white mx-2">
            {currentSlide + 1} / {slides.length}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="text-[#9a674a] dark:text-white hover:text-[#7a5236] dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            showInfo
              ? "bg-[#9a674a] text-white"
              : "bg-white/80 dark:bg-gray-800/80 text-[#9a674a] dark:text-white hover:bg-white dark:hover:bg-gray-800"
          }`}
        >
          <Info size={16} />
        </button>

        <button
          onClick={toggleSettings}
          className={`p-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            showSettings
              ? "bg-[#9a674a] text-white"
              : "bg-white/80 dark:bg-gray-800/80 text-[#9a674a] dark:text-white hover:bg-white dark:hover:bg-gray-800"
          }`}
        >
          <Settings size={16} />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/80 dark:bg-gray-800/80 text-[#9a674a] dark:text-white rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Maximize size={16} />
        </button>

        <button
          onClick={() => setIsPresentationMode(true)}
          className="px-4 py-2 bg-[#9a674a] hover:bg-[#8a5a3a] text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="text-sm font-medium">Present</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedNavigationControls;
