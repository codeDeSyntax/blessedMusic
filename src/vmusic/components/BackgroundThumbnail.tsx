import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/Provider/Theme";

interface BackgroundThumbnailProps {
  background: {
    name: string;
    src: string;
    category: string;
    isCustom?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
  rotation?: number;
  zIndex?: number;
  scale?: number;
  x?: number;
  y?: number;
}

const BackgroundThumbnail: React.FC<BackgroundThumbnailProps> = ({
  background,
  isSelected,
  onSelect,
  rotation = 0,
  zIndex = 1,
  scale = 1,
  x = 0,
  y = 0,
}) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale,
        x,
        y,
        rotate: rotation,
        zIndex: isSelected ? 10 : zIndex
      }}
      whileHover={{ 
        scale: scale * 1.1,
        zIndex: 10,
        transition: { duration: 0.2 }
      }}
      className="absolute"
      style={{
        transformOrigin: "center center",
        cursor: "pointer",
        width: "160px", // Slightly reduced from 180px to fit 5 in a row
        height: "200px" // Slightly reduced from 220px to maintain proportion
      }}
      onClick={onSelect}
    >
      {/* Polaroid-style card */}
      <div
        className={`
          relative w-full h-full 
          bg-white dark:bg-gray-800 
          shadow-lg rounded-sm 
          overflow-hidden
          transition-shadow
          ${isSelected ? 'ring-2 ring-purple-500' : ''}
          ${isDarkMode ? 'shadow-gray-900' : 'shadow-gray-300'}
        `}
      >
        {/* Image container */}
        <div className="w-full h-[140px] relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}
          
          <img
            src={background.src}
            alt={background.name}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(true);
            }}
            style={{
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease"
            }}
          />
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <span className="text-sm text-gray-500">Failed to load</span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="p-3 text-center">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {background.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {background.category}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BackgroundThumbnail; 