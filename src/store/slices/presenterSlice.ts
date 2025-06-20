import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  
  // Slideshow state
  currentSlideIndex: number;
  isPresenting: boolean;
  isPaused: boolean;
  autoAdvance: boolean;
  slideTimer: number; // in seconds
  
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

const initialState: PresenterState = {
  presentations: JSON.parse(localStorage.getItem('presentations') || '[]'),
  currentPresentation: JSON.parse(localStorage.getItem('currentPresentation') || 'null'),
  viewState: { type: "categories" },
  
  currentSlideIndex: 0,
  isPresenting: false,
  isPaused: false,
  autoAdvance: false,
  slideTimer: 30,
  
  searchQuery: '',
  selectedCategory: null,
  
  isLoading: false,
  error: null,
  
  defaultSlideTransition: 'fade',
  presentationBackgrounds: JSON.parse(localStorage.getItem('presentationBackgrounds') || '[]'),
};

const presenterSlice = createSlice({
  name: 'presenter',
  initialState,
  reducers: {
    // Presentation management
    setPresentations: (state, action: PayloadAction<Presentation[]>) => {
      state.presentations = action.payload;
      localStorage.setItem('presentations', JSON.stringify(action.payload));
    },
    addPresentation: (state, action: PayloadAction<Presentation>) => {
      state.presentations.push(action.payload);
      localStorage.setItem('presentations', JSON.stringify(state.presentations));
    },
    updatePresentation: (state, action: PayloadAction<Presentation>) => {
      const index = state.presentations.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.presentations[index] = action.payload;
        localStorage.setItem('presentations', JSON.stringify(state.presentations));
      }
    },
    deletePresentation: (state, action: PayloadAction<string>) => {
      state.presentations = state.presentations.filter(p => p.id !== action.payload);
      localStorage.setItem('presentations', JSON.stringify(state.presentations));
      
      // Clear current presentation if it was deleted
      if (state.currentPresentation?.id === action.payload) {
        state.currentPresentation = null;
        localStorage.removeItem('currentPresentation');
      }
    },
    setCurrentPresentation: (state, action: PayloadAction<Presentation | null>) => {
      state.currentPresentation = action.payload;
      if (action.payload) {
        localStorage.setItem('currentPresentation', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('currentPresentation');
      }
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
      state.isLoading = false;
    },
    
    // Settings
    setDefaultSlideTransition: (state, action: PayloadAction<string>) => {
      state.defaultSlideTransition = action.payload;
    },
    setPresentationBackgrounds: (state, action: PayloadAction<string[]>) => {
      state.presentationBackgrounds = action.payload;
      localStorage.setItem('presentationBackgrounds', JSON.stringify(action.payload));
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
      state.currentSlideIndex = 0;
    },
    
    // Exit slideshow
    exitSlideshow: (state) => {
      state.isPresenting = false;
      state.isPaused = false;
      state.currentSlideIndex = 0;
      state.viewState = { type: "categories" };
    },
  },
});

export const {
  setPresentations,
  addPresentation,
  updatePresentation,
  deletePresentation,
  setCurrentPresentation,
  setViewState,
  setCurrentSlideIndex,
  nextSlide,
  previousSlide,
  setIsPresenting,
  setIsPaused,
  togglePause,
  setAutoAdvance,
  setSlideTimer,
  setSearchQuery,
  setSelectedCategory,
  setLoading,
  setError,
  setDefaultSlideTransition,
  setPresentationBackgrounds,
  goToCategories,
  goToList,
  goToDetail,
  goToEdit,
  goToCreate,
  goToSlideshow,
  exitSlideshow,
} = presenterSlice.actions;

export default presenterSlice.reducer; 