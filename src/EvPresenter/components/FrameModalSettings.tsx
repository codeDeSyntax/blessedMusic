import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  X,
  Zap,
  Waves,
  Bomb,
  Wind,
  Sparkles,
  RotateCcw,
  Star,
  Tornado,
  Atom,
  Rainbow,
  Folder,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

interface FrameModalSettingsProps {
  showSettings: boolean;
  onClose: () => void;
  autoPlayInterval: number;
  handleIntervalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedAnimation: string;
  setSelectedAnimation: (animation: string) => void;
  presentationbgs: string[];
  backgroundImage: string;
  handleBackgroundChange: (newBackground: string) => void;
  onCustomImagesPathChange?: (newPath: string) => void;
  onRefreshImages?: () => void;
}

interface PowerAnimation {
  value: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  description: string;
}

export const FrameModalSettings: React.FC<FrameModalSettingsProps> = ({
  showSettings,
  onClose,
  autoPlayInterval,
  handleIntervalChange,
  selectedAnimation,
  setSelectedAnimation,
  presentationbgs,
  backgroundImage,
  handleBackgroundChange,
  onCustomImagesPathChange,
  onRefreshImages,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentCustomPath, setCurrentCustomPath] = useState<string>("");
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Load current custom path from localStorage on component mount
  useEffect(() => {
    const savedPath = localStorage.getItem("evpresenterimagespath");
    if (savedPath) {
      setCurrentCustomPath(savedPath);
    }
  }, []);

  // Handle directory selection
  const handleSelectCustomDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === "string" && result) {
        const newPath = result;
        setCurrentCustomPath(newPath);
        localStorage.setItem("evpresenterimagespath", newPath);

        // Notify parent component to reload images
        if (onCustomImagesPathChange) {
          onCustomImagesPathChange(newPath);
        }
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  // Handle clearing custom directory (use defaults)
  const handleClearCustomDirectory = () => {
    setCurrentCustomPath("");
    localStorage.removeItem("evpresenterimagespath");

    // Notify parent component to reload default images
    if (onCustomImagesPathChange) {
      onCustomImagesPathChange("");
    }
  };

  // Handle refreshing images from current directory
  const handleRefreshImages = async () => {
    if (!onRefreshImages) return;

    setIsLoadingImages(true);
    try {
      await onRefreshImages();
    } finally {
      setIsLoadingImages(false);
    }
  };

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

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings, onClose]);

  // Custom powerful animations combining AOS and Framer Motion
  const powerAnimations: PowerAnimation[] = [
    {
      value: "bouncing-text",
      icon: Zap,
      description: "Bouncy spring physics",
    },
    {
      value: "gliding-sweep",
      icon: Wind,
      description: "Smooth gliding motion",
    },
    {
      value: "explosive-zoom",
      icon: Bomb,
      description: "Explosive zoom effect",
    },
    {
      value: "wave-reveal",
      icon: Waves,
      description: "Wave-like revelation",
    },
    {
      value: "spiral-entrance",
      icon: Tornado,
      description: "Spiral rotation effect",
    },
  ];

  if (!showSettings) return null;

  return (
    <AnimatePresence>
      {showSettings && (
        <>
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
            <div className="bg-white rounded-xl shadow-2xl border2 border-white border-solid py-2 h-[65vh] w-64">
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
                  //   height: "500px",
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
                        <Settings size={12} className="text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Settings</h3>
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
                    {/* Auto-play interval */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">⏱️</span>
                        <label className="text-xs font-medium text-white/90">
                          Auto-play
                        </label>
                      </div>
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min={1000}
                            max={10000}
                            step={500}
                            value={autoPlayInterval}
                            onChange={handleIntervalChange}
                            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                                ((autoPlayInterval - 1000) / 9000) * 100
                              }%, rgba(255,255,255,0.2) ${
                                ((autoPlayInterval - 1000) / 9000) * 100
                              }%, rgba(255,255,255,0.2) 100%)`,
                            }}
                          />
                          <span className="text-xs text-white/80 min-w-fit">
                            {autoPlayInterval / 1000}s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Animation selection */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Sparkles size={14} className="text-white" />
                        <label className="text-xs font-medium text-white/90">
                          Animations
                        </label>
                      </div>
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex flex-wrap gap-1">
                          {powerAnimations.map((animation) => {
                            const IconComponent = animation.icon;
                            const isSelected =
                              selectedAnimation === animation.value;

                            return (
                              <motion.button
                                key={animation.value}
                                onClick={() =>
                                  setSelectedAnimation(animation.value)
                                }
                                className={`p-2 rounded transition-all ${
                                  isSelected
                                    ? "bg-white/30 text-white"
                                    : "bg-white/5 hover:bg-white/15 text-white/70"
                                }`}
                                title={animation.description}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {/* Animated icon preview */}
                                {animation.value === "bouncing-text" ? (
                                  <motion.div
                                    animate={
                                      isSelected
                                        ? {
                                            y: [0, -8, 0],
                                            scale: [1, 1.2, 1],
                                          }
                                        : {}
                                    }
                                    transition={
                                      isSelected
                                        ? {
                                            duration: 0.6,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                          }
                                        : {}
                                    }
                                  >
                                    <IconComponent size={14} />
                                  </motion.div>
                                ) : animation.value === "gliding-sweep" ? (
                                  <motion.div
                                    animate={
                                      isSelected
                                        ? {
                                            x: [-5, 5, -5],
                                            opacity: [0.7, 1, 0.7],
                                          }
                                        : {}
                                    }
                                    transition={
                                      isSelected
                                        ? {
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                          }
                                        : {}
                                    }
                                  >
                                    <IconComponent size={14} />
                                  </motion.div>
                                ) : animation.value === "explosive-zoom" ? (
                                  <motion.div
                                    animate={
                                      isSelected
                                        ? {
                                            scale: [1, 1.5, 1],
                                            rotate: [0, 180, 360],
                                          }
                                        : {}
                                    }
                                    transition={
                                      isSelected
                                        ? {
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeOut",
                                          }
                                        : {}
                                    }
                                  >
                                    <IconComponent size={14} />
                                  </motion.div>
                                ) : animation.value === "wave-reveal" ? (
                                  <motion.div
                                    animate={
                                      isSelected
                                        ? {
                                            y: [0, -3, 0],
                                            skewY: [0, 5, 0],
                                          }
                                        : {}
                                    }
                                    transition={
                                      isSelected
                                        ? {
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                          }
                                        : {}
                                    }
                                  >
                                    <IconComponent size={14} />
                                  </motion.div>
                                ) : animation.value === "spiral-entrance" ? (
                                  <motion.div
                                    animate={
                                      isSelected
                                        ? {
                                            rotate: [0, 360],
                                            scale: [0.8, 1.2, 0.8],
                                          }
                                        : {}
                                    }
                                    transition={
                                      isSelected
                                        ? {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                          }
                                        : {}
                                    }
                                  >
                                    <IconComponent size={14} />
                                  </motion.div>
                                ) : (
                                  <IconComponent size={14} />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Background selection */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">🖼️</span>
                        <label className="text-xs font-medium text-white/90">
                          Backgrounds
                        </label>
                      </div>

                      {/* Custom Directory Controls */}
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm mb-1">
                        <div className="space-y-2">
                          {/* Current Path Display */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70">
                              {currentCustomPath ? "Custom:" : "Using defaults"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleRefreshImages}
                                disabled={isLoadingImages}
                                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                                title="Refresh images"
                              >
                                <RefreshCw
                                  size={10}
                                  className={`text-white/80 ${
                                    isLoadingImages ? "animate-spin" : ""
                                  }`}
                                />
                              </button>
                              <button
                                onClick={handleSelectCustomDirectory}
                                className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                title="Select custom images folder"
                              >
                                <FolderOpen
                                  size={10}
                                  className="text-white/80"
                                />
                              </button>
                              {currentCustomPath && (
                                <button
                                  onClick={handleClearCustomDirectory}
                                  className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                  title="Use default images"
                                >
                                  <X size={10} className="text-white/80" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Path Display */}
                          {currentCustomPath && (
                            <div className="text-xs text-white/60 truncate bg-black/20 rounded px-2 py-1">
                              {currentCustomPath}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Background Images Grid */}
                      <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm">
                        <div className="flex overflow-x-auto gap-1 pb-1">
                          {presentationbgs.length > 0 ? (
                            presentationbgs.map((bg, index) => (
                              <div
                                key={index}
                                className={`relative flex-shrink-0 transition-all duration-300 ${
                                  index > 0 ? "-ml-3" : ""
                                } ${
                                  backgroundImage === bg
                                    ? "z-20 scale-110 ring-2 ring-white/50"
                                    : "z-10 hover:z-15 hover:scale-105"
                                }`}
                              >
                                <div
                                  onClick={() => handleBackgroundChange(bg)}
                                  className="block cursor-pointer"
                                >
                                  <div
                                    className="w-8 h-8 rounded-full border-2 border-white/30 bg-cover bg-center shadow-lg"
                                    style={{
                                      backgroundImage: `url(${bg})`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-white/60 text-center py-2">
                              {isLoadingImages
                                ? "Loading images..."
                                : "No images found"}
                            </div>
                          )}
                        </div>

                        {/* Images Count */}
                        <div className="text-xs text-white/60 text-center mt-1">
                          {presentationbgs.length} image
                          {presentationbgs.length !== 1 ? "s" : ""} available
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

export default FrameModalSettings;
