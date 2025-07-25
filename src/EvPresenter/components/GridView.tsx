import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GridViewProps {
  slides: React.ReactNode[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  setDirection: (direction: number) => void;
  slideView: "grid" | "carousel";
  slidesPerPage: number;
  backgroundImage: string;
}

export const GridView: React.FC<GridViewProps> = ({
  slides,
  currentSlide,
  setCurrentSlide,
  setDirection,
  slideView,
  slidesPerPage,
  backgroundImage,
}) => {
  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  };

  if (slideView === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 overflow-y-auto max-h-[90vh]">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              currentSlide === index
                ? "ring-4 ring-[#9a674a] ring-opacity-80"
                : ""
            }`}
            onClick={() => goToSlide(index)}
          >
            {/* Thumbnail preview */}
            <div
              className="w-full h-full flex items-center justify-center text-xs relative"
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Blur overlay for preview */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />

              {/* Slide number indicator */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>

              {/* Current slide indicator */}
              {currentSlide === index && (
                <div className="absolute inset-0 bg-[#9a674a]/20 flex items-center justify-center">
                  <div className="bg-[#9a674a] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current
                  </div>
                </div>
              )}

              {/* Slide preview content (simplified) */}
              <div className="relative z-10 p-2 text-white text-center">
                <div className="text-xs font-medium line-clamp-2">
                  Slide {index + 1}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
};

export default GridView;
