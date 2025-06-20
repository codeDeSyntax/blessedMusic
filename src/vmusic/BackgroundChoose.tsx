import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Palette,
  FolderUp,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import TitleBar from "../shared/TitleBar";
import { useTheme } from "@/Provider/Theme";
import BackgroundGrid from "./components/BackgroundGrid";

interface Background {
  name: string;
  src: string;
  category: string;
  isCustom?: boolean;
}

const PresentationBackgroundSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [localTheme] = useState(localStorage.getItem("bmusictheme") || "dark");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("vmusicimages") || ""
  );

  // Load backgrounds
  useEffect(() => {
    const loadBackgrounds = async () => {
      const defaultBackgrounds: Background[] = [
        { name: "Wood Pattern", src: "./wood2.jpg", category: "Nature" },
        { name: "Snow Scene", src: "./snow1.jpg", category: "Nature" },
        { name: "Wooden Texture", src: "./wood6.jpg", category: "Nature" },
        { name: "Pine Pattern", src: "./wood7.png", category: "Nature" },
        { name: "Mountain View", src: "./pic2.jpg", category: "Landscape" },
        { name: "Abstract Art", src: "./wood10.jpg", category: "Abstract" },
        { name: "Vintage Paper", src: "./wood11.jpg", category: "Texture" },
      ];

      // Load custom images if path exists
      if (customImagesPath) {
        try {
          const customImages = await window.api.getImages(customImagesPath);
          const customBackgrounds = customImages.map((src: string, index: number) => ({
            name: `Custom Image ${index + 1}`,
            src,
            category: "Custom",
            isCustom: true
          }));
          setBackgrounds([...defaultBackgrounds, ...customBackgrounds]);
        } catch (error) {
          console.error("Failed to load custom images:", error);
          setBackgrounds(defaultBackgrounds);
        }
      } else {
        setBackgrounds(defaultBackgrounds);
      }
    };

    loadBackgrounds();
  }, [customImagesPath]);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    checkMobile();
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectBackground = useCallback((background: Background) => {
    setSelectedBackground(background);
    localStorage.setItem("bmusicpresentationbg", background.src);
  }, []);

  const handleUploadBackground = useCallback(async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === 'string' && result) {
        setCustomImagesPath(result);
        localStorage.setItem("vmusicimages", result);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  }, []);

  // Get unique categories
  const categories = ["All", ...new Set(backgrounds.map(bg => bg.category))];

  // Filter backgrounds based on category
  const filteredBackgrounds = backgrounds.filter(bg => {
    const matchesCategory = selectedCategory === "All" || bg.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div 
      className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden"
      style={{ backgroundColor: localTheme === "creamy" ? "#faeed1" : "inherit" }}
    >
      <TitleBar />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 lg:p-6 space-y-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(setCurrentScreen("Songs"))}
              className="px-4 py-2 bg-[#4d3403] text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                // className="p-2 rounded-full bg-[#] text-white hover:bg-purple-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Palette className="w-6 h-6" />
                Presentation Backgrounds
              </h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUploadBackground}
              className="px-4 py-2 bg-[#4d3403] text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <FolderUp className="w-4 h-4" />
              <span>Upload</span>
            </motion.button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-[#4d3403] text-white shadow-lg shadow-[#4d3403]/20'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                {category}
              </motion.button>
            ))}
            {/* Custom images path display */}
          {customImagesPath && (
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
              Custom images from: {customImagesPath}
            </div>
          )}
          </div>

          
        </div>

        {/* Background Grid - Scrollable Container */}
        <div className="flex-1 w-[90%] mx-auto  overflow-y-auto no-scrollbar">
          <div className="h-full flex items-center justify-center">
            <BackgroundGrid
              backgrounds={filteredBackgrounds}
              selectedBackground={selectedBackground}
              onSelectBackground={handleSelectBackground}
            />
          </div>
        </div>

        {/* Selected Background Preview */}
        {selectedBackground && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-transparent p-4 shadow-lg border-t border-gray-200 dark:border-gray-700"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedBackground.src}
                  alt={selectedBackground.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {selectedBackground.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedBackground.category}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedBackground(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PresentationBackgroundSelector;
