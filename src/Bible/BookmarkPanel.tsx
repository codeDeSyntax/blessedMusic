import React, { useMemo } from "react";
import { X, Star } from "lucide-react";
import { useState } from "react";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { useAppSelector, useAppDispatch } from "@/store";
import { setActiveFeature, setCurrentLocation, removeBookmark } from "@/store/slices/bibleSlice";

export const BookmarkPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookmarks } = useAppSelector((state) => state.bible);
  const {
    // Bible operations...
  } = useBibleOperations();

  const handleBookmarkClick = (bookmark: any) => {
    dispatch(setCurrentLocation({ 
      book: bookmark.book, 
      chapter: bookmark.chapter, 
      verse: bookmark.verse 
    }));
    dispatch(setActiveFeature(null));
  };

  // Handle the case when a user clicks on the star icon
  const handleRemoveBookmark = (event: React.MouseEvent, bookmarkId: string) => {
    event.stopPropagation(); // Prevent triggering the parent button click
    dispatch(removeBookmark(bookmarkId));
  };

  const bgColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},0.8)`;
    };

    return {
      cl1: generateRandomColor(),
    };
  }, []);

  return (
    <div className="h-full p-4 bg-gray-50  dark:bg-black font-serif overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bookmarks
        </h2>
        <button
          onClick={() => dispatch(setActiveFeature(null))}
          className="p-1 hover:bg-gray-100 bg-gray-50 dark:bg-bgray shadow dark:hover:bg-bgray rounded"
        >
          <X size={20} className="text-gray-900 dark:text-white" />
        </button>
      </div>
      <div className="grid grid-cols-2 flexcol gap-2">
        {bookmarks.length > 0 ? (
          bookmarks.reverse().map((bookmark, index) => (
            <button
              key={bookmark.id}
              onClick={() => handleBookmarkClick(bookmark)}
              className="flex items-center justify-between py-1 px-2 shadow bg-gray-100 dark:bg-bgray hover:bg-gray-200 dark:hover:bg-bgray/50 rounded-full"
            >
              <span
                className="text-gray-900 text-[12px] dark:text-white truncate"
                style={{ fontFamily: "Palatino" }}
              >
                {bookmark.book} {bookmark.chapter}:{bookmark.verse}
              </span>
              <span
                onClick={(e) => handleRemoveBookmark(e, bookmark.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <Star
                  size={16}
                  className="text-gray-900 dark:text-white"
                  color="purple"
                />
              </span>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No bookmarks yet
          </div>
        )}
      </div>
    </div>
  );
};
