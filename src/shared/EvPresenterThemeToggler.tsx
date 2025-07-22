// components/EvPresenterThemeToggle.tsx

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEvPresenterTheme } from "@/Provider/EvPresenterTheme";

export const EvPresenterThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useEvPresenterTheme();

  return (
    <div
      onClick={toggleDarkMode}
      className="w-6 h-6 rounded-full flex items-center justify-center group cursor-pointer  hover:bg-gray-50 dark:hover:bg-bgray"
    >
      {isDarkMode ? (
        <Sun
          size={20}
          className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"
        />
      ) : (
        <Moon
          size={20}
          className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"
        />
      )}
    </div>
  );
};
