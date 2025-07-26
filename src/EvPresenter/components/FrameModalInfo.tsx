import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Keyboard, Mouse, Eye, Clock, FileText } from "lucide-react";

interface FrameModalInfoProps {
  showInfo: boolean;
  onClose: () => void;
  currentPresentation: any;
  currentSlide: number;
  totalSlides: number;
  backgroundImage: string;
}

export const FrameModalInfo: React.FC<FrameModalInfoProps> = ({
  showInfo,
  onClose,
  currentPresentation,
  currentSlide,
  totalSlides,
  backgroundImage,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (showInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfo, onClose]);

  if (!showInfo) return null;

  return (
    <AnimatePresence>
      {showInfo && (
        <>
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal positioned next to vertical toolbar */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-32 right-1 z-50 w-96"
          >
            {/* Frame border - matching title slide design */}
            <div className="bg-white/20 rounded-xl shadow-2xl border2 border-white border-solid py-2 h-[65vh] w-64 backdrop-blur-md">
              {/* Frame inner content with background */}
              <div
                className="w-full h-full rounded-lg relative overflow-"
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

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col p-3 text-white">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                        <Info size={12} className="text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Info</h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>

                  {/* Scrollable content */}
                  <div
                    className="flex-1 overflow-y-auto space-y-2 custom-scrollbar"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.3) transparent",
                    }}
                  >
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                        .custom-scrollbar::-webkit-scrollbar {
                          width: 4px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                          background: rgba(255,255,255,0.3);
                          border-radius: 2px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                          background: rgba(255,255,255,0.5);
                        }
                      `,
                      }}
                    />
                    {/* Presentation Details */}
                    <div className="space-y-2">
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText size={12} className="text-white" />
                          <h4 className="text-xs font-medium text-white">
                            Current
                          </h4>
                        </div>
                        <p className="text-xs text-white/80 truncate">
                          {currentPresentation?.title || "No title"}
                        </p>
                        {currentPresentation?.preacher && (
                          <p className="text-xs text-white/60 truncate">
                            {currentPresentation.preacher}
                          </p>
                        )}
                      </div>

                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Eye size={12} className="text-white" />
                          <h4 className="text-xs font-medium text-white">
                            Progress
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex-1 bg-white/20 rounded-full h-1">
                            <div
                              className="bg-white h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  ((currentSlide + 1) / totalSlides) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-white/80">
                            {currentSlide + 1}/{totalSlides}
                          </span>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-2">
                          <Clock size={12} className="text-white" />
                          <h4 className="text-xs font-medium text-white">
                            Statistics
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">
                              {currentPresentation?.scriptures?.length || 0}
                            </div>
                            <div className="text-xs text-white/60">
                              Scripture
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">
                              {currentPresentation?.quotes?.length || 0}
                            </div>
                            <div className="text-xs text-white/60">Quotes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">
                              {currentPresentation?.mainMessagePoints?.length ||
                                0}
                            </div>
                            <div className="text-xs text-white/60">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">
                              {totalSlides}
                            </div>
                            <div className="text-xs text-white/60">Slides</div>
                          </div>
                        </div>
                      </div>

                      {/* Keyboard Shortcuts */}
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-2">
                          <Keyboard size={12} className="text-white" />
                          <h4 className="text-xs font-medium text-white">
                            Shortcuts
                          </h4>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/60">Next</span>
                            <span className="text-white bg-white/20 px-1 rounded text-xs">
                              →
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Prev</span>
                            <span className="text-white bg-white/20 px-1 rounded text-xs">
                              ←
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Full</span>
                            <span className="text-white bg-white/20 px-1 rounded text-xs">
                              F
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Present</span>
                            <span className="text-white bg-white/20 px-1 rounded text-xs">
                              P
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mouse Controls */}
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-2">
                          <Mouse size={12} className="text-white" />
                          <h4 className="text-xs font-medium text-white">
                            Mouse
                          </h4>
                        </div>
                        <div className="space-y-1 text-xs text-white/80">
                          <div>• Click text to change colors</div>
                          <div>• Right side: Next slide</div>
                          <div>• Left side: Previous slide</div>
                          <div>• Double click: Fullscreen</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FrameModalInfo;
