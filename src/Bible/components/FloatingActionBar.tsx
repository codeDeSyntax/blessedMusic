import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveFeature } from "@/store/slices/bibleSlice";
import {
  BookOpen,
  ChevronDown,
  Grid3X3,
  AlignLeft,
  Bookmark,
  History,
  Search,
  Library,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Keyboard,
} from "lucide-react";
import { ViewMode } from "../ScriptureContent";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from "framer-motion";
import ShortcutsModal from "./ShortcutsModal";

interface FloatingActionBarProps {
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  selectedVerse: number | null;
  chapterCount: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isBookDropdownOpen: boolean;
  setIsBookDropdownOpen: (open: boolean) => void;
  isChapterDropdownOpen: boolean;
  setIsChapterDropdownOpen: (open: boolean) => void;
  isVerseDropdownOpen: boolean;
  setIsVerseDropdownOpen: (open: boolean) => void;
  handleBookSelect: (book: string) => void;
  handleChapterSelect: (chapter: number) => void;
  handleVerseSelect: (verse: number) => void;
  getChapters: () => number[];
  getVerses: () => number[];
  bookList: any[];
  isDarkMode: boolean;
  handlePreviousChapter: () => void;
  handleNextChapter: () => void;
  hideLayoutButtons?: boolean;
  isVerseByVerseView?: boolean;
  hasBackgroundImage?: boolean;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  selectedVerse,
  chapterCount,
  viewMode,
  setViewMode,
  isBookDropdownOpen,
  setIsBookDropdownOpen,
  isChapterDropdownOpen,
  setIsChapterDropdownOpen,
  isVerseDropdownOpen,
  setIsVerseDropdownOpen,
  handleBookSelect,
  handleChapterSelect,
  handleVerseSelect,
  getChapters,
  getVerses,
  bookList,
  isDarkMode,
  handlePreviousChapter,
  handleNextChapter,
  hideLayoutButtons = false,
  isVerseByVerseView = false,
  hasBackgroundImage = false,
}) => {
  const { toggleActiveFeature } = useTheme();
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const [isVisible, setIsVisible] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [filteredOldTestament, setFilteredOldTestament] = useState(
    bookList?.filter((book) => book.testament === "old") || []
  );
  const [filteredNewTestament, setFilteredNewTestament] = useState(
    bookList?.filter((book) => book.testament === "new") || []
  );

  // Refs for click-outside handling
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);
  const verseDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only show when mouse is below title bar area
      if (e.clientY > 48 && e.clientY < 160) {
        setIsVisible(true);
      } else if (
        e.clientY > 200 &&
        !isBookDropdownOpen &&
        !isChapterDropdownOpen &&
        !isVerseDropdownOpen
      ) {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  useEffect(() => {
    const query = bookSearchQuery.toLowerCase();
    setFilteredOldTestament(
      bookList
        ?.filter((book) => book.testament === "old")
        .filter((book) => book.name.toLowerCase().includes(query)) || []
    );
    setFilteredNewTestament(
      bookList
        ?.filter((book) => book.testament === "new")
        .filter((book) => book.name.toLowerCase().includes(query)) || []
    );
  }, [bookSearchQuery, bookList]);

  // Click-outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside book dropdown
      if (
        isBookDropdownOpen &&
        bookDropdownRef.current &&
        !bookDropdownRef.current.contains(target)
      ) {
        setIsBookDropdownOpen(false);
      }

      // Check if click is outside chapter dropdown
      if (
        isChapterDropdownOpen &&
        chapterDropdownRef.current &&
        !chapterDropdownRef.current.contains(target)
      ) {
        setIsChapterDropdownOpen(false);
      }

      // Check if click is outside verse dropdown
      if (
        isVerseDropdownOpen &&
        verseDropdownRef.current &&
        !verseDropdownRef.current.contains(target)
      ) {
        setIsVerseDropdownOpen(false);
      }
    };

    if (isBookDropdownOpen || isChapterDropdownOpen || isVerseDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  // Focus search input when book dropdown opens
  useEffect(() => {
    if (isBookDropdownOpen && searchInputRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    // Clear search when dropdown closes
    if (!isBookDropdownOpen) {
      setBookSearchQuery("");
    }
  }, [isBookDropdownOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isBookDropdownOpen) {
      if (e.key === "Escape") {
        setIsBookDropdownOpen(false);
        setBookSearchQuery("");
      } else if (e.key === "Tab") {
        e.preventDefault();
        // Focus the search input if not already focused
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          searchInputRef.current.focus();
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBookDropdownOpen]);

  const oldTestamentBooks =
    bookList?.filter((book) => book.testament === "old") || [];
  const newTestamentBooks =
    bookList?.filter((book) => book.testament === "new") || [];

  const toggleFeature = (feature: string) => {
    dispatch(setActiveFeature(activeFeature === feature ? null : feature));
  };

  // Wrapper function for book selection that closes dropdown
  const handleBookSelectAndClose = (bookName: string) => {
    handleBookSelect(bookName);
    setIsBookDropdownOpen(false);
    setBookSearchQuery("");
  };

  const barVariants = {
    hidden: {
      y: -20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={barVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-center gap-4 px-6 py-3 rounded-full ${
              isVerseByVerseView && hasBackgroundImage
                ? "bg-white/10 dark:bg-black/10 backdrop-blur-md backdrop-saturate-150"
                : "bg-[#f9fafb] dark:bg-[#30261d] bg-opacity-5 backdrop-blur-sm bg-f9fafb"
            } shadow-lg pointer-events-auto relative`}
          >
            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              {/* Previous Chapter Button */}
              <button
                onClick={handlePreviousChapter}
                disabled={currentChapter <= 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentChapter <= 1
                    ? "text-stone-300 dark:text-stone-500 cursor-not-allowed"
                    : `text-stone-400 dark:text-stone-400 ${
                        isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 dark:bg-black/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20"
                          : "bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                      }`
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Book Dropdown */}
              <div className="relative book-dropdown" ref={bookDropdownRef}>
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg focus:ring-0 ring-gray-500 focus:outline-none shadow transition-colors duration-200 ${
                    isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/10 dark:bg-black/10 backdrop-blur-3xl text-white hover:bg-white/20 dark:hover:bg-black/20"
                      : "bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
                  }`}
                  onClick={() => {
                    setIsBookDropdownOpen(!isBookDropdownOpen);
                    setIsChapterDropdownOpen(false);
                    setIsVerseDropdownOpen(false);
                  }}
                >
                  <span
                    className={`text-[12px] font-medium font-bitter ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white"
                        : "text-stone-500 dark:text-gray-50"
                    }`}
                  >
                    {currentBook}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white/70"
                        : "text-gray-400"
                    } ${isBookDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Book Dropdown Content */}
                {isBookDropdownOpen && (
                  <div
                    className={`absolute left-0 mt-2 w-[38vw] ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 shadow-xl"
                        : "bg-white dark:bg-[#30261d]"
                    } rounded-3xl shadow-lg z-[60] max-h-96 overflow-y-auto no-scrollbar p-4`}
                    style={{
                      maxWidth: "calc(100vw - 2rem)",
                    }}
                  >
                    <div className="p-3">
                      {/* Search Input */}
                      <div
                        className={`relative mb-4 group border-none w-[50%] ${
                          isVerseByVerseView && hasBackgroundImage
                            ? ""
                            : "border border-gray-200 dark:border-gray-700"
                        } rounded-xl overflow-hidden`}
                      >
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Search
                            size={16}
                            className={
                              isVerseByVerseView && hasBackgroundImage
                                ? "text-white/50"
                                : "text-gray-400 dark:text-gray-500"
                            }
                          />
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={bookSearchQuery}
                          onChange={(e) => setBookSearchQuery(e.target.value)}
                          placeholder="Search books..."
                          className={`w-full py-2.5 pl-10 pr-4 border-none ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/50"
                              : "bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 focus:bg-gray-100/50 dark:focus:bg-gray-800/30 text-stone-600 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500"
                          } outline-none text-sm transition-colors duration-200`}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsBookDropdownOpen(false);
                              setBookSearchQuery("");
                            }
                          }}
                        />
                        <div
                          className={`absolute bottom-0 left-0 w-full h-[1px] transition-transform duration-300 transform origin-left ${
                            isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/30"
                              : "bg-primary/30 dark:bg-primary/20"
                          } scale-x-0 group-focus-within:scale-x-100`}
                        />
                      </div>

                      <h2
                        className={`text-sm font-semibold mb-2 font-serif ${
                          isVerseByVerseView && hasBackgroundImage
                            ? "text-white"
                            : "text-stone-500 dark:text-stone-400"
                        }`}
                      >
                        Old Testament
                      </h2>
                      <div className="grid grid-cols-3 gap-1 mb-4">
                        {filteredOldTestament.map((book) => (
                          <div
                            key={book.name}
                            className={`p-2 z-50 cursor-pointer  text-[12px] flex items-center justify-center shadow rounded-full transition-colors duration-150 ${
                              currentBook === book.name
                                ? isVerseByVerseView && hasBackgroundImage
                                  ? "bg-white/50   text-white font-medium ring-1 ring-white/30 cursor-not-allowed "
                                  : "bg-primary text-white dark:bg-primary dark:text-white font-medium ring-2 ring-primary/20 dark:ring-primary/40"
                                : isVerseByVerseView && hasBackgroundImage
                                ? "bg-white/10  text-white hover:bg-white/20 "
                                : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                            }`}
                            onClick={() => handleBookSelectAndClose(book.name)}
                          >
                            {book.name}
                          </div>
                        ))}
                      </div>
                      <h2
                        className={`text-sm font-semibold mb-2 pt-2 border-t ${
                          isVerseByVerseView && hasBackgroundImage
                            ? "border-white/20 text-white"
                            : "border-gray-200 dark:border-gray-700 text-stone-400"
                        }`}
                      >
                        New Testament
                      </h2>
                      <div className="grid grid-cols-3 gap-1">
                        {filteredNewTestament.map((book) => (
                          <div
                            key={book.name}
                            className={`p-2 cursor-pointer text-[12px] flex items-center justify-center shadow rounded-full transition-colors duration-150 ${
                              currentBook === book.name
                                ? isVerseByVerseView && hasBackgroundImage
                                  ? "bg-white/30 text-white font-medium ring-1 ring-white/30"
                                  : "bg-primary text-white dark:bg-primary dark:text-white font-medium ring-2 ring-primary/20 dark:ring-primary/40"
                                : isVerseByVerseView && hasBackgroundImage
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                            }`}
                            onClick={() => handleBookSelectAndClose(book.name)}
                          >
                            {book.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter Dropdown */}
              <div
                className="relative chapter-dropdown"
                ref={chapterDropdownRef}
              >
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg focus:ring-0 ring-gray-500 focus:outline-none shadow transition-colors duration-200 ${
                    isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/10 dark:bg-black/10 backdrop-blur-md text-white hover:bg-white/20 dark:hover:bg-black/20"
                      : "bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
                  }`}
                  onClick={() => {
                    setIsChapterDropdownOpen(!isChapterDropdownOpen);
                    setIsBookDropdownOpen(false);
                    setIsVerseDropdownOpen(false);
                  }}
                >
                  <span
                    className={`text-[12px] font-medium font-bitter ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white"
                        : "text-stone-500 dark:text-gray-50"
                    }`}
                  >
                    {currentChapter}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white/70"
                        : "text-gray-400"
                    } ${isChapterDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Chapter Dropdown Content */}
                {isChapterDropdownOpen && (
                  <div
                    className={`absolute mt-2 w-52 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 shadow-xl"
                        : "bg-white dark:bg-[#30261d]"
                    } rounded-3xl shadow-lg z-[60] max-h-60 overflow-y-auto no-scrollbar p-4`}
                  >
                    <div className="p-2 grid grid-cols-5 gap-1">
                      {getChapters().map((chapter) => (
                        <div
                          key={chapter}
                          className={`p-2 text-[12px] flex items-center justify-center shadow rounded-full transition-colors duration-150 ${
                            currentChapter === chapter
                              ? isVerseByVerseView && hasBackgroundImage
                                ? "bg-white/30 text-white font-medium"
                                : "bg-transparent text-stone-700 hover:text-stone-900 cursor-not-allowed dark:text-stone-200 font-medium"
                              : isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                          }`}
                          onClick={() => handleChapterSelect(chapter)}
                        >
                          {chapter}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verse Dropdown */}
              <div className="relative verse-dropdown" ref={verseDropdownRef}>
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg focus:ring-0 ring-gray-500 focus:outline-none shadow transition-colors duration-200 ${
                    isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/10 dark:bg-black/10 backdrop-blur-md text-white hover:bg-white/20 dark:hover:bg-black/20"
                      : "bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] text-stone-600 dark:text-stone-300"
                  }`}
                  onClick={() => {
                    setIsVerseDropdownOpen(!isVerseDropdownOpen);
                    setIsBookDropdownOpen(false);
                    setIsChapterDropdownOpen(false);
                  }}
                >
                  <span
                    className={`text-[12px] font-medium font-bitter ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white"
                        : "text-stone-500 dark:text-gray-50"
                    }`}
                  >
                    v {selectedVerse || 1}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "text-white/70"
                        : "text-gray-400"
                    } ${isVerseDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Verse Dropdown Content */}
                {isVerseDropdownOpen && (
                  <div
                    className={`absolute mt-2 w-52 ${
                      isVerseByVerseView && hasBackgroundImage
                        ? "bg-white/10 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 shadow-xl"
                        : "bg-white dark:bg-[#30261d]"
                    } rounded-3xl shadow-lg z-[60] max-h-60 overflow-y-auto no-scrollbar p-4`}
                  >
                    <div className="p-2 grid grid-cols-5 gap-1">
                      {getVerses().map((verse) => (
                        <div
                          key={verse}
                          className={`p-2 text-[12px] flex items-center justify-center shadow rounded-full transition-colors duration-150 ${
                            selectedVerse === verse
                              ? isVerseByVerseView && hasBackgroundImage
                                ? "bg-white/30 text-white font-medium"
                                : "bg-transparent text-stone-700 hover:text-stone-900 cursor-not-allowed dark:text-stone-200 font-medium"
                              : isVerseByVerseView && hasBackgroundImage
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                          }`}
                          onClick={() => handleVerseSelect(verse)}
                        >
                          {verse}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Chapter Button */}
              <button
                onClick={handleNextChapter}
                disabled={currentChapter >= chapterCount}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentChapter >= chapterCount
                    ? "text-stone-300 dark:text-stone-500 cursor-not-allowed"
                    : `text-stone-400 dark:text-stone-400 ${
                        isVerseByVerseView && hasBackgroundImage
                          ? "bg-white/10 dark:bg-black/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/20"
                          : "bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                      }`
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Layout Controls - Only show if not hidden */}
            {!hideLayoutButtons && (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => setViewMode("block")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "block"
                      ? "bg-primary text-white"
                      : "text-stone-400 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("paragraph")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "paragraph"
                      ? "bg-primary text-white"
                      : "text-stone-400 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300"
                  }`}
                >
                  <AlignLeft size={16} />
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="h-6 mx-2 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Feature Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFeature("bookmarks")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === "bookmarks"
                    ? isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/30 text-white shadow"
                      : "bg-primary text-white shadow"
                    : isVerseByVerseView && hasBackgroundImage
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Bookmark size={16} />
              </button>
              <button
                onClick={() => toggleFeature("history")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === "history"
                    ? isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/30 text-white shadow"
                      : "bg-primary text-white shadow"
                    : isVerseByVerseView && hasBackgroundImage
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
              >
                <History size={16} />
              </button>
              <button
                onClick={() => toggleFeature("search")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === "search"
                    ? isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/30 text-white shadow"
                      : "bg-primary text-white shadow"
                    : isVerseByVerseView && hasBackgroundImage
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => toggleFeature("library")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === "library"
                    ? isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/30 text-white shadow"
                      : "bg-primary text-white shadow"
                    : isVerseByVerseView && hasBackgroundImage
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Library size={16} />
              </button>
              <button
                onClick={() => toggleFeature("shortcuts")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === "shortcuts"
                    ? isVerseByVerseView && hasBackgroundImage
                      ? "bg-white/30 text-white shadow"
                      : "bg-primary text-white shadow"
                    : isVerseByVerseView && hasBackgroundImage
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Keyboard size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionBar;
