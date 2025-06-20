// components/CategorySelection.tsx

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Film, Presentation, Book } from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { useTheme } from "@/Provider/Theme";

type CategoryCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  count,
  icon,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-row items-center p-4 bg-white dark:bg-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-800"
    >
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center h-12 w-12 rounded-full shadow-md">
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-stone-400">
          {title}
        </h2>
        <div className="mt-1 inline-block px-2 py-0.5 bg-gray-100 dark:bg-bgray rounded-full">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {count}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Compact preview mockup component
const PreviewMockup: React.FC<{
  title: string;
  subtitle: string;
  type: "sermon" | "scripture";
}> = ({ title, subtitle, type }) => {
  const bgImage =
    type === "sermon" ? "url('./wood2.jpg)" : "url('./wood2.jpg')";

  const gradientOverlay =
    type === "sermon"
      ? "bg-gradient-to-t from-indigo-900/90 via-indigo-900/60 to-transparent"
      : "bg-gradient-to-t from-purple-900/90 via-purple-900/60 to-transparent";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative h-36 w-full rounded-xl overflow-hidden shadow-md group"
      style={{
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`absolute inset-0 ${gradientOverlay} transition-opacity duration-300`}
      ></div>
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="text-base font-bold mb-0.5">{title}</h3>
        <p className="text-xs opacity-90">{subtitle}</p>
      </div>

      {/* Label Badge */}
      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-xs text-white font-medium">
        {type === "sermon" ? "Sermon" : "Scripture"}
      </div>
    </motion.div>
  );
};

export const CategorySelection: React.FC<{
  onCategorySelect: (type: "sermon" | "other") => void;
}> = ({ onCategorySelect }) => {
  const { presentations } = usePresenterOperations();
  const { isDarkMode } = useTheme();

  const sermonCount = presentations.filter((p) => p.type === "sermon").length;
  const otherCount = presentations.filter((p) => p.type === "other").length;

  return (
    <div className="flex items-center justify-center h-screen b dark:bg-black">
      <div
        className={`w-full max-w-5xl mx-auto h-full md:h-auto bg-white dark:bg-ltgray rounded-3xl shadow-xl p-6 ${
          isDarkMode ? "dottedb1" : "dottedb"
        } relative overflow-hidden md:my- flex flex-col`}
      >
        {/* Corner backdrop effects */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 dark:from-indigo-600/20 dark:to-purple-700/20 rounded-full blur-xl"></div>
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-bl from-purple-400/30 to-indigo-500/30 dark:from-purple-600/20 dark:to-indigo-700/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-indigo-400/30 to-purple-500/30 dark:from-indigo-600/20 dark:to-purple-700/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-purple-400/30 to-indigo-500/30 dark:from-purple-600/20 dark:to-indigo-700/20 rounded-full blur-xl"></div>

        <div className="relative z-10 flex-1 flex flex-col">
          <h1 className="text-3xl font-bold text-center mt-2 mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Presentation Master
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-5">
            Select a category to continue
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            <CategoryCard
              title="Sermons"
              count={sermonCount}
              icon={<BookOpen size={20} strokeWidth={2} />}
              onClick={() => onCategorySelect("sermon")}
            />
            <CategoryCard
              title="Other"
              count={otherCount}
              icon={<Film size={20} strokeWidth={2} />}
              onClick={() => onCategorySelect("other")}
            />
          </div>

          <div className="mt-2 pt- border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Preview Templates
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Recent designs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PreviewMockup
                title="Faith Over Fear"
                subtitle="Sunday Service Series"
                type="sermon"
              />
              <PreviewMockup
                title="Faith Over Fear"
                subtitle="Sunday Service Series"
                type="sermon"
              />
              <PreviewMockup
                title="Rev 10:1"
                subtitle="For God so loved..."
                type="scripture"
              />
              <PreviewMockup
                title="Romans 8:1"
                subtitle="For God so loved..."
                type="scripture"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
