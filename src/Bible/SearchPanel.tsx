import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSearchOpen, setCurrentLocation } from "@/store/slices/bibleSlice";

const SearchPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchOpen, sidebarExpanded } = useAppSelector((state) => state.bible);
  const {
    searchQuery,
    searchResults,
    updateSearchQuery,
    performSearch,
  } = useBibleOperations();

  // Local state for search options
  const [exactMatch, setExactMatch] = useState(false);
  const [wholeWords, setWholeWords] = useState(false);

  // Perform search when search term changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, exactMatch, wholeWords, performSearch]);

  if (!searchOpen) return null;

  const handleResultClick = (book: string, chapter: number, verse: number) => {
    dispatch(setCurrentLocation({ book, chapter, verse }));
    dispatch(setSearchOpen(false));
    // Scroll to the selected verse
    const verseElement = document.getElementById(`verse-${verse}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      className={`fixed top-8 font-serif ${
        sidebarExpanded ? "left-48" : "left-12"
      } w-64 md:w-80 bg-white dark:bg-[#121212] h-[calc(100vh-2rem)] 
      border-r border-gray-300 dark:border-gray-700 
      transition-all duration-300 z-10 overflow-hidden flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-50">
            Search
          </h2>
          <button
            onClick={() => dispatch(setSearchOpen(false))}
            className="p-1 bg-gray-50 dark:bg-[#424242] shadow"
          >
            <X size={20} className="text-gray-500 dark:text-gray-500" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            placeholder="Search scripture..."
            className="w-[80%] p-2 pl-8  border-gray-300 dark:border-gray-600 border-none 
              rounded-md bg-white dark:bg-[#424242] shadow focus:outline-none focus:outline-gray-300 dark:focus:outline-[#424242] text-stone-500 dark:text-gray-100  "
            spellCheck={false}
          />
          <Search size={18} className="absolute left-2 top-2.5 text-gray-500" />
        </div>

        <div className="flex flex-col mt-3 space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={() => setExactMatch(!exactMatch)}
              className="rounded text-blue-600"
            />
            <span>Exact match</span>
          </label>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={wholeWords}
              onChange={() => setWholeWords(!wholeWords)}
              className="rounded text-blue-600"
            />
            <span>Whole words only</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {searchResults.length} results found
        </div>

        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-gray-100 dark:bg-[#42424240] rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-[#42424270] transition-colors"
                onClick={() =>
                  handleResultClick(result.book, result.chapter, result.verse)
                }
              >
                <div className="font-medium text-stone-500 dark:text-gray-50 text-[12px]">
                  {result.book} {result.chapter}:{result.verse}
                </div>
                <p className="text mt-1 line-clamp-2 text-stone-500 dark:text-gray-50 text-[12px]">
                  {result.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          searchQuery && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
