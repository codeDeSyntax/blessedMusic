import React from "react";
import { Info, Keyboard, Mouse, Eye } from "lucide-react";

interface InfoPanelProps {
  showInfo: boolean;
  currentPresentation: any;
  currentSlide: number;
  totalSlides: number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  showInfo,
  currentPresentation,
  currentSlide,
  totalSlides,
}) => {
  if (!showInfo) return null;

  return (
    <div className="fixed top-20 left-4 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Info size={12} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-[#9a674a] dark:text-white">
            Presentation Info
          </h3>
        </div>

        {/* Presentation Details */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300 mb-1">
              📋 Current Presentation
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {currentPresentation?.title || "No title"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300 mb-1">
              📊 Progress
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#9a674a] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentSlide + 1) / totalSlides) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {currentSlide + 1}/{totalSlides}
              </span>
            </div>
          </div>

          {currentPresentation?.date && (
            <div>
              <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300 mb-1">
                📅 Date
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentPresentation.date}
              </p>
            </div>
          )}

          {currentPresentation?.location && (
            <div>
              <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300 mb-1">
                📍 Location
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentPresentation.location}
              </p>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Keyboard size={14} className="text-[#9a674a] dark:text-gray-400" />
            <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300">
              Keyboard Shortcuts
            </h4>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Next slide
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                → Space
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Previous slide
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                ←
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Present mode
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                F5 / P
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Exit presentation
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                Esc
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Fullscreen
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                F11
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Auto-play
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                A
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Go to slide
              </span>
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                1-9
              </code>
            </div>
          </div>
        </div>

        {/* Mouse Interactions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mouse size={14} className="text-[#9a674a] dark:text-gray-400" />
            <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300">
              Mouse Interactions
            </h4>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Change text color
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                Click text
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Select background
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                Click image
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Grid view slide
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                Click thumbnail
              </span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[#9a674a] dark:text-gray-400" />
            <h4 className="text-sm font-medium text-[#9a674a] dark:text-gray-300">
              Tips
            </h4>
          </div>

          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>• Use grid view to see all slides at once</p>
            <p>• Click on any text to change its color</p>
            <p>• Auto-scroll works for long scripture content</p>
            <p>• Settings are saved automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
