import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Presentation } from '@/types';

export type ViewState =
  | { type: "categories" }
  | { type: "list"; category: "sermon" | "other" }
  | { type: "detail"; presentation: Presentation }
  | { type: "edit"; presentation: Presentation }
  | { type: "create"; category: "sermon" | "other" }
  | { type: "slideshow"; presentation: Presentation };

export type PresentationCategory = "sermon" | "other";

interface PresenterState {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  viewState: ViewState;
  
  // Path management (from Context)
  selectedPath: string;
  
  // Slideshow state
  currentSlideIndex: number;
  isPresenting: boolean;
  isPaused: boolean;
  autoAdvance: boolean;
  slideTimer: number; // in seconds
  isPresentationMode: boolean; // from Context
  
  // Filters and search
  searchQuery: string;
  selectedCategory: PresentationCategory | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Settings
  defaultSlideTransition: string;
  presentationBackgrounds: string[];
}

// Async thunks for API calls (replacing Context methods)
export const loadPresentations = createAsyncThunk(
  'presenter/loadPresentations',
  async (selectedPath: string, { rejectWithValue, dispatch }) => {
    try {
      if (!selectedPath) {
        console.log("No path selected, skipping presentation loading");
        return [];
      }
      
      dispatch(setLoading(true));
      console.log("Loading presentations from path:", selectedPath);
      const result = await window.api.loadEvPresentations(selectedPath);
      console.log("Loaded presentations:", result.length);
      return result;
    } catch (error) {
      console.error("Failed to load presentations:", error);
      let message = 'Failed to load presentations';
      if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createPresentationAsync = createAsyncThunk(
  'presenter/createPresentation',
  async ({ 
    path, 
    presentation 
  }: { 
    path: string; 
    presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt"> 
  }, { rejectWithValue }) => {
    try {
      const newPresentation = await window.api.createEvPresentation(path, presentation);
      return newPresentation;
    } catch (error) {
      console.error("Failed to create presentation:", error);
      let message = 'Failed to create presentation';
      if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const updatePresentationAsync = createAsyncThunk(
  'presenter/updatePresentation',
  async ({ 
    id, 
    directoryPath, 
    presentation 
  }: { 
    id: string; 
    directoryPath: string; 
    presentation: Partial<Presentation> 
  }, { rejectWithValue }) => {
    try {
      const updatedPresentation = await window.api.updateEvPresentation(
        id,
        directoryPath,
        presentation
      );
      return updatedPresentation;
    } catch (error) {
      console.error("Failed to update presentation:", error);
      let message = 'Failed to update presentation';
      if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const deletePresentationAsync = createAsyncThunk(
  'presenter/deletePresentation',
  async ({ 
    id, 
    directory 
  }: { 
    id: string; 
    directory: string 
  }, { rejectWithValue }) => {
    try {
      await window.api.deleteEvPresentation(id, directory);
      return id;
    } catch (error) {
      console.error("Failed to delete presentation:", error);
      return rejectWithValue((error as Error).message || 'Failed to delete presentation');
    }
  }
);

const initialState: PresenterState = {
  presentations: [],
  currentPresentation: null,
  viewState: { type: "categories" },
  
  // Path management
  selectedPath: typeof window !== 'undefined' ? localStorage.getItem('evpresenterfilespath') || '' : '',
  
  currentSlideIndex: 0,
  isPresenting: false,
  isPaused: false,
  autoAdvance: false,
  slideTimer: 30,
  isPresentationMode: false,
  
  searchQuery: '',
  selectedCategory: null,
  
  isLoading: false,
  error: null,
  
  defaultSlideTransition: 'fade',
  presentationBackgrounds: typeof window !== 'undefined' ? 
    JSON.parse(localStorage.getItem('presentationBackgrounds') || '[]') : [],
};

const presenterSlice = createSlice({
  name: 'presenter',
  initialState,
  reducers: {
    // Path management (from Context)
    setSelectedPath: (state, action: PayloadAction<string>) => {
      state.selectedPath = action.payload;
      if (typeof window !== 'undefined' && action.payload) {
        localStorage.setItem('evpresenterfilespath', action.payload);
      }
    },
    
    // Presentation management
    setPresentations: (state, action: PayloadAction<Presentation[]>) => {
      state.presentations = action.payload;
    },
    addPresentation: (state, action: PayloadAction<Presentation>) => {
      state.presentations.push(action.payload);
    },
    updatePresentationLocal: (state, action: PayloadAction<Presentation>) => {
      const index = state.presentations.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.presentations[index] = action.payload;
      }
      // Update current presentation if it's the same one
      if (state.currentPresentation?.id === action.payload.id) {
        state.currentPresentation = action.payload;
      }
    },
    removePresentationLocal: (state, action: PayloadAction<string>) => {
      state.presentations = state.presentations.filter(p => p.id !== action.payload);
      // Clear current presentation if it was deleted
      if (state.currentPresentation?.id === action.payload) {
        state.currentPresentation = null;
      }
    },
    setCurrentPresentation: (state, action: PayloadAction<Presentation | null>) => {
      state.currentPresentation = action.payload;
    },
    
    // View state management
    setViewState: (state, action: PayloadAction<ViewState>) => {
      state.viewState = action.payload;
    },
    
    // Slideshow controls
    setCurrentSlideIndex: (state, action: PayloadAction<number>) => {
      state.currentSlideIndex = action.payload;
    },
    nextSlide: (state) => {
      if (state.currentPresentation && state.currentSlideIndex < state.currentPresentation.slides.length - 1) {
        state.currentSlideIndex += 1;
      }
    },
    previousSlide: (state) => {
      if (state.currentSlideIndex > 0) {
        state.currentSlideIndex -= 1;
      }
    },
    setIsPresenting: (state, action: PayloadAction<boolean>) => {
      state.isPresenting = action.payload;
      if (action.payload) {
        state.currentSlideIndex = 0;
      }
    },
    setIsPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
    },
    togglePause: (state) => {
      state.isPaused = !state.isPaused;
    },
    setAutoAdvance: (state, action: PayloadAction<boolean>) => {
      state.autoAdvance = action.payload;
    },
    setSlideTimer: (state, action: PayloadAction<number>) => {
      state.slideTimer = action.payload;
    },
    
    // Presentation mode (from Context)
    setIsPresentationMode: (state, action: PayloadAction<boolean>) => {
      state.isPresentationMode = action.payload;
    },
    startPresentation: (state) => {
      state.isPresentationMode = true;
      state.isPresenting = true;
      state.currentSlideIndex = 0;
    },
    stopPresentation: (state) => {
      state.isPresentationMode = false;
      state.isPresenting = false;
      state.isPaused = false;
      state.currentSlideIndex = 0;
    },
    
    // Search and filter
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<PresentationCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Settings
    setDefaultSlideTransition: (state, action: PayloadAction<string>) => {
      state.defaultSlideTransition = action.payload;
    },
    setPresentationBackgrounds: (state, action: PayloadAction<string[]>) => {
      state.presentationBackgrounds = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('presentationBackgrounds', JSON.stringify(action.payload));
      }
    },
    
    // Navigation helpers
    goToCategories: (state) => {
      state.viewState = { type: "categories" };
    },
    goToList: (state, action: PayloadAction<PresentationCategory>) => {
      state.viewState = { type: "list", category: action.payload };
    },
    goToDetail: (state, action: PayloadAction<Presentation>) => {
      state.viewState = { type: "detail", presentation: action.payload };
    },
    goToEdit: (state, action: PayloadAction<Presentation>) => {
      state.viewState = { type: "edit", presentation: action.payload };
    },
    goToCreate: (state, action: PayloadAction<PresentationCategory>) => {
      state.viewState = { type: "create", category: action.payload };
    },
    goToSlideshow: (state, action: PayloadAction<Presentation>) => {
      state.viewState = { type: "slideshow", presentation: action.payload };
      state.currentPresentation = action.payload;
      state.isPresenting = true;
      state.isPresentationMode = true;
      state.currentSlideIndex = 0;
    },
    
    // Exit slideshow
    exitSlideshow: (state) => {
      state.isPresenting = false;
      state.isPresentationMode = false;
      state.isPaused = false;
      state.currentSlideIndex = 0;
      state.viewState = { type: "categories" };
    },
    
    // Reset state
    resetPresenterState: (state) => {
      return {
        ...initialState,
        selectedPath: state.selectedPath, // Keep the selected path
        presentationBackgrounds: state.presentationBackgrounds, // Keep backgrounds
      };
    },
  },
  extraReducers: (builder) => {
    // Load presentations
    builder
      .addCase(loadPresentations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadPresentations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.presentations = action.payload;
        state.error = null;
      })
      .addCase(loadPresentations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Create presentation
    builder
      .addCase(createPresentationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPresentationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.presentations.push(action.payload);
        state.error = null;
      })
      .addCase(createPresentationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Update presentation
    builder
      .addCase(updatePresentationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePresentationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.presentations.findIndex(p => p.id === action.payload.id);
        if (index >= 0) {
          state.presentations[index] = action.payload;
        }
        if (state.currentPresentation?.id === action.payload.id) {
          state.currentPresentation = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePresentationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Delete presentation
    builder
      .addCase(deletePresentationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePresentationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.presentations = state.presentations.filter(p => p.id !== action.payload);
        if (state.currentPresentation?.id === action.payload) {
          state.currentPresentation = null;
        }
        state.error = null;
      })
      .addCase(deletePresentationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  // Path management
  setSelectedPath,
  
  // Presentation management
  setPresentations,
  addPresentation,
  updatePresentationLocal,
  removePresentationLocal,
  setCurrentPresentation,
  setViewState,
  
  // Slideshow controls
  setCurrentSlideIndex,
  nextSlide,
  previousSlide,
  setIsPresenting,
  setIsPaused,
  togglePause,
  setAutoAdvance,
  setSlideTimer,
  
  // Presentation mode
  setIsPresentationMode,
  startPresentation,
  stopPresentation,
  
  // Search and filters
  setSearchQuery,
  setSelectedCategory,
  
  // Loading states
  setLoading,
  setError,
  clearError,
  
  // Settings
  setDefaultSlideTransition,
  setPresentationBackgrounds,
  
  // Navigation
  goToCategories,
  goToList,
  goToDetail,
  goToEdit,
  goToCreate,
  goToSlideshow,
  exitSlideshow,
  
  // Utilities
  resetPresenterState,
} = presenterSlice.actions;

export default presenterSlice.reducer;