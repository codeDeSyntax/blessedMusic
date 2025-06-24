import React, { useState, useRef, useEffect } from "react";
import { X, Moon, Sun, ChevronDown, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature, setTheme, setFontSize, setFontWeight, setFontFamily, setVerseTextColor } from "@/store/slices/bibleSlice";
import { CustomSelect } from "@/shared/Selector";

const SettingsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.bible.theme);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);

  const fontOptions = [
    { value: "'Times New Roman', Times, serif", text: "Times New Roman" },
    { value: "'Arial', sans-serif", text: "Arial" },
    { value: "'Helvetica', sans-serif", text: "Helvetica" },
    { value: "'Courier New', Courier, monospace", text: "Courier New" },
    { value: "'Verdana', sans-serif", text: "Verdana" },
    { value: "'Impact', Charcoal, sans-serif", text: "Impact" },
    { value: "'Georgia', serif", text: "Georgia" },
    { value: "'Monospace', monospace", text: "Monospace" },
    { value: "serif", text: "Serif" },
    { value: "sans-serif", text: "Sans-serif" },
    { value: "Palatino", text: "Palatino" },
    { value: "Garamond", text: "Garamond" },
    { value: "Bookman", text: "Bookman" },
    { value: "Comic Sans MS", text: "Comic Sans MS" },
    { value: "Trebuchet MS", text: "Trebuchet MS" },
    { value: "Arial Black", text: "Arial Black" },
    { value: "cursive", text: "cursive" },
  ];

  const fontSizeOptions = [
    { value: "small", text: "Small" },
    { value: "medium", text: "Medium" },
    { value: "large", text: "Large" },
    { value: "xl", text: "Extra Large" },
    { value: "2xl", text: "XX-Large" },
  ];

  const fontWeightOptions = [
    { value: "normal", text: "Normal" },
    { value: "bold", text: "Bold" },
    { value: "bolder", text: "Bolder" },
    { value: "lighter", text: "Lighter" },
  ];

  return (
    <div
      className="h-full p-4 bg-gray-50 dark:bg-ltgray font-serif border-none overflow-hidden"
      style={{
        borderRightWidth: 1,
        borderRightColor: theme === "dark" ? "#202020" : "#20202020",
        borderRightStyle: "dashed",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-lg font-semibold text-gray-900 dark:text-white"
          style={{ fontWeight: "bolder", fontFamily: fontFamily }}
        >
          Settings
        </h2>
        <button
          onClick={() => dispatch(setActiveFeature(null))}
          className="p-1 hover:bg-gray-100 hover:cursor-pointer bg-gray-50 shadow dark:bg-bgray dark:hover:bg-bgray rounded"
        >
          <X size={20} className="text-gray-900 dark:text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Theme Setting */}
        <div>
          <h3
            className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            style={{ fontWeight: "bolder", fontFamily: fontFamily }}
          >
            Theme
          </h3>
          {/* <div className="flex space-x-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-2 hover:cursor-pointer px-4 rounded-md flex items-center justify-center ${
                theme === "light"
                  ? "bg-gray-50 dark:bg-bgray focus:outline-none text-stone-500 dark:text-gray-500 border-1 border-stone-500"
                  : "bg-gray-100 dark:bg-bgray shadow-black text-stone-500 dark:text-gray-50 focus:outline-none hover:bg-gray-200 dark:hover:bg-ltgray"
              }`}
            >
              <Sun size={18} className="mr-2" />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-2 px-4 rounded-md flex items-center hover:cursor-pointer justify-center ${
                theme === "dark"
                  ? "bg-gray-50 dark:bg-bgray text-stone-500 dark:text-gray-500 border-1 border-stone-500 focus:outline-none"
                  : "bg-gray-100 dark:bg-gray-800 focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 shadow"
              }`}
            >
              <Moon size={18} className="mr-2" />
              Dark
            </button>
          </div> */}
        </div>

        {/* Font Size Setting */}
        <div>
          <h3
            className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            style={{ fontWeight: "bolder", fontFamily: fontFamily }}
          >
            Font Size
          </h3>
          <CustomSelect
            options={fontSizeOptions}
            value={fontSize}
            onChange={(value) => dispatch(setFontSize(value))}
          />
        </div>

        {/* Font Family Setting */}
        <div>
          <h3
            className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            style={{ fontWeight: "bolder", fontFamily: fontFamily }}
          >
            Font Family
          </h3>
          <CustomSelect
            options={fontOptions}
            value={fontFamily}
            onChange={(value) => dispatch(setFontFamily(value))}
          />
        </div>

        {/* Text Color Setting */}
        <div>
          <h3
            className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            style={{ fontWeight: "bolder", fontFamily: fontFamily }}
          >
            Text Color
          </h3>
          <div className="flex items-center">
            <input
              type="color"
              value={verseTextColor}
              onChange={(e) => dispatch(setVerseTextColor(e.target.value))}
              className="w-8 h-8 focus:outline-none rounded mr-2 cursor-pointer bg-gray-50 dark:bg-bgray"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {verseTextColor}
            </span>
          </div>
        </div>

        {/* font weight setting */}
        <h3
          className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          style={{ fontWeight: "bolder", fontFamily: fontFamily }}
        >
          Font Weight
        </h3>
        <CustomSelect
          options={fontWeightOptions}
          value={fontWeight}
          onChange={(value) => dispatch(setFontWeight(value))}
        />

        {/* About Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3
            className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            style={{ fontWeight: fontWeight }}
          >
            𝓐𝓫𝓸𝓾𝓽
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bible 300 - Version 1.0.0
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A simple Bible app with multiple translations and customizable
            reading experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
