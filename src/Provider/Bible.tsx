import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

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

type BibleContextType = {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;

  // Bible specific state
  sidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  activeFeature: string | null;
  setActiveFeature: React.Dispatch<React.SetStateAction<string | null>>;
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Bible content state
  bibleData: { [key: string]: BibleTranslation };
  currentTranslation: string;
  setCurrentTranslation: React.Dispatch<React.SetStateAction<string>>;
  currentBook: string;
  setCurrentBook: React.Dispatch<React.SetStateAction<string>>;
  currentChapter: number;
  setCurrentChapter: React.Dispatch<React.SetStateAction<number>>;
  currentVerse: number | null;
  setCurrentVerse: React.Dispatch<React.SetStateAction<number | null>>;
  bookList: Book[];

  // User preferences
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  fontWeight: string;
  setFontWeight: React.Dispatch<React.SetStateAction<string>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  verseTextColor: string;
  setVerseTextColor: React.Dispatch<React.SetStateAction<string>>;

  // Bookmarks
  bookmarks: string[];
  addBookmark: (bookmark: string) => void;
  removeBookmark: (bookmark: string) => void;

  // History
  history: { reference: string; timestamp: number }[];
  addToHistory: (reference: string) => void;

  // Search
  searchResults: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  performSearch: (term: string) => void;
  exactMatch: boolean;
  setExactMatch: React.Dispatch<React.SetStateAction<boolean>>;
  wholeWords: boolean;
  setWholeWords: React.Dispatch<React.SetStateAction<boolean>>;

  // Scripture content utility functions
  getCurrentChapterVerses: () => Verse[];
  getBookChapterCount: (book: string) => number;
};

const BibleContext = createContext<BibleContextType | undefined>(undefined);

type BibleProviderProps = {
  children: ReactNode;
};

// Old and New Testament books
const oldTestamentBooks: Book[] = [
  {
    name: "Genesis",
    chapters: [],
    testament: "old",
  },
  {
    name: "Exodus",
    chapters: [],
    testament: "old",
  },
  {
    name: "Leviticus",
    chapters: [],
    testament: "old",
  },
  // Add all Old Testament books
  {
    name: "Malachi",
    chapters: [],
    testament: "old",
  },
];

const newTestamentBooks: Book[] = [
  {
    name: "Matthew",
    chapters: [],
    testament: "old",
  },
  {
    name: "Mark",
    chapters: [],
    testament: "old",
  },
  {
    name: "Luke",
    chapters: [],
    testament: "old",
  },
  // Add all New Testament books
  {
    name: "Revelation",
    chapters: [],
    testament: "old",
  },
];

// Combined list with testament property
const allBooks: Book[] = [...oldTestamentBooks, ...newTestamentBooks];

// Define available translations
const TRANSLATIONS = {
  KJV: {
    name: "King James Version",
    path: "./assets/newkjv.json",
  },
  TWI: {
    name: "Twi Bible",
    path: "./assets/twiBible.json",
  },

  EWE: {
    name: "Ewe Bible",
    path:"./assets/eweBible.json"
  },
  FRENCH: {
    name: "French Bible",
    path:"./assets/frenchBible.json"
  }

  // You can add as many translations as needed
};

export const BibleProvider = ({ children }: BibleProviderProps) => {
  // App state
  const [currentScreen, setCurrentScreen] = useState("Home");
  // const [currentBibleScreen, setCurrentBibleScreen] = useState("scriptures");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bibleTheme") || "dark";
  });

  // UI state
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    return localStorage.getItem("bibleSidebarExpanded") !== "false";
  });
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Bible content state
  const [bibleData, setBibleData] = useState<{
    [key: string]: BibleTranslation;
  }>({});
  const [currentTranslation, setCurrentTranslation] = useState(() => {
    return localStorage.getItem("bibleCurrentTranslation") || "KJV";
  });
  const [availableTranslations, setAvailableTranslations] = useState<string[]>(
    []
  );
  const [translationsLoaded, setTranslationsLoaded] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentBook, setCurrentBook] = useState(() => {
    return localStorage.getItem("bibleCurrentBook") || "1 Timothy";
  });
  const [currentChapter, setCurrentChapter] = useState(() => {
    return parseInt(localStorage.getItem("bibleCurrentChapter") || "3");
  });
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);

  const [bookList, setBookList] = useState<Book[]>(allBooks);

  // User preferences
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("bibleFontSize") || "medium";
  });
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem("bibleFontFamily") || "serif";
  });
  const [fontWeight, setFontWeight] = useState(() => {
    return localStorage.getItem("bibleFontWeight") || "normal";
  });
  const [verseTextColor, setVerseTextColor] = useState(() => {
    return localStorage.getItem("bibleVerseTextColor") || "#808080";
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bibleBookmarks");
      return saved ? JSON.parse(saved).reverse() : [];
    } catch (e) {
      return [];
    }
  });

  // History
  const [history, setHistory] = useState<
    { reference: string; timestamp: number }[]
  >(() => {
    try {
      const saved = localStorage.getItem("bibleHistory");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Search
  const [searchResults, setSearchResults] = useState<
    { book: string; chapter: number; verse: number; text: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exactMatch, setExactMatch] = useState(false);
  const [wholeWords, setWholeWords] = useState(false);

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem("bibleTheme", theme);
    localStorage.setItem("bibleSidebarExpanded", String(sidebarExpanded));
    localStorage.setItem("bibleCurrentTranslation", currentTranslation);
    localStorage.setItem("bibleCurrentBook", currentBook);
    localStorage.setItem("bibleCurrentChapter", String(currentChapter));
    localStorage.setItem("bibleFontSize", fontSize);
    localStorage.setItem("bibleFontWeight", fontWeight);
    localStorage.setItem("bibleFontFamily", fontFamily);
    localStorage.setItem("bibleVerseTextColor", verseTextColor);
    localStorage.setItem("bibleBookmarks", JSON.stringify(bookmarks));
    localStorage.setItem("bibleHistory", JSON.stringify(history));
  }, [
    theme,
    sidebarExpanded,
    currentTranslation,
    currentBook,
    currentChapter,
    fontSize,
    fontFamily,
    verseTextColor,
    bookmarks,
    history,
  ]);

  // Load Bible data on initial mount and handle translation-specific needs
  useEffect(() => {
    const fetchBibleData = async () => {
      try {
        // Initialize available translations
        setAvailableTranslations(Object.keys(TRANSLATIONS));

        // Fetch default translation first
        await loadTranslation(currentTranslation);

        // Then fetch any other translations in the background
        Object.keys(TRANSLATIONS).forEach((translation) => {
          if (translation !== currentTranslation) {
            loadTranslation(translation);
          }
        });
      } catch (error) {
        console.error("Error initializing Bible data:", error);
      }
    };

    fetchBibleData();
  }, []); // Only run on initial mount

  // When current translation changes, update the book list
  useEffect(() => {
    if (bibleData[currentTranslation]) {
      updateBookList();
      // console.log("bibledata", bibleData);
    } else {
      // If translation isn't loaded yet, try to load it
      loadTranslation(currentTranslation);
    }
  }, [currentTranslation, bibleData]);

  // Function to load a specific translation
  const loadTranslation = async (translation: string) => {
    // Don't reload already loaded translations
    if (bibleData[translation] || translationsLoaded[translation]) {
      return;
    }

    try {
      // Mark this translation as being loaded
      setTranslationsLoaded((prev) => ({ ...prev, [translation]: true }));

      const translationConfig =
        TRANSLATIONS[translation as keyof typeof TRANSLATIONS];
      if (!translationConfig) {
        console.error(
          `Translation configuration not found for: ${translation}`
        );
        return;
      }

      const response = await fetch(translationConfig.path);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${translation} translation: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Update Bible data with the new translation
      setBibleData((prevData) => ({
        ...prevData,
        [translation]: data,
      }));

      console.log(`Loaded ${translation} translation successfully`);
    } catch (error) {
      console.error(`Error loading ${translation} translation:`, error);
      // Reset loading state so it can be tried again
      setTranslationsLoaded((prev) => ({ ...prev, [translation]: false }));
    }
  };

  // Function to update book list based on current translation
  const updateBookList = () => {
    if (!bibleData[currentTranslation]) return;

    const books = bibleData[currentTranslation].books;
    const uniqueBooks = Array.from(
      new Set(books.map((book: Book) => book.name))
    ).map((name) => books.find((book: Book) => book.name === name));

    setBookList(uniqueBooks.filter((book): book is Book => book !== undefined));
    // console.log(bookList.length);
  };

  // Add a new bookmark
  const addBookmark = (bookmark: string) => {
    if (!bookmarks.includes(bookmark)) {
      setBookmarks([bookmark, ...bookmarks]);
    }
  };

  // Remove a bookmark
  const removeBookmark = (bookmark: string) => {
    setBookmarks(bookmarks.filter((b) => b !== bookmark));
  };

  // Add to history
  const addToHistory = (reference: string) => {
    const newEntry = { reference, timestamp: Date.now() };
    const histories = [newEntry, ...history.slice(0, 19)];
    setHistory(histories);
    //save new entry at the top of the history
  };

  // Search function
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results: {
      book: string;
      chapter: number;
      verse: number;
      text: string;
    }[] = [];

    // Check if we have data for the current translation
    if (!bibleData[currentTranslation]) {
      console.log("No Bible data found for translation:", currentTranslation);
      setSearchResults([]);
      return;
    }

    const translation = bibleData[currentTranslation];

    // Validate books data
    if (!translation.books || !Array.isArray(translation.books)) {
      console.log("No books found in translation:", currentTranslation);
      setSearchResults([]);
      return;
    }

    // Preprocess search term: remove square brackets, trim, and handle case
    const cleanSearchTerm = term.replace(/\[|\]/g, "").trim();

    // Create flexible search function
    const matchSearch = (verseText: string, searchTerm: string) => {
      // Remove square brackets and cleanup text
      const cleanText = verseText.replace(/\[|\]/g, "");

      // Convert both to lowercase for case-insensitive matching
      const lowerText = cleanText.toLowerCase();
      const lowerSearchTerm = searchTerm.toLowerCase();

      // Different matching strategies based on search options
      if (exactMatch && wholeWords) {
        // Exact whole word match
        return new RegExp(
          `\\b${(RegExp as any).escape(lowerSearchTerm)}\\b`
        ).test(lowerText);
      } else if (exactMatch) {
        // Exact substring match
        return lowerText.includes(lowerSearchTerm);
      } else if (wholeWords) {
        // Whole word match with partial flexibility
        return lowerText
          .split(/\s+/)
          .some((word) => word.includes(lowerSearchTerm));
      } else {
        // Flexible pattern matching
        // Allows matching even if search term is a partial word or part of a word
        return lowerText.includes(lowerSearchTerm);
      }
    };

    // Extend RegExp with escape method if not exists
    if (!(RegExp as any).escape) {
      (RegExp as any).escape = function (string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      };
    }

    // Comprehensive search across all books and chapters
    translation.books.forEach((book) => {
      book.chapters?.forEach((chapter) => {
        chapter.verses?.forEach((verse) => {
          if (matchSearch(verse.text, cleanSearchTerm)) {
            results.push({
              book: book.name,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            });
          }
        });
      });
    });

    // Limit results for performance and usability
    const limitedResults = results.slice(0, 200);

    // console.log(`Found ${results.length} results for "${term}"`);
    setSearchResults(limitedResults);
  };

  // Get current chapter verses
  const getCurrentChapterVerses = (): Verse[] => {
    try {
      const bookData = bibleData[currentTranslation]?.books.find(
        (b: Book) => b.name === currentBook
      );
      // console.log("bookdata", bookData);
      const chapterData = bookData?.chapters.find(
        (c: Chapter) => Number(c.chapter) === Number(currentChapter)
      );
      // console.log("chapterdata", chapterData);
      return chapterData?.verses || [];
    } catch (error) {
      console.error("Error getting verses:", error);
      return [];
    }
  };

  // Get chapter count for a book
  const getBookChapterCount = (book: string): number => {
    try {
      const bookData = bibleData[currentTranslation]?.books.find(
        (b: Book) => b.name === book
      );
      return bookData?.chapters.length || 0;
    } catch (error) {
      console.error("Error getting chapter count:", error);
      return 0;
    }
  };

  const handleMinimize = () => {
    window.api.minimizeApp();
  };

  const handleMaximize = () => {
    window.api.maximizeApp();
  };

  const handleClose = () => {
    window.api.closeApp();
  };

  return (
    <BibleContext.Provider
      value={{
        theme,
        setTheme,
        currentScreen,
        setCurrentScreen,
        handleClose,
        handleMaximize,
        handleMinimize,

        // UI state
        sidebarExpanded,
        setSidebarExpanded,
        activeFeature,
        setActiveFeature,
        searchOpen,
        setSearchOpen,

        // Bible content state
        bibleData,
        currentTranslation,
        setCurrentTranslation,
        currentBook,
        setCurrentBook,
        currentChapter,
        setCurrentChapter,
        currentVerse,
        setCurrentVerse,
        bookList,

        // User preferences
        fontSize,
        setFontSize,
        fontWeight,
        setFontWeight,
        fontFamily,
        setFontFamily,
        verseTextColor,
        setVerseTextColor,

        // Bookmarks
        bookmarks,
        addBookmark,
        removeBookmark,

        // History
        history,
        addToHistory,

        // Search
        searchResults,
        searchTerm,
        setSearchTerm,
        performSearch,
        exactMatch,
        setExactMatch,
        wholeWords,
        setWholeWords,

        // Utility functions
        getCurrentChapterVerses,
        getBookChapterCount,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

// Custom hook to use the BibleContext
export const useBibleContext = () => {
  const context = useContext(BibleContext);
  if (!context) {
    throw new Error("useBibleContext must be used within a BibleProvider");
  }
  return context;
};
