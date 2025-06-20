import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setCurrentLanguage,
  setCurrentLocation,
  setCurrentChapterContent,
  setSidebarExpanded,
  setActiveFeature,
  setSearchOpen,
  setTheme,
  setSearchQuery,
  setSearchResults,
  setSearching,
  addBookmark,
  removeBookmark,
  updateBookmark,
  setFontSize,
  setFontFamily,
  setLoading,
  setError,
  clearHistory,
  BibleLanguage,
  BibleFeature,
} from '@/store/slices/bibleSlice';

export const useBibleOperations = () => {
  const dispatch = useAppDispatch();
  
  const currentLanguage = useAppSelector((state) => state.bible.currentLanguage);
  const currentBook = useAppSelector((state) => state.bible.currentBook);
  const currentChapter = useAppSelector((state) => state.bible.currentChapter);
  const currentVerse = useAppSelector((state) => state.bible.currentVerse);
  const currentChapterContent = useAppSelector((state) => state.bible.currentChapterContent);
  const sidebarExpanded = useAppSelector((state) => state.bible.sidebarExpanded);
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const searchOpen = useAppSelector((state) => state.bible.searchOpen);
  const theme = useAppSelector((state) => state.bible.theme);
  const searchQuery = useAppSelector((state) => state.bible.searchQuery);
  const searchResults = useAppSelector((state) => state.bible.searchResults);
  const isSearching = useAppSelector((state) => state.bible.isSearching);
  const bookmarks = useAppSelector((state) => state.bible.bookmarks);
  const history = useAppSelector((state) => state.bible.history);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const isLoading = useAppSelector((state) => state.bible.isLoading);
  const error = useAppSelector((state) => state.bible.error);

  // Language operations
  const changeLanguage = useCallback((language: BibleLanguage) => {
    dispatch(setCurrentLanguage(language));
  }, [dispatch]);

  // Navigation operations
  const navigateTo = useCallback((book: string, chapter: number, verse?: number) => {
    dispatch(setCurrentLocation({ book, chapter, verse }));
  }, [dispatch]);

  const loadChapter = useCallback(async (book: string, chapter: number) => {
    try {
      dispatch(setLoading(true));
      // API call would go here - for now we'll simulate
      const chapterData = {
        book,
        chapter,
        verses: [] // This would be populated from the Bible JSON files
      };
      dispatch(setCurrentChapterContent(chapterData));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to load chapter'));
    }
  }, [dispatch]);

  // UI operations
  const toggleSidebar = useCallback(() => {
    dispatch(setSidebarExpanded(!sidebarExpanded));
  }, [dispatch, sidebarExpanded]);

  const openFeature = useCallback((feature: BibleFeature) => {
    dispatch(setActiveFeature(feature));
  }, [dispatch]);

  const closeFeature = useCallback(() => {
    dispatch(setActiveFeature(null));
  }, [dispatch]);

  const openSearch = useCallback(() => {
    dispatch(setSearchOpen(true));
    dispatch(setActiveFeature('search'));
  }, [dispatch]);

  const closeSearch = useCallback(() => {
    dispatch(setSearchOpen(false));
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  }, [dispatch, theme]);

  // Search operations
  const updateSearchQuery = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const performSearch = useCallback(async (query: string) => {
    try {
      dispatch(setSearching(true));
      // Search implementation would go here
      const results = [] as any; // This would be populated from search results
      dispatch(setSearchResults(results));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Search failed'));
    }
  }, [dispatch]);

  // Bookmark operations
  const createBookmark = useCallback((book: string, chapter: number, verse: number, note?: string) => {
    dispatch(addBookmark({ book, chapter, verse, note }));
  }, [dispatch]);

  const deleteBookmark = useCallback((bookmarkId: string) => {
    dispatch(removeBookmark(bookmarkId));
  }, [dispatch]);

  const editBookmark = useCallback((bookmark: any) => {
    dispatch(updateBookmark(bookmark));
  }, [dispatch]);

  // Settings operations
  const updateFontSize = useCallback((size: number) => {
    dispatch(setFontSize(size));
  }, [dispatch]);

  const updateFontFamily = useCallback((family: string) => {
    dispatch(setFontFamily(family));
  }, [dispatch]);

  // History operations
  const clearReadingHistory = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  return {
    // State
    currentLanguage,
    currentBook,
    currentChapter,
    currentVerse,
    currentChapterContent,
    sidebarExpanded,
    activeFeature,
    searchOpen,
    theme,
    searchQuery,
    searchResults,
    isSearching,
    bookmarks,
    history,
    fontSize,
    fontFamily,
    isLoading,
    error,

    // Operations
    changeLanguage,
    navigateTo,
    loadChapter,
    toggleSidebar,
    openFeature,
    closeFeature,
    openSearch,
    closeSearch,
    toggleTheme,
    updateSearchQuery,
    performSearch,
    createBookmark,
    deleteBookmark,
    editBookmark,
    updateFontSize,
    updateFontFamily,
    clearReadingHistory,
  };
}; 