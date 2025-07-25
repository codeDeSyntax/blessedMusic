import React from "react";
import { ColorPicker } from "antd";

interface ColorPickersProps {
  showTitleColorPicker: boolean;
  showScriptureColorPicker: boolean;
  showQuoteColorPicker: boolean;
  showMainMessageColorPicker: boolean;
  colorPickerPosition: { x: number; y: number };
  titleColor: string;
  scriptureColor: string;
  quoteColor: string;
  mainMessageColor: string;
  handleTitleColorChange: (color: string) => void;
  handleScriptureColorChange: (color: string) => void;
  handleQuoteColorChange: (color: string) => void;
  handleMainMessageColorChange: (color: string) => void;
  closeAllColorPickers: () => void;
}

export const ColorPickers: React.FC<ColorPickersProps> = ({
  showTitleColorPicker,
  showScriptureColorPicker,
  showQuoteColorPicker,
  showMainMessageColorPicker,
  colorPickerPosition,
  titleColor,
  scriptureColor,
  quoteColor,
  mainMessageColor,
  handleTitleColorChange,
  handleScriptureColorChange,
  handleQuoteColorChange,
  handleMainMessageColorChange,
  closeAllColorPickers,
}) => {
  return (
    <>
      {/* Title Color Picker */}
      {showTitleColorPicker && (
        <div
          className="color-picker-container fixed z-[9999] pointer-events-none"
          style={{
            left: `${colorPickerPosition.x}px`,
            top: `${colorPickerPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-3 border border-white/20">
            <div className="text-xs font-medium text-gray-700 mb-2 text-center">
              Title Color
            </div>
            <ColorPicker
              value={titleColor}
              onChange={(color) => handleTitleColorChange(color.toHexString())}
              showText
              size="small"
              format="hex"
              placement="bottom"
              presets={[
                {
                  label: "Popular",
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
            <button
              onClick={closeAllColorPickers}
              className="mt-2 w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Scripture Color Picker */}
      {showScriptureColorPicker && (
        <div
          className="color-picker-container fixed z-[9999] pointer-events-none"
          style={{
            left: `${colorPickerPosition.x}px`,
            top: `${colorPickerPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-3 border border-white/20">
            <div className="text-xs font-medium text-gray-700 mb-2 text-center">
              Scripture Color
            </div>
            <ColorPicker
              value={scriptureColor}
              onChange={(color) =>
                handleScriptureColorChange(color.toHexString())
              }
              showText
              size="small"
              format="hex"
              placement="bottom"
              presets={[
                {
                  label: "Popular",
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
            <button
              onClick={closeAllColorPickers}
              className="mt-2 w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Quote Color Picker */}
      {showQuoteColorPicker && (
        <div
          className="color-picker-container fixed z-[9999] pointer-events-none"
          style={{
            left: `${colorPickerPosition.x}px`,
            top: `${colorPickerPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-3 border border-white/20">
            <div className="text-xs font-medium text-gray-700 mb-2 text-center">
              Quote Color
            </div>
            <ColorPicker
              value={quoteColor}
              onChange={(color) => handleQuoteColorChange(color.toHexString())}
              showText
              size="small"
              format="hex"
              placement="bottom"
              presets={[
                {
                  label: "Popular",
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
            <button
              onClick={closeAllColorPickers}
              className="mt-2 w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Main Message Color Picker */}
      {showMainMessageColorPicker && (
        <div
          className="color-picker-container fixed z-[9999] pointer-events-none"
          style={{
            left: `${colorPickerPosition.x}px`,
            top: `${colorPickerPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-3 border border-white/20">
            <div className="text-xs font-medium text-gray-700 mb-2 text-center">
              Main Message Color
            </div>
            <ColorPicker
              value={mainMessageColor}
              onChange={(color) =>
                handleMainMessageColorChange(color.toHexString())
              }
              showText
              size="small"
              format="hex"
              placement="bottom"
              presets={[
                {
                  label: "Popular",
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
            <button
              onClick={closeAllColorPickers}
              className="mt-2 w-full text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ColorPickers;
