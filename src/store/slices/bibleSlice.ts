import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type BibleLanguage = 'english' | 'french' | 'twi' | 'ewe';
export type BibleFeature = 'search' | 'bookmarks' | 'history' | 'settings' | 'library' | null;

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

interface BibleBookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  note?: string;
  createdAt: string;
}

interface BibleHistory {
  id: string;
  book: string;
  chapter: number;
  timestamp: string;
}

interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  matchedText: string;
}

interface BibleState {
  currentLanguage: BibleLanguage;
  currentBook: string;
  currentChapter: number;
  currentVerse: number | null;
  currentChapterContent: BibleChapter | null;
  sidebarExpanded: boolean;
  activeFeature: BibleFeature;
  searchOpen: boolean;
  theme: 'light' | 'dark';
  
  // Search
  searchQuery: string;
  searchResults: BibleSearchResult[];
  isSearching: boolean;
  
  // Bookmarks
  bookmarks: BibleBookmark[];
  
  // History
  history: BibleHistory[];
  
  // Settings
  fontSize: number;
  fontFamily: string;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const initialState: BibleState = {
  currentLanguage: (localStorage.getItem('bibleLanguage') as BibleLanguage) || 'english',
  currentBook: localStorage.getItem('bibleCurrentBook') || 'Genesis',
  currentChapter: parseInt(localStorage.getItem('bibleCurrentChapter') || '1'),
  currentVerse: null,
  currentChapterContent: null,
  sidebarExpanded: localStorage.getItem('bibleSidebarExpanded') === 'true',
  activeFeature: null,
  searchOpen: false,
  theme: (localStorage.getItem('bibleTheme') as 'light' | 'dark') || 'light',
  
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  bookmarks: JSON.parse(localStorage.getItem('bibleBookmarks') || '[]'),
  history: JSON.parse(localStorage.getItem('bibleHistory') || '[]'),
  
  fontSize: parseInt(localStorage.getItem('bibleFontSize') || '16'),
  fontFamily: localStorage.getItem('bibleFontFamily') || 'system-ui',
  
  isLoading: false,
  error: null,
};

const bibleSlice = createSlice({
  name: 'bible',
  initialState,
  reducers: {
    setCurrentLanguage: (state, action: PayloadAction<BibleLanguage>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('bibleLanguage', action.payload);
    },
    setCurrentLocation: (state, action: PayloadAction<{ book: string; chapter: number; verse?: number }>) => {
      const { book, chapter, verse } = action.payload;
      state.currentBook = book;
      state.currentChapter = chapter;
      state.currentVerse = verse || null;
      
      localStorage.setItem('bibleCurrentBook', book);
      localStorage.setItem('bibleCurrentChapter', chapter.toString());
      
      // Add to history
      const historyItem: BibleHistory = {
        id: `${book}-${chapter}-${Date.now()}`,
        book,
        chapter,
        timestamp: new Date().toISOString(),
      };
      
      // Remove duplicate entries and add new one
      state.history = state.history.filter(h => !(h.book === book && h.chapter === chapter));
      state.history.unshift(historyItem);
      
      // Keep only last 50 history items
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
      
      localStorage.setItem('bibleHistory', JSON.stringify(state.history));
    },
    setCurrentChapterContent: (state, action: PayloadAction<BibleChapter>) => {
      state.currentChapterContent = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.sidebarExpanded = action.payload;
      localStorage.setItem('bibleSidebarExpanded', action.payload.toString());
    },
    setActiveFeature: (state, action: PayloadAction<BibleFeature>) => {
      state.activeFeature = action.payload;
      if (action.payload !== 'search') {
        state.searchOpen = false;
      }
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
      if (!action.payload) {
        state.searchQuery = '';
        state.searchResults = [];
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('bibleTheme', action.payload);
    },
    
    // Search actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<BibleSearchResult[]>) => {
      state.searchResults = action.payload;
      state.isSearching = false;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    
    // Bookmark actions
    addBookmark: (state, action: PayloadAction<Omit<BibleBookmark, 'id' | 'createdAt'>>) => {
      const bookmark: BibleBookmark = {
        ...action.payload,
        id: `bookmark-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      state.bookmarks.push(bookmark);
      localStorage.setItem('bibleBookmarks', JSON.stringify(state.bookmarks));
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter(b => b.id !== action.payload);
      localStorage.setItem('bibleBookmarks', JSON.stringify(state.bookmarks));
    },
    updateBookmark: (state, action: PayloadAction<BibleBookmark>) => {
      const index = state.bookmarks.findIndex(b => b.id === action.payload.id);
      if (index >= 0) {
        state.bookmarks[index] = action.payload;
        localStorage.setItem('bibleBookmarks', JSON.stringify(state.bookmarks));
      }
    },
    
    // Settings actions
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
      localStorage.setItem('bibleFontSize', action.payload.toString());
    },
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.fontFamily = action.payload;
      localStorage.setItem('bibleFontFamily', action.payload);
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear history
    clearHistory: (state) => {
      state.history = [];
      localStorage.removeItem('bibleHistory');
    },
  },
});

export const {
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
} = bibleSlice.actions;

export default bibleSlice.reducer; 