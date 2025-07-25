// components/PresentationList.tsx

import React, { useState, useEffect } from "react";
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
  Layers,
  ExternalLink,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation as PresentationType } from "@/types";

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

const PresentationCard: React.FC<{
  presentation: PresentationType;
  onSelect: (presentation: PresentationType) => void;
  onEdit: (presentation: PresentationType) => void;
  onDelete: (id: string) => void;
  onPresent: (presentation: PresentationType) => void;
  onOpenFile: (presentation: PresentationType) => void;
}> = ({ presentation, onSelect, onEdit, onDelete, onPresent, onOpenFile }) => {
  // Fixed dark theme background
  const backgroundImage = "./wood10.jpg";

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
      className={`group flex flex-col rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 h-full bg-[#30261d] border border-gray-800`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14 1.652-1.1 2.782.14 3.68.14 1.074 0 2.14-.156 3.204-.156 1.23 0 2.46.156 3.7.156 1.326 0 2.4-.156 3.7-.156' stroke='%23555555' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundPosition: "bottom center",
        backgroundRepeat: "repeat-x",
      }}
    >
      {/* Receipt Header with Title and Type */}
      <div
        className="relative w-full cursor-pointer rounded-t-lg"
        onClick={() => onSelect(presentation)}
      >
        <div
          className="h-12 bg-center bg-cover rounded-lg"
          style={{
            backgroundImage: `url(${
              presentation.backgroundImage || backgroundImage
            })`,
            backgroundPosition: "center",
          }}
        ></div>

        {/* Receipt Title Bar */}
        <div className="absolute rounded-t-lg inset-x-0 top-0 h-12 bg-[#ecb129]/30 dark:bg-[#78716c]/30 backdrop-blur- flex items-center justify-between px-4">
          <h3 className="font-bitter text-gray-50 text-[12px] font-medium truncate max-w-[80%]">
            {presentation.title}
          </h3>

          {/* Type Badge */}
          <div className="bg-yellow-100 dark:bg-stone-600 text-black dark:text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <BookOpen size={12} className="mr-1" />
            <span>Sermon</span>
          </div>
        </div>

        {/* Scalloped Edge */}
        <div className="flex justify-between px-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#9a674a]/10 dark:bg-gray-800 -mt-1"
            />
          ))}
        </div>
      </div>

      {/* Receipt Content */}
      <div className="flex flex-col p-2 flex-grow">
        {/* Receipt Details */}
        <div className="space-y-3 mb-4">
          {/* Date and Time - Receipt Style */}
          <div className="flex justify-between text-xs text-gray-400 border-b border-dashed border-gray-700 pb-2 px-1">
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
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-dashed border-gray-700 pb-2 px-1">
              <div className="flex items-center">
                <User size={12} className="mr-1" />
                <span>Preacher:</span>
              </div>
              <div className="font-medium text-gray-300 flex items-center">
                <div
                  className={`w-5 h-5 rounded-full bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] flex items-center justify-center text-[#faeed1] text-xs font-bold mr-1`}
                  style={{
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: "#800080",
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
          {/* <div className="flex items-center justify-between text-xs text-[#9a674a] dark:text-gray-400 border-b border-dashed border-[#9a674a]/30 dark:border-gray-700 pb-2 px-1">
            <div className="flex items-center">
              <FileText size={12} className="mr-1" />
              <span>SermonID #:</span>
            </div>
            <span className="font-mono">
              {presentation.id.slice(0, 8).toUpperCase()}
            </span>
          </div> */}

          {/* Background Image Preview */}
          {presentation.backgroundImage && (
            <div className="flex items-center justify-between text-xs text-[#9a674a] dark:text-gray-400 border-b border-dashed border-[#9a674a]/30 dark:border-gray-700  px-1 py-1">
              <div className="flex items-center">
                <Film size={12} className="mr-1" />
                <span>Background:</span>
              </div>
              <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-[#9a674a]/30 dark:border-gray-700">
                <img
                  src={presentation.backgroundImage}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Receipt Footer with Actions */}
        <div className="mt-auto pt-3 border-t border-[#9a674a]/30 dark:border-gray-700">
          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(presentation);
              }}
              className={`flex items-center justify-center h-10 w-10 rounded-full bg-transparent dark:text-white text-[#9a674a] dark:text-${
                presentation.type === "sermon" ? "indigo" : "purple"
              }-400 hover:bg-[#9a674a]/20 dark:hover:bg-stone-700 transition-colors`}
              title="Edit presentation"
            >
              <Pencil size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenFile(presentation);
              }}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-transparent text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              title="Open file in notepad"
            >
              <ExternalLink size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onPresent(presentation);
              }}
              className={`flex items-center justify-center h-10 w-10 rounded-full bg-transparent dark:text-[#faeed1] text-black shadow-md hover:shadow-lg transition-all duration-300`}
              title="Start presentation"
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
              className="flex items-center justify-center h-10 w-10 rounded-full bg-transparent text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              title="Delete presentation"
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
                } bg-[#9a674a]/30 dark:bg-[#353433]/30`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PresentationList: React.FC<{
  type: "sermon";
  onBack: () => void;
  onSelect: (presentation: PresentationType) => void;
  onEdit: (presentation: PresentationType) => void;
  onNew: () => void;
  onPresent: (presentation: PresentationType) => void;
  onCategoryChange: (category: "sermon") => void;
}> = ({
  type,
  onBack,
  onSelect,
  onEdit,
  onNew,
  onPresent,
  onCategoryChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    presentations,
    loadPresentations,
    removePresentation,
    isLoading,
    error,
  } = usePresenterOperations();

  // Local state for path management
  const [selectedPath, setSelectedPath] = useState(
    localStorage.getItem("evpresenterfilespath") || ""
  );

  // Load presentations when path changes or on mount
  useEffect(() => {
    if (selectedPath) {
      loadPresentations();
    }
  }, [selectedPath, loadPresentations]);

  // Create a sorted copy of presentations
  const sortedPresentations = [...presentations].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filteredPresentations = sortedPresentations
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
      try {
        await removePresentation(id);
      } catch (error) {
        console.error("Failed to delete presentation:", error);
      }
    }
  };

  //function choose path an set it to local storage
  const selectEvpd = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSelectedPath(path);
      if (path) {
        localStorage.setItem("evpresenterfilespath", path);
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

  const handleOpenFile = async (presentation: PresentationType) => {
    try {
      const selectedPath = localStorage.getItem("evpresenterfilespath") || "";
      if (!selectedPath) {
        alert("No file path is configured. Please select a directory first.");
        return;
      }

      // Match the server-side filename construction exactly
      // Remove invalid filename characters, replace spaces with underscores, convert to lowercase
      const sanitizedTitle = presentation.title
        .replace(/[/\\?%*:|"<>]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .substring(0, 50); // Truncate to match server logic

      const fileName = `${sanitizedTitle}_${presentation.id}.txt`;

      // Use the proper path construction API
      const pathResult = await window.api.constructFilePath(
        selectedPath,
        fileName
      );
      if (!pathResult.success || !pathResult.path) {
        alert(`Failed to construct file path: ${pathResult.error}`);
        return;
      }

      const result = await window.api.openFileInDefaultApp(pathResult.path);

      if (!result.success) {
        console.error("Failed to open file:", result.error);
        alert(`Failed to open file: ${result.error}`);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open the file. Please make sure the file exists.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#30261d] px-4 py-6 ">
      <div
        className={`w-full max-w-6xl mx-auto rounded-3xl bg-[#30261d]/70 shadow-xl p-6  relative overflow-y-scroll no-scrollbar backdrop-blur-sm h-full border border-gray-800`}
      >
        {/* Corner backdrop effects for magical feel */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#8b5a3c]/20 to-[#8b5a3c]/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-60 h-60 bg-gradient-to-bl from-[#8b5a3c]/20 to-[#8b5a3c]/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-gradient-to-tr from-[#8b5a3c]/20 to-[#8b5a3c]/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl flex items-center justify-cen font-bold bg-gradient-to-r from-[#8b5a3c] to-purple-600 bg-clip-text text-transparent">
                <span>Sermons</span>
                {selectedPath ? (
                  <span className="text-sm text-[#9a674a]/70 dark:text-gray-400 ml-2">
                    {selectedPath}
                  </span>
                ) : (
                  <button
                    onClick={selectEvpd}
                    className="text-sm text-[#9a674a]/70 dark:text-gray-400 ml-2"
                  >
                    Choose path
                  </button>
                )}
                <FolderEdit
                  className="text-[#c77c5d] dark:text-yellow-500 h-4 w-4 pl-4 animate-pulse cursor-pointer"
                  onClick={selectEvpd}
                />
              </h1>
              <p className="text-sm text-[#9a674a]/70 dark:text-gray-400">
                {filteredPresentations.length}{" "}
                {filteredPresentations.length === 1 ? "item" : "items"} found
              </p>
            </div>

            {/* Search and Controls */}
            <div className="flex w-full md:w-auto gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search
                    size={18}
                    className="text-[#9a674a]/50 dark:text-gray-500"
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sermons..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-[#9a674a]/10 dark:bg-stone-800/50 text-[#9a674a] dark:text-gray-100 placeholder-[#9a674a]/50 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9a674a]/30 dark:focus:ring-primary/50 transition-all"
                />
              </div>

              {/* New Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClickNew}
                className="px-4 py-2 bg-[#9a674a] dark:bg-stone-800 text-[#faeed1] text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap flex items-center gap-2"
              >
                <PresentationIcon size={18} />
                <span>
                  New{" "}
                  {type === "sermon"
                    ? "Sermon"
                    : type === "custom"
                    ? "Custom Slides"
                    : "Presentation"}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#9a674a] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#9a674a] dark:text-gray-400">
                  Loading presentations...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-red-500 dark:text-red-400 text-center">
                <p className="text-lg font-medium">
                  Failed to load presentations
                </p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredPresentations.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 text-[#9a674a] dark:text-gray-400 p-10">
              {searchQuery ? (
                <>
                  <p>No presentations matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 px-3 py-1.5 bg-[#9a674a]/10 dark:bg-gray-800 text-sm rounded-lg hover:bg-[#9a674a]/20 dark:hover:bg-gray-700 transition-colors"
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
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] text-[#faeed1] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Create your first{" "}
                    {type === "sermon"
                      ? "sermon"
                      : type === "custom"
                      ? "custom presentation"
                      : "presentation"}
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* Presentations Grid */}
          {!isLoading && !error && filteredPresentations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto overflow-x-hidden no-scrollbar pb-4 h-full">
              {filteredPresentations.map((presentation) => (
                <PresentationCard
                  key={presentation.id}
                  presentation={presentation}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onPresent={onPresent}
                  onOpenFile={handleOpenFile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationList;
