import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Pause,
  Play,
  Settings,
  ChevronLeft,
  Maximize,
  Info,
  RotateCcw,
} from "lucide-react";

interface VerticalActionPanelProps {
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

export const VerticalActionPanel: React.FC<VerticalActionPanelProps> = ({
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

  // Don't show in presentation mode
  if (isPresentationMode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed top-16 right-6 z-50 flex flex-col gap-3"
    >
      {/* Main vertical action panel */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex flex-col gap-3">
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 bg-[#9a674a]/80 hover:bg-[#8a5a3a] text-white rounded-xl transition-all duration-200 shadow-lg group"
            title="Back"
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </motion.button>

          {/* View toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setSlideView(slideView === "grid" ? "carousel" : "grid")
            }
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 shadow-lg ${
              slideView === "grid"
                ? "bg-[#9a674a] text-white"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
            title={
              slideView === "grid" ? "Switch to Carousel" : "Switch to Grid"
            }
          >
            <Grid3X3 size={16} />
          </motion.button>

          {/* Auto-play toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 shadow-lg ${
              isAutoPlaying
                ? "bg-red-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
            title={isAutoPlaying ? "Pause Auto-play" : "Start Auto-play"}
          >
            {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
          </motion.button>

          {/* Divider */}
          <div className="w-full h-px bg-white/20" />

          {/* Info toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfo(!showInfo)}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 shadow-lg ${
              showInfo
                ? "bg-[#9a674a] text-white"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
            title="Toggle Info Panel"
          >
            <Info size={16} />
          </motion.button>

          {/* Settings toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSettings}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 shadow-lg ${
              showSettings
                ? "bg-[#9a674a] text-white"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
            title="Toggle Settings"
          >
            <Settings size={16} />
          </motion.button>

          {/* Fullscreen toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 shadow-lg border border-white/20"
            title="Toggle Fullscreen"
          >
            <Maximize size={16} />
          </motion.button>

          {/* Divider */}
          <div className="w-full h-px bg-white/20" />

          {/* Present button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPresentationMode(true)}
            className="flex items-center justify-center w-10 h-10 bg-[#9a674a] hover:bg-[#8a5a3a] text-white rounded-xl transition-all duration-200 shadow-lg font-medium text-xs"
            title="Start Presentation"
          >
            P
          </motion.button>
        </div>
      </div>

      {/* Slide navigation panel (only show in carousel view) */}
      {slideView === "carousel" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl"
        >
          <div className="flex flex-col gap-2 items-center">
            {/* Previous slide */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20"
              title="Previous Slide"
            >
              <ArrowLeft size={14} />
            </motion.button>

            {/* Slide counter */}
            <div className="text-xs text-white/80 font-medium text-center px-2">
              <div>{currentSlide + 1}</div>
              <div className="w-full h-px bg-white/20 my-1" />
              <div>{slides.length}</div>
            </div>

            {/* Next slide */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20"
              title="Next Slide"
            >
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VerticalActionPanel;
