// components/PresentationList.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Film,
  Pencil,
  Trash2,
  Presentation as PresentationIcon,
  ChevronRight,
  Search,
  Calendar,
  User,
  FileText,
  Clock,
  FolderEdit,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation as PresentationType } from "@/types";
import { useTheme } from "@/Provider/Theme";
import { on } from "node:events";

// Set of background images we'll use randomly for the cards
const backgroundImages = [
  "./wood2.jpg",
  "./pic2.jpg",
  "./wood7.png",
  "./wood6.jpg",
  "./snow1.jpg",
  "./pic2.jpg",
];

// Function to get a consistent image for the same presentation
const getBackgroundImage = (id: string) => {
  // Use the presentation ID as a seed to consistently pick an image
  const index = id.charCodeAt(0) % backgroundImages.length;
  return backgroundImages[index];
};

type PresentationCardProps = {
  presentation: PresentationType;
  onSelect: (presentation: PresentationType) => void;
  onEdit: (presentation: PresentationType) => void;
  onDelete: (id: string) => void;
  onPresent: (presentation: PresentationType) => void;
};

const PresentationCard: React.FC<PresentationCardProps> = ({
  presentation,
  onSelect,
  onEdit,
  onDelete,
  onPresent,
}) => {
  // Determine accent colors based on presentation type
  const accentColor = presentation.type === "sermon" ? "indigo" : "purple";
  const { isDarkMode } = useTheme();
  const backgroundImage = isDarkMode ? "./wood10.jpg" : "./wood11.jpg";

  // Format date nicely
  const formattedDate = new Date(presentation.updatedAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const formattedTime = new Date(presentation.updatedAt).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col rounded-lg  shadow-lg hover:shadow-xl dark:shadow-${accentColor}-500/10 dark:hover:shadow-${accentColor}-500/20 transition-all duration-500 h-full bg-white dark:bg-ltgray border border-gray-100 dark:border-gray-800`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14 1.652-1.1 2.782.14 3.68.14 1.074 0 2.14-.156 3.204-.156 1.23 0 2.46.156 3.7.156 1.326 0 2.4-.156 3.7-.156' stroke='%23${
          isDarkMode ? "555555" : "000000"
        }' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundPosition: "bottom center",
        backgroundRepeat: "repeat-x",
      }}
    >
      {/* Receipt Header with Title and Type */}
      <div
        className="relative w-full cursor-pointer"
        onClick={() => onSelect(presentation)}
      >
        <div
          className="h-12 bg-center bg-cover rounded-t-lg"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "center",
          }}
        ></div>

        {/* Receipt Title Bar */}
        <div className="absolute inset-x-0 top-0 h-12 bg-purple/30 backdrop-blur- flex items-center justify-between px-4">
          <h3 className="font-bitter text-stone-500 dark:text-gray-50  text-[12px] font-medium truncate max-w-[80%]">
            {presentation.title}
          </h3>

          {/* Type Badge */}
          <div
            className={`bg-${accentColor}-500 dark:bg-${accentColor}-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center`}
          >
            {presentation.type === "sermon" ? (
              <>
                <BookOpen size={12} className="mr-1" />
                <span>Sermon</span>
              </>
            ) : (
              <>
                <Film size={12} className="mr-1" />
                <span>Other</span>
              </>
            )}
          </div>
        </div>

        {/* Scalloped Edge */}
        <div className="flex justify-between px-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800 -mt-1"
            />
          ))}
        </div>
      </div>

      {/* Receipt Content */}
      <div className="flex flex-col p-4 flex-grow">
        {/* Receipt Details */}
        <div className="space-y-3 mb-4">
          {/* Date and Time - Receipt Style */}
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Preacher Info */}
          {presentation.type === "sermon" && (
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center">
                <User size={12} className="mr-1" />
                <span>Preacher:</span>
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-300 flex items-center">
                <div
                  className={`w-5 h-5 rounded-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 flex items-center justify-center text-white text-xs font-bold mr-1`}
                  style={{
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: isDarkMode ? "#800080" : "black",
                  }}
                >
                  {((presentation as any).preacher || "")
                    .charAt(0)
                    .toUpperCase()}
                  {((presentation as any).preacher || "")?.split(" ")[1]?.[0]}
                </div>
                <span>{(presentation as any).preacher}</span>
              </div>
            </div>
          )}

          {/* Presentation ID - Receipt Number */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
            <div className="flex items-center">
              <FileText size={12} className="mr-1" />
              <span>SermonID #:</span>
            </div>
            <span className="font-mono">
              {presentation.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Receipt Footer with Actions */}
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(presentation);
              }}
              className={`flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-bgray dark:text-white text-${accentColor}-500 dark:text-${accentColor}-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <Pencil size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onPresent(presentation);
              }}
              className={`flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 text-white shadow-md hover:shadow-lg transition-all duration-300`}
            >
              <PresentationIcon size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(presentation.id);
              }}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>

          {/* Barcode-like element at bottom */}
          <div className="mt-4 h-6 flex justify-between">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 ${
                  i % 3 === 0 ? "h-full" : "h-2/3"
                } bg-gray-300 dark:bg-gray-600`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PresentationList: React.FC<{
  type: "sermon" | "other";
  onBack: () => void;
  onSelect: (presentation: PresentationType) => void;
  onEdit: (presentation: PresentationType) => void;
  onNew: () => void;
  onPresent: (presentation: PresentationType) => void;
}> = ({ type, onBack, onSelect, onEdit, onNew, onPresent }) => {
  const {
    presentations,
    startPresentation,
  } = usePresenterOperations();

  // Local state for path management
  const [selectedPath, setSelectedPath] = useState(
    localStorage.getItem("evpresenterfilespath") || ""
  );
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  //arrange filtered presentation by date
  presentations.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  const filteredPresentations = presentations
    .filter((p) => p.type === type)
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.type === "sermon" &&
          (p as any).preacher
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      console.log("Delete presentation:", id); // TODO: Implement delete functionality
    }
  };

  const handlePresent = (presentation: PresentationType) => {
    onPresent(presentation);
    startPresentation();
  };

  //function choose path an set it to local storage
  const selectEvpd = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSelectedPath(path);
      if (path) {
        if (path) {
          localStorage.setItem("evpresenterfilespath", path);
        }
      }
    } else {
      console.error("Invalid path selected");
    }
  };

  const onClickNew = async () => {
    if (!selectedPath) {
      alert("Please select a path first to save presentations.");
      return;
    }
    onNew();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black px-4 py-6">
      <div
        className={`w-full max-w-6xl mx-auto rounded-3xl dark:bg-bgray/60 bg-gray-200 shadow-xl p-6 relative overflow-hidden backdrop-blur-sm h-full`}
      >
        {/* Corner backdrop effects for magical feel */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 dark:from-indigo-600/20 dark:to-purple-700/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/30 to-indigo-500/30 dark:from-purple-600/20 dark:to-indigo-700/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-gradient-to-tr from-indigo-400/30 to-purple-500/30 dark:from-indigo-600/20 dark:to-purple-700/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl flex items-center justify-cen font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <span>
                  {type === "sermon" ? "Sermons" : "Other Presentations"}
                </span>
                {/* if selected path show path, else button to choose path */}
                {selectedPath ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {selectedPath}
                  </span>
                ) : (
                  <button
                    onClick={selectEvpd}
                    className="text-sm text-gray-500 dark:text-gray-400 ml-2"
                  >
                    Choose path
                  </button>
                )}
                <FolderEdit className="text-yellow-500 h-4 w-4 pl-4 animate-pulse cursor-pointer"  onClick={selectEvpd}/>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredPresentations.length}{" "}
                {filteredPresentations.length === 1 ? "item" : "items"} found
              </p>
            </div>

            <div className="flex w-full md:w-auto gap-3">
              {/* Search bar */}
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search presentations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-bgray/50 text-gray-800 dark:text-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 border-none shadow-inner"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClickNew}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                New {type === "sermon" ? "Sermon" : "Presentation"}
              </motion.button>
            </div>
          </div>

          {filteredPresentations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 dark:text-gray-400 p-10">
              {searchQuery ? (
                <>
                  <p>No presentations matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p>No presentations found</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClickNew}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Create your first{" "}
                    {type === "sermon" ? "sermon" : "presentation"}
                  </motion.button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto no-scrollbar pb-4 h-full">
              {filteredPresentations.map((presentation) => (
                <PresentationCard
                  key={presentation.id}
                  presentation={presentation}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onPresent={handlePresent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
