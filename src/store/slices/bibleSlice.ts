import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '..';

// Define types for our Bible data
export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  testament: string;
  chapters: Chapter[];
}

export interface BibleTranslation {
  translation: string;
  books: Book[];
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface HistoryEntry {
  reference: string;
  timestamp: number;
}

// Define available translations
export const TRANSLATIONS = {
  KJV: {
    name: "King James Version",
    path: "/assets/newkjv.json",
  },
  TWI: {
    name: "Twi Bible",
    path: "/assets/twiBible.json",
  },
  EWE: {
    name: "Ewe Bible",
    path: "/assets/eweBible.json"
  },
  FRENCH: {
    name: "French Bible",
    path: "/assets/frenchBible.json"
  }
};

// Old and New Testament books
const oldTestamentBooks: Book[] = [
  { name: "Genesis", chapters: [], testament: "old" },
  { name: "Exodus", chapters: [], testament: "old" },
  { name: "Leviticus", chapters: [], testament: "old" },
  { name: "Malachi", chapters: [], testament: "old" },
];

const newTestamentBooks: Book[] = [
  { name: "Matthew", chapters: [], testament: "new" },
  { name: "Mark", chapters: [], testament: "new" },
  { name: "Luke", chapters: [], testament: "new" },
  { name: "Revelation", chapters: [], testament: "new" },
];

const allBooks: Book[] = [...oldTestamentBooks, ...newTestamentBooks];

export interface BibleState {
  // App state
  theme: string;
  currentScreen: string;

  // UI state
  sidebarExpanded: boolean;
  activeFeature: string | null;
  searchOpen: boolean;

  // Bible content state
  bibleData: { [key: string]: BibleTranslation };
  currentTranslation: string;
  availableTranslations: string[];
  translationsLoaded: { [key: string]: boolean };
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  bookList: Book[];

  // User preferences
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  verseTextColor: string;

  // Bookmarks
  bookmarks: string[];

  // History
  history: HistoryEntry[];

  // Search
  searchResults: SearchResult[];
  searchTerm: string;
  exactMatch: boolean;
  wholeWords: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // New state fields
  verseByVerseMode: boolean;
  isFullScreen: boolean;
  imageBackgroundMode: boolean;

  // New state fields
  selectedBackground: string | null;
}

const initialState: BibleState = {
  // App state
  theme: localStorage.getItem("bibleTheme") || "dark",
  currentScreen: "Home",

  // UI state
  sidebarExpanded: localStorage.getItem("bibleSidebarExpanded") !== "false",
  activeFeature: null,
  searchOpen: false,

  // Bible content state
  bibleData: {},
  currentTranslation: localStorage.getItem("bibleCurrentTranslation") || "KJV",
  availableTranslations: [],
  translationsLoaded: {},
  currentBook: localStorage.getItem("bibleCurrentBook") || "Revelation",
  currentChapter: parseInt(localStorage.getItem("bibleCurrentChapter") || "3"),
  currentVerse: null,
  bookList: allBooks,

  // User preferences
  fontSize: localStorage.getItem("bibleFontSize") || "small",
  fontWeight: localStorage.getItem("bibleFontWeight") || "normal",
  fontFamily: localStorage.getItem("bibleFontFamily") || "garamond",
  verseTextColor: localStorage.getItem("bibleVerseTextColor") || "#8a8a8a",

  // Bookmarks
  bookmarks: (() => {
    try {
      const saved = localStorage.getItem("bibleBookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })(),

  // History
  history: (() => {
    try {
      const saved = localStorage.getItem("bibleHistory");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })(),

  // Search
  searchResults: [],
  searchTerm: "",
  exactMatch: false,
  wholeWords: false,

  // Loading states
  isLoading: false,
  error: null,

  // New state fields
  verseByVerseMode: false,
  isFullScreen: false,
  imageBackgroundMode: false,

  // New state fields
  selectedBackground: null,
};

const bibleSlice = createSlice({
  name: 'bible',
  initialState,
  reducers: {
    // App state actions
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      localStorage.setItem("bibleTheme", action.payload);
    },
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    },

    // UI state actions
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.sidebarExpanded = action.payload;
      localStorage.setItem("bibleSidebarExpanded", String(action.payload));
    },
    setActiveFeature: (state, action: PayloadAction<string | null>) => {
      state.activeFeature = action.payload;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },

    // Bible content state actions
    setBibleData: (state, action: PayloadAction<{ [key: string]: BibleTranslation }>) => {
      state.bibleData = action.payload;
    },
    addTranslationData: (state, action: PayloadAction<{ translation: string; data: BibleTranslation }>) => {
      const { translation, data } = action.payload;
      state.bibleData[translation] = data;
    },
    setCurrentTranslation: (state, action: PayloadAction<string>) => {
      state.currentTranslation = action.payload;
      localStorage.setItem("bibleCurrentTranslation", action.payload);
    },
    setAvailableTranslations: (state, action: PayloadAction<string[]>) => {
      state.availableTranslations = action.payload;
    },
    setTranslationLoaded: (state, action: PayloadAction<{ translation: string; loaded: boolean }>) => {
      const { translation, loaded } = action.payload;
      state.translationsLoaded[translation] = loaded;
    },
    setCurrentBook: (state, action: PayloadAction<string>) => {
      state.currentBook = action.payload;
      localStorage.setItem("bibleCurrentBook", action.payload);
    },
    setCurrentChapter: (state, action: PayloadAction<number>) => {
      state.currentChapter = action.payload;
      localStorage.setItem("bibleCurrentChapter", String(action.payload));
    },
    setCurrentVerse: (state, action: PayloadAction<number | null>) => {
      state.currentVerse = action.payload;
    },
    setBookList: (state, action: PayloadAction<Book[]>) => {
      state.bookList = action.payload;
    },

    // User preferences actions
    setFontSize: (state, action: PayloadAction<string>) => {
      state.fontSize = action.payload;
      localStorage.setItem("bibleFontSize", action.payload);
    },
    setFontWeight: (state, action: PayloadAction<string>) => {
      state.fontWeight = action.payload;
      localStorage.setItem("bibleFontWeight", action.payload);
    },
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.fontFamily = action.payload;
      localStorage.setItem("bibleFontFamily", action.payload);
    },
    setVerseTextColor: (state, action: PayloadAction<string>) => {
      state.verseTextColor = action.payload;
      localStorage.setItem("bibleVerseTextColor", action.payload);
    },

    // Bookmarks actions
    addBookmark: (state, action: PayloadAction<string>) => {
      const bookmark = action.payload;
      if (!state.bookmarks.includes(bookmark)) {
        state.bookmarks = [bookmark, ...state.bookmarks];
        localStorage.setItem("bibleBookmarks", JSON.stringify(state.bookmarks));
      }
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      const bookmark = action.payload;
      state.bookmarks = state.bookmarks.filter(b => b !== bookmark);
      localStorage.setItem("bibleBookmarks", JSON.stringify(state.bookmarks));
    },
    setBookmarks: (state, action: PayloadAction<string[]>) => {
      state.bookmarks = action.payload;
      localStorage.setItem("bibleBookmarks", JSON.stringify(action.payload));
    },

    // History actions
    addToHistory: (state, action: PayloadAction<string>) => {
      const reference = action.payload;
      const newEntry: HistoryEntry = { reference, timestamp: Date.now() };
      const histories = [newEntry, ...state.history.slice(0, 19)];
      state.history = histories;
      localStorage.setItem("bibleHistory", JSON.stringify(histories));
    },
    setHistory: (state, action: PayloadAction<HistoryEntry[]>) => {
      state.history = action.payload;
      localStorage.setItem("bibleHistory", JSON.stringify(action.payload));
    },
    clearHistory: (state) => {
      state.history = [];
      localStorage.setItem("bibleHistory", JSON.stringify([]));
    },

    // Search actions
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setExactMatch: (state, action: PayloadAction<boolean>) => {
      state.exactMatch = action.payload;
    },
    setWholeWords: (state, action: PayloadAction<boolean>) => {
      state.wholeWords = action.payload;
    },
    clearSearch: (state) => {
      state.searchTerm = "";
      state.searchResults = [];
    },

    // Loading state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Complex actions that combine multiple state updates
    navigateToVerse: (state, action: PayloadAction<{ book: string; chapter: number; verse?: number }>) => {
      const { book, chapter, verse } = action.payload;
      state.currentBook = book;
      state.currentChapter = chapter;
      state.currentVerse = verse || null;
      
      // Update localStorage
      localStorage.setItem("bibleCurrentBook", book);
      localStorage.setItem("bibleCurrentChapter", String(chapter));
      
      // Add to history
      const reference = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
      const newEntry: HistoryEntry = { reference, timestamp: Date.now() };
      const histories = [newEntry, ...state.history.slice(0, 19)];
      state.history = histories;
      localStorage.setItem("bibleHistory", JSON.stringify(histories));
    },

    // Reset actions
    resetBibleState: (state) => {
      // Reset to initial state while preserving localStorage values
      const newState = {
        ...initialState,
        theme: localStorage.getItem("bibleTheme") || "dark",
        sidebarExpanded: localStorage.getItem("bibleSidebarExpanded") !== "false",
        currentTranslation: localStorage.getItem("bibleCurrentTranslation") || "KJV",
        currentBook: localStorage.getItem("bibleCurrentBook") || "Revelations",
        currentChapter: parseInt(localStorage.getItem("bibleCurrentChapter") || "3"),
        fontSize: localStorage.getItem("bibleFontSize") || "small",
        fontWeight: localStorage.getItem("bibleFontWeight") || "normal",
        fontFamily: localStorage.getItem("bibleFontFamily") || "garamond",
        verseTextColor: localStorage.getItem("bibleVerseTextColor") || "#808080",
      };
      Object.assign(state, newState);
    },

    // New state actions
    setVerseByVerseMode: (state, action: PayloadAction<boolean>) => {
      state.verseByVerseMode = action.payload;
      localStorage.setItem('bibleVerseByVerseMode', String(action.payload));
    },
    setImageBackgroundMode: (state, action: PayloadAction<boolean>) => {
      state.imageBackgroundMode = action.payload;
      localStorage.setItem('bibleImageBackgroundMode', String(action.payload));
    },
    setFullScreen: (state, action: PayloadAction<boolean>) => {
      state.isFullScreen = action.payload;
      localStorage.setItem('bibleFullScreen', String(action.payload));
    },

    // New state actions
    setSelectedBackground: (state, action: PayloadAction<string | null>) => {
      state.selectedBackground = action.payload;
      localStorage.setItem('bibleSelectedBackground', action.payload || '');
    },
  },
});

export const {
  setTheme,
  setCurrentScreen,
  setSidebarExpanded,
  setActiveFeature,
  setSearchOpen,
  setBibleData,
  addTranslationData,
  setCurrentTranslation,
  setAvailableTranslations,
  setTranslationLoaded,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setBookList,
  setFontSize,
  setFontWeight,
  setFontFamily,
  setVerseTextColor,
  addBookmark,
  removeBookmark,
  setBookmarks,
  addToHistory,
  setHistory,
  clearHistory,
  setSearchResults,
  setSearchTerm,
  setExactMatch,
  setWholeWords,
  clearSearch,
  setLoading,
  setError,
  navigateToVerse,
  resetBibleState,
  setVerseByVerseMode,
  setImageBackgroundMode,
  setFullScreen,
  setSelectedBackground,
} = bibleSlice.actions;

export const loadBibleState = () => {
  return (dispatch: AppDispatch) => {
    // Load verse-by-verse mode
    const savedVerseByVerseMode = localStorage.getItem('bibleVerseByVerseMode');
    if (savedVerseByVerseMode !== null) {
      dispatch(setVerseByVerseMode(savedVerseByVerseMode === 'true'));
    }

    // Load image background mode
    const savedImageBackgroundMode = localStorage.getItem('bibleImageBackgroundMode');
    if (savedImageBackgroundMode !== null) {
      dispatch(setImageBackgroundMode(savedImageBackgroundMode === 'true'));
    }

    // Load fullscreen mode
    const savedFullScreen = localStorage.getItem('bibleFullScreen');
    if (savedFullScreen !== null) {
      dispatch(setFullScreen(savedFullScreen === 'true'));
    }

    // Load selected background
    const savedBackground = localStorage.getItem('bibleSelectedBackground');
    if (savedBackground) {
      dispatch(setSelectedBackground(savedBackground));
    }
  };
};

export default bibleSlice.reducer;