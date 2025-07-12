import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Palette, FolderUp, RefreshCw, Monitor } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import TitleBar from "../shared/TitleBar";
import { useTheme } from "@/Provider/Theme";
import BackgroundGrid from "./components/BackgroundGrid";

// Optimized skeleton loader with fewer items for faster rendering
const SkeletonLoader = React.memo(() => {
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i); // Reduced from 12 to 8

  return (
    <div className="relative p-8 w-fit mx-auto">
      <div className="relative grid grid-cols-4 gap-4">
        {" "}
        {/* Changed to 4 columns for faster rendering */}
        {skeletonItems.map((index) => (
          <div
            key={index}
            className="relative bg-white dark:bg-gray-800 shadow-lg rounded-sm overflow-hidden"
            style={{
              width: "160px",
              height: "200px",
              transform: `rotate(${((index % 4) - 2) * 2}deg)`, // Reduced rotation for smoother animation
            }}
          >
            {/* Image skeleton */}
            <div className="w-full h-[140px] bg-gray-200 dark:bg-gray-700 animate-pulse" />

            {/* Text skeleton */}
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

interface Background {
  name: string;
  src: string;
  category: string;
  isCustom?: boolean;
}

const PresentationBackgroundSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localTheme] = useState(localStorage.getItem("bmusictheme") || "dark");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("vmusicImageDirectory") || ""
  );

  // Cache for loaded images to prevent re-downloading
  const imageCache = useRef(new Map<string, boolean>());
  const abortController = useRef<AbortController | null>(null);

  // Memoized default backgrounds - these won't change
  const defaultBackgrounds = useMemo<Background[]>(
    () => [
      { name: "Wood Pattern", src: "./wood2.jpg", category: "Nature" },
      { name: "Snow Scene", src: "./snow1.jpg", category: "Nature" },
      { name: "Wooden Texture", src: "./wood6.jpg", category: "Nature" },
      { name: "Pine Pattern", src: "./wood7.png", category: "Nature" },
      { name: "Mountain View", src: "./pic2.jpg", category: "Landscape" },
      { name: "Abstract Art", src: "./wood10.jpg", category: "Abstract" },
      { name: "Vintage Paper", src: "./wood11.jpg", category: "Texture" },
    ],
    []
  );

  // Preload critical images for faster display
  const preloadImage = useCallback((src: string): Promise<void> => {
    if (imageCache.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(src, true);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Optimized background loading with better error handling and caching
  const loadBackgrounds = useCallback(async () => {
    // Cancel any existing loading operation
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsLoadingImages(true);

    try {
      // Start with default backgrounds immediately
      setBackgrounds(defaultBackgrounds);

      // Preload default background images in parallel (non-blocking)
      const preloadPromises = defaultBackgrounds.map((bg) =>
        preloadImage(bg.src).catch((err) => {
          console.warn(`Failed to preload ${bg.src}:`, err);
        })
      );

      // Load custom images if path exists
      if (customImagesPath) {
        try {
          console.log(
            "🔍 BackgroundChoose: Loading custom images from:",
            customImagesPath
          );
          const customImages = await window.api.getImages(customImagesPath);
          console.log(
            "🔍 BackgroundChoose: Received custom images:",
            customImages
          );

          if (abortController.current?.signal.aborted) return;

          // Process all custom images at once to avoid multiple re-renders
          const customBackgrounds = customImages.map(
            (src: string, index: number) => {
              if (index < 5) {
                // Only log a few to avoid console spam
                console.log(
                  `🔍 BackgroundChoose: Custom image ${index + 1}:`,
                  src
                );
              }
              return {
                name: `Custom Image ${index + 1}`,
                src,
                category: "Custom",
                isCustom: true,
              };
            }
          );

          console.log(
            `✅ BackgroundChoose: Loaded ${customBackgrounds.length} custom images`
          );

          // Single state update with all backgrounds
          setBackgrounds([...defaultBackgrounds, ...customBackgrounds]);
        } catch (error) {
          console.error("Failed to load custom images:", error);
          // Keep default backgrounds even if custom loading fails
        }
      } else {
        console.log(
          "🔍 BackgroundChoose: No custom images path set, using default backgrounds only"
        );
      }

      // Wait for default image preloading to complete (non-blocking)
      Promise.allSettled(preloadPromises).then(() => {
        console.log("✅ BackgroundChoose: Default backgrounds preloaded");
      });
    } catch (error) {
      console.error("Error in loadBackgrounds:", error);
    } finally {
      setIsLoadingImages(false);
    }
  }, [customImagesPath, defaultBackgrounds, preloadImage]);

  // Load backgrounds with dependency optimization
  useEffect(() => {
    loadBackgrounds();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [loadBackgrounds]);

  // Handle window resize with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };

    window.addEventListener("resize", checkMobile);
    checkMobile();
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Optimized background selection handler
  const handleSelectBackground = useCallback((background: Background) => {
    setSelectedBackground(background);
    console.log(
      "💾 BackgroundChoose: Saving background to localStorage:",
      background.src
    );
    console.log("💾 BackgroundChoose: Background name:", background.name);
    console.log(
      "💾 BackgroundChoose: Background category:",
      background.category
    );
    console.log("💾 BackgroundChoose: Is custom:", background.isCustom);
    localStorage.setItem("bmusicpresentationbg", background.src);

    // Verify it was saved correctly
    const savedValue = localStorage.getItem("bmusicpresentationbg");
    console.log("✅ BackgroundChoose: Verified saved value:", savedValue);

    // Trigger storage event manually for same-window updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "bmusicpresentationbg",
        oldValue: null,
        newValue: background.src,
        storageArea: localStorage,
      })
    );
    console.log("📢 BackgroundChoose: Dispatched storage event");
  }, []);

  // Optimized directory upload handler
  const handleUploadBackground = useCallback(async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === "string" && result) {
        setCustomImagesPath(result);
        localStorage.setItem("vmusicImageDirectory", result);
        // The useEffect will handle reloading with the loading state
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  }, []);

  // Helper function to project current background
  const projectBackground = useCallback(() => {
    if (selectedBackground) {
      // Create a demo song with the selected background
      const demoSong = {
        title: "Background Preview",
        content: `
          Verse 1
          This is a preview of the selected background.
          Chorus
          Enjoy the beauty of this background in your presentation.

        `,
        id: `background-preview-${Date.now()}`,
        path: "",
        dateModified: new Date().toISOString(),
        categories: [],
        background: selectedBackground.src,
      };

      // Use React-based projection
      window.api.projectSong(demoSong);

      window.api.onDisplaySong((songData) => {
        console.log(
          `Displaying background preview: ${selectedBackground.name}`
        );
      });
    }
  }, [selectedBackground]);

  // Memoized categories calculation for better performance
  const categories = useMemo(() => {
    const uniqueCategories = new Set(backgrounds.map((bg) => bg.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [backgrounds]);

  // Memoized filtered backgrounds with improved stability for fewer re-renders
  const filteredBackgrounds = useMemo(() => {
    if (selectedCategory === "All") {
      // Apply stable sorting to prevent unnecessary re-renders
      return [...backgrounds].sort((a, b) => {
        // Sort by category then by name for stable ordering
        if (a.category !== b.category)
          return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      });
    }
    return backgrounds.filter((bg) => bg.category === selectedCategory);
  }, [backgrounds, selectedCategory]);

  return (
    <div
      className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden"
      style={{
        backgroundColor: localTheme === "creamy" ? "#faeed1" : "inherit",
      }}
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
                className="px-4 py-2 bg-[#4d3403] text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
                // className="p-2 rounded-full bg-[#] text-white hover:bg-purple-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Palette className="w-6 h-6" />
                Presentation Backgrounds
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUploadBackground}
                className="px-4 py-2 bg-[#4d3403] text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <FolderUp className="w-4 h-4" />
                <span>Upload</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={projectBackground}
                disabled={!selectedBackground}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedBackground
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Present</span>
              </motion.button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${
                    selectedCategory === category
                      ? "bg-[#4d3403] text-white shadow-lg shadow-[#4d3403]/20"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
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
        <div className="flex-1 w-[90%] mx-auto overflow-y-auto no-scrollbar">
          <div className="h-full flex items-center justify-center">
            {isLoadingImages ? (
              <SkeletonLoader />
            ) : (
              <BackgroundGrid
                backgrounds={filteredBackgrounds}
                selectedBackground={selectedBackground}
                onSelectBackground={handleSelectBackground}
              />
            )}
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
