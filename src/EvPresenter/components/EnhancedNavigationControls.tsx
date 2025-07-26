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

  // Don't show any top controls in normal mode - they're now handled by VerticalActionPanel
  return null;
};

export default EnhancedNavigationControls;
