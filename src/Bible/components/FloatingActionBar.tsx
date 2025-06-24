import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveFeature } from '@/store/slices/bibleSlice';
import { BookOpen, ChevronDown, Grid3X3, AlignLeft, Bookmark, History, Search, Library, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode } from "../ScriptureContent";
import { useTheme } from "@/Provider/Theme";
import { motion, AnimatePresence } from 'framer-motion';

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
}) => {
  const { toggleActiveFeature } = useTheme();
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only show when mouse is below title bar area
      if (e.clientY > 48 && e.clientY < 160) {
        setIsVisible(true);
      } else if (e.clientY > 200 && !isBookDropdownOpen && !isChapterDropdownOpen && !isVerseDropdownOpen) {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isBookDropdownOpen, isChapterDropdownOpen, isVerseDropdownOpen]);

  const oldTestamentBooks = bookList.filter((book) => book.testament === "old");
  const newTestamentBooks = bookList.filter((book) => book.testament === "new");

  const toggleFeature = (feature: string) => {
    dispatch(setActiveFeature(activeFeature === feature ? null : feature));
  };

  const barVariants = {
    hidden: {
      y: -20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="fixed top-12 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={barVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center gap-4 px-6 py-3 rounded-full bg-[#f9fafb] dark:bg-[#30261d]  shadow-lg backdrop-blur-sm bg-f9fafb  pointer-events-auto"
            // style={{ backgroundColor: isDarkMode ? 'rgb(31, 31, 31)' : '#f9fafb' }}
          >
            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              {/* Previous Chapter Button */}
              <button
                onClick={handlePreviousChapter}
                disabled={currentChapter <= 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentChapter <= 1
                    ? 'text-stone-300 dark:text-stone-500 cursor-not-allowed'
                    : 'text-stone-400 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300'
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Book Dropdown */}
              <div className="relative book-dropdown">
                <button
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#3d332a] focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-primary/10 dark:hover:bg-[#4a3e34] transition-colors duration-200 text-stone-600 dark:text-stone-300"
                  onClick={() => {
                    setIsBookDropdownOpen(!isBookDropdownOpen);
                    setIsChapterDropdownOpen(false);
                    setIsVerseDropdownOpen(false);
                  }}
                >
                  <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
                    {currentBook}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-gray-400 ${
                      isBookDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isBookDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-[38vw] bg-white dark:bg-[#30261d] rounded-3xl shadow-lg z-10 max-h-96 overflow-y-auto no-scrollbar p-4">
                    <div className="p-3">
                      <h2 className="text-sm font-semibold mb-2 font-serif text-stone-500 dark:text-stone-400">Old Testament</h2>
                      <div className="grid grid-cols-3 gap-1 mb-4">
                        {oldTestamentBooks.map((book) => (
                          <div
                            key={book.name}
                            className={`p-2 text-[12px] flex items-center justify-center bg-white dark:bg-[#3d332a] shadow rounded-full transition-colors duration-150 ${
                              currentBook === book.name
                                ? "bg-primary text-white dark:bg-primary dark:text-white font-medium ring-2 ring-primary/20 dark:ring-primary/40"
                                : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                            }`}
                            onClick={() => handleBookSelect(book.name)}
                          >
                            {book.name}
                          </div>
                        ))}
                      </div>
                      <h2 className="text-sm font-semibold mb-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-stone-400">
                        New Testament
                      </h2>
                      <div className="grid grid-cols-3 gap-1">
                        {newTestamentBooks.map((book) => (
                          <div
                            key={book.name}
                            className={`p-2 text-[12px] flex items-center justify-center bg-white dark:bg-[#3d332a] shadow rounded-full transition-colors duration-150 ${
                              currentBook === book.name
                                ? "bg-primary text-white dark:bg-primary dark:text-white font-medium ring-2 ring-primary/20 dark:ring-primary/40"
                                : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] cursor-pointer hover:text-stone-700 dark:hover:text-stone-200"
                            }`}
                            onClick={() => handleBookSelect(book.name)}
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
              <div className="relative chapter-dropdown">
                <button
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#3d332a] focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-primary/10 dark:hover:bg-[#4a3e34] transition-colors duration-200 text-stone-600 dark:text-stone-300"
                  onClick={() => {
                    setIsChapterDropdownOpen(!isChapterDropdownOpen);
                    setIsBookDropdownOpen(false);
                    setIsVerseDropdownOpen(false);
                  }}
                >
                  <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
                    {currentChapter}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-gray-400 ${
                      isChapterDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isChapterDropdownOpen && (
                  <div className="absolute mt-2 w-52 bg-white dark:bg-[#30261d] rounded-3xl shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar p-4">
                    <div className="p-2 grid grid-cols-5 gap-1">
                      {getChapters().map((chapter) => (
                        <div
                          key={chapter}
                          className={`p-2 text-[12px] flex items-center justify-center bg-white dark:bg-[#3d332a] shadow rounded-full transition-colors duration-150 ${
                            currentChapter === chapter
                              ? "bg-transparent text-stone-700 hover:text-stone-900 cursor-not-allowed dark:text-stone-200 font-medium"
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
              <div className="relative verse-dropdown">
                <button
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#3d332a] focus:ring-0 ring-gray-500 focus:outline-none shadow hover:bg-primary/10 dark:hover:bg-[#4a3e34] transition-colors duration-200 text-stone-600 dark:text-stone-300"
                  onClick={() => {
                    setIsVerseDropdownOpen(!isVerseDropdownOpen);
                    setIsBookDropdownOpen(false);
                    setIsChapterDropdownOpen(false);
                  }}
                >
                  <span className="text-[12px] font-medium font-bitter text-stone-500 dark:text-gray-50">
                    v {selectedVerse || 1}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-gray-400 ${
                      isVerseDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isVerseDropdownOpen && (
                  <div className="absolute mt-2 w-52 bg-white dark:bg-[#30261d] rounded-3xl shadow-lg z-10 max-h-60 overflow-y-auto no-scrollbar p-4">
                    <div className="p-2 grid grid-cols-5 gap-1">
                      {getVerses().map((verse) => (
                        <div
                          key={verse}
                          className={`p-2 text-[12px] flex items-center justify-center bg-white dark:bg-[#3d332a] shadow rounded-full transition-colors duration-150 ${
                            selectedVerse === verse
                              ? "bg-transparent text-stone-700 hover:text-stone-900 cursor-not-allowed dark:text-stone-200 font-medium"
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
                    ? 'text-stone-300 dark:text-stone-500 cursor-not-allowed'
                    : 'text-stone-400 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:text-stone-500 dark:hover:text-stone-300'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "block"
                    ? "bg-primary text-white shadow"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
                onClick={() => setViewMode("block")}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "paragraph"
                    ? "bg-primary text-white shadow"
                    : "text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary"
                }`}
                onClick={() => setViewMode("paragraph")}
              >
                <AlignLeft size={16} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 mx-2 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Feature Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFeature('bookmarks')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === 'bookmarks'
                    ? 'bg-primary text-white shadow'
                    : 'text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary'
                }`}
              >
                <Bookmark size={16} />
              </button>
              <button
                onClick={() => toggleFeature('history')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === 'history'
                    ? 'bg-primary text-white shadow'
                    : 'text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary'
                }`}
              >
                <History size={16} />
              </button>
              <button
                onClick={() => toggleFeature('search')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === 'search'
                    ? 'bg-primary text-white shadow'
                    : 'text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary'
                }`}
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => toggleFeature('library')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeFeature === 'library'
                    ? 'bg-primary text-white shadow'
                    : 'text-stone-500 dark:text-stone-400 bg-white dark:bg-[#3d332a] hover:bg-primary/10 dark:hover:bg-[#4a3e34] hover:text-primary dark:hover:text-primary'
                }`}
              >
                <Library size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionBar; 