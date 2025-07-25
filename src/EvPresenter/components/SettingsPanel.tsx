import React, { useMemo } from "react";
import { Settings } from "lucide-react";

interface SettingsPanelProps {
  showSettings: boolean;
  settingsRef: React.RefObject<HTMLDivElement>;
  autoPlayInterval: number;
  handleIntervalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedAnimation: string;
  setSelectedAnimation: (animation: string) => void;
  presentationbgs: string[];
  backgroundImage: string;
  handleBackgroundChange: (newBackground: string) => void;
}

interface PowerAnimation {
  value: string;
  label: string;
  description: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showSettings,
  settingsRef,
  autoPlayInterval,
  handleIntervalChange,
  selectedAnimation,
  setSelectedAnimation,
  presentationbgs,
  backgroundImage,
  handleBackgroundChange,
}) => {
  // Custom powerful animations combining AOS and Framer Motion
  const powerAnimations: PowerAnimation[] = [
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

  // Memoized background images to prevent unnecessary re-renders
  const backgroundImages = useMemo(() => {
    return presentationbgs.map((bg, index) => (
      <BackgroundImage
        key={`${bg}-${index}`}
        bg={bg}
        index={index}
        isSelected={backgroundImage === bg}
        onClick={() => handleBackgroundChange(bg)}
      />
    ));
  }, [presentationbgs, backgroundImage, handleBackgroundChange]);

  // Memoized settings panel content
  const settingsContent = useMemo(
    () => (
      <div className="space-y-4">
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
                {powerAnimations.find((a) => a.value === selectedAnimation)
                  ?.description || "Choose a powerful animation effect"}
              </div>
              <div className="text-xs text-blue-400 dark:text-blue-300 mt-2">
                💡 Tip: Click on text elements to change colors & font sizes!
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
                    {backgroundImages}
                  </div>
                  {/* Scroll hint indicator */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [
      autoPlayInterval,
      handleIntervalChange,
      selectedAnimation,
      setSelectedAnimation,
      powerAnimations,
      backgroundImages,
    ]
  );

  if (!showSettings) return null;

  return (
    <div
      ref={settingsRef}
      className="fixed top-20 right-4 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto transition-all duration-300 transform hover:scale-[1.02]"
      style={{
        backdropFilter: "blur(20px)",
        boxShadow:
          "0 25px 50px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {settingsContent}
    </div>
  );
};

export default SettingsPanel;
