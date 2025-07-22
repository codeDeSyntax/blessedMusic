import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPicker } from "antd";

interface ColorPickerPosition {
  x: number;
  y: number;
}

interface ColorFontPickerProps {
  // Title picker props
  showTitleColorPicker: boolean;
  titleFontSize: number;
  titleColor: string;
  getTitleFontClass: () => string;
  handleTitleFontSizeChange: (size: number) => void;
  handleTitleColorChange: (color: string) => void;

  // Scripture picker props
  showScriptureColorPicker: boolean;
  scriptureFontSize: number;
  scriptureColor: string;
  getScriptureFontClass: () => string;
  handleScriptureFontSizeChange: (size: number) => void;
  handleScriptureColorChange: (color: string) => void;

  // Quote picker props
  showQuoteColorPicker: boolean;
  quoteFontSize: number;
  quoteColor: string;
  getQuoteFontClass: () => string;
  handleQuoteFontSizeChange: (size: number) => void;
  handleQuoteColorChange: (color: string) => void;

  // Main message picker props
  showMainMessageColorPicker: boolean;
  mainMessageFontSize: number;
  mainMessageColor: string;
  getMainMessageFontClass: () => string;
  handleMainMessageFontSizeChange: (size: number) => void;
  handleMainMessageColorChange: (color: string) => void;

  // Common props
  colorPickerPosition: ColorPickerPosition;
  closeAllColorPickers: () => void;
}

export const ColorFontPicker: React.FC<ColorFontPickerProps> = ({
  showTitleColorPicker,
  titleFontSize,
  titleColor,
  getTitleFontClass,
  handleTitleFontSizeChange,
  handleTitleColorChange,

  showScriptureColorPicker,
  scriptureFontSize,
  scriptureColor,
  getScriptureFontClass,
  handleScriptureFontSizeChange,
  handleScriptureColorChange,

  showQuoteColorPicker,
  quoteFontSize,
  quoteColor,
  getQuoteFontClass,
  handleQuoteFontSizeChange,
  handleQuoteColorChange,

  showMainMessageColorPicker,
  mainMessageFontSize,
  mainMessageColor,
  getMainMessageFontClass,
  handleMainMessageFontSizeChange,
  handleMainMessageColorChange,

  colorPickerPosition,
  closeAllColorPickers,
}) => {
  const commonStyle = {
    left: colorPickerPosition.x - 140, // Slightly wider positioning
    top: colorPickerPosition.y - 90, // Better vertical positioning
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
    borderColor: "rgba(154, 103, 74, 0.3)", // Brand color border
    boxShadow:
      "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(154, 103, 74, 0.2)",
    backdropFilter: "blur(20px)",
  };

  const commonPresets = [
    {
      label: "Presentation Colors",
      colors: [
        "#ffffff", // White
        "#000000", // Black
        "#9a674a", // Brand Color
        "#7a5236", // Brand Dark
        "#f8f8ff", // Ghost White
        "#fffaf0", // Floral White
        "#f5f5dc", // Beige
        "#daa520", // Golden Rod
      ],
    },
    {
      label: "Vibrant Colors",
      colors: [
        "#ff4d4f", // Red
        "#52c41a", // Green
        "#1890ff", // Blue
        "#faad14", // Orange
        "#722ed1", // Purple
        "#eb2f96", // Pink
        "#13c2c2", // Cyan
        "#a0d911", // Lime
      ],
    },
    {
      label: "Elegant Tones",
      colors: [
        "#8b4513", // Saddle Brown
        "#2f4f4f", // Dark Slate Gray
        "#483d8b", // Dark Slate Blue
        "#b8860b", // Dark Golden Rod
        "#556b2f", // Dark Olive Green
        "#8b008b", // Dark Magenta
        "#cd853f", // Peru
        "#4682b4", // Steel Blue
      ],
    },
  ];

  return (
    <AnimatePresence>
      {/* Title Color Picker */}
      {showTitleColorPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
          style={commonStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#9a674a] to-[#7a5236] shadow-sm"></div>
              <h4 className="text-sm font-bold text-[#9a674a] dark:text-white tracking-wide">
                📝 TITLE STYLE
              </h4>
            </div>
          </div>

          {/* Font Size Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Font Size
              </label>
              <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
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
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
              Color
            </label>
            <ColorPicker
              value={titleColor}
              onChange={(color) => {
                handleTitleColorChange(color.toHexString());
              }}
              size="large"
              showText
              format="hex"
              placement="bottom"
              presets={commonPresets}
              onOpenChange={(open) => {
                if (!open && showTitleColorPicker) {
                  setTimeout(() => {
                    const colorPicker =
                      document.querySelector(".ant-color-picker");
                    if (colorPicker) {
                      (colorPicker as HTMLElement).click();
                    }
                  }, 0);
                }
              }}
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
          style={commonStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#9a674a] to-[#7a5236] shadow-sm"></div>
              <h4 className="text-sm font-bold text-[#9a674a] dark:text-white tracking-wide">
                📖 SCRIPTURE STYLE
              </h4>
            </div>
          </div>

          {/* Font Size Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Font Size
              </label>
              <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {getScriptureFontClass().replace("text-", "")}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={scriptureFontSize}
              onChange={(e) =>
                handleScriptureFontSizeChange(parseInt(e.target.value))
              }
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
              Color
            </label>
            <ColorPicker
              value={scriptureColor}
              onChange={(color) => {
                handleScriptureColorChange(color.toHexString());
              }}
              size="large"
              showText
              format="hex"
              placement="bottom"
              presets={commonPresets}
              onOpenChange={(open) => {
                if (!open && showScriptureColorPicker) {
                  setTimeout(() => {
                    const colorPicker =
                      document.querySelector(".ant-color-picker");
                    if (colorPicker) {
                      (colorPicker as HTMLElement).click();
                    }
                  }, 0);
                }
              }}
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
          style={commonStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#9a674a] to-[#7a5236] shadow-sm"></div>
              <h4 className="text-sm font-bold text-[#9a674a] dark:text-white tracking-wide">
                💬 QUOTE STYLE
              </h4>
            </div>
          </div>

          {/* Font Size Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Font Size
              </label>
              <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
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
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
              Color
            </label>
            <ColorPicker
              value={quoteColor}
              onChange={(color) => {
                handleQuoteColorChange(color.toHexString());
              }}
              size="large"
              showText
              format="hex"
              placement="bottom"
              presets={commonPresets}
              onOpenChange={(open) => {
                if (!open && showQuoteColorPicker) {
                  setTimeout(() => {
                    const colorPicker =
                      document.querySelector(".ant-color-picker");
                    if (colorPicker) {
                      (colorPicker as HTMLElement).click();
                    }
                  }, 0);
                }
              }}
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          className="fixed z-50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border color-picker-container"
          style={commonStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#9a674a]/20 to-[#7a5236]/20 border border-[#9a674a]/30">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#9a674a] to-[#7a5236] shadow-sm"></div>
              <h4 className="text-sm font-bold text-[#9a674a] dark:text-white tracking-wide">
                ✨ MESSAGE STYLE
              </h4>
            </div>
          </div>

          {/* Font Size Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Font Size
              </label>
              <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
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
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-2">
              Color
            </label>
            <ColorPicker
              value={mainMessageColor}
              onChange={(color) => {
                handleMainMessageColorChange(color.toHexString());
              }}
              size="large"
              showText
              format="hex"
              placement="bottom"
              presets={commonPresets}
              onOpenChange={(open) => {
                if (!open && showMainMessageColorPicker) {
                  setTimeout(() => {
                    const colorPicker =
                      document.querySelector(".ant-color-picker");
                    if (colorPicker) {
                      (colorPicker as HTMLElement).click();
                    }
                  }, 0);
                }
              }}
            />
          </div>

          <button
            onClick={closeAllColorPickers}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
