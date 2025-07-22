import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  logEvPresenterAction,
  logSystemInfo,
  logSystemError,
} from "@/utils/ClientSecretLogger";
import {
  setPresentations,
  addPresentation,
  // updatePresentation,
  // deletePresentation,
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
  ViewState,
  PresentationCategory,
  loadPresentations as loadPresentationsThunk,
  createPresentationAsync,
  updatePresentationAsync,
  deletePresentationAsync,
} from "@/store/slices/presenterSlice";
import { Presentation } from "@/types";

export const usePresenterOperations = () => {
  const dispatch = useAppDispatch();

  const presentations = useAppSelector(
    (state) => state.presenter.presentations
  );
  const currentPresentation = useAppSelector(
    (state) => state.presenter.currentPresentation
  );
  const viewState = useAppSelector((state) => state.presenter.viewState);
  const selectedPath = useAppSelector((state) => state.presenter.selectedPath);
  const currentSlideIndex = useAppSelector(
    (state) => state.presenter.currentSlideIndex
  );
  const isPresenting = useAppSelector((state) => state.presenter.isPresenting);
  const isPaused = useAppSelector((state) => state.presenter.isPaused);
  const autoAdvance = useAppSelector((state) => state.presenter.autoAdvance);
  const slideTimer = useAppSelector((state) => state.presenter.slideTimer);
  const searchQuery = useAppSelector((state) => state.presenter.searchQuery);
  const selectedCategory = useAppSelector(
    (state) => state.presenter.selectedCategory
  );
  const isLoading = useAppSelector((state) => state.presenter.isLoading);
  const error = useAppSelector((state) => state.presenter.error);
  const defaultSlideTransition = useAppSelector(
    (state) => state.presenter.defaultSlideTransition
  );
  const presentationBackgrounds = useAppSelector(
    (state) => state.presenter.presentationBackgrounds
  );

  // Presentation management operations
  const loadPresentations = useCallback(async () => {
    if (!selectedPath) {
      console.warn("No path selected for loading presentations");
      logSystemError("No path selected for loading EvPresenter presentations");
      return;
    }
    try {
      logEvPresenterAction(`Loading presentations from path: ${selectedPath}`);
      const result = await dispatch(
        loadPresentationsThunk(selectedPath)
      ).unwrap();
      logSystemInfo(
        `Loaded ${
          Array.isArray(result) ? result.length : 0
        } presentations from EvPresenter`
      );
    } catch (error) {
      console.error("Failed to load presentations:", error);
      logSystemError("Failed to load EvPresenter presentations", {
        error: error instanceof Error ? error.message : String(error),
        path: selectedPath,
      });
    }
  }, [dispatch, selectedPath]);

  const createPresentation = useCallback(
    async (
      presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
    ) => {
      if (!selectedPath) {
        logSystemError(
          "No path selected for creating EvPresenter presentation"
        );
        throw new Error("No path selected for creating presentation");
      }
      try {
        logEvPresenterAction(
          `Creating new presentation: "${presentation.title}"`,
          {
            slidesCount: presentation.slides?.length || 0,
          }
        );
        await dispatch(
          createPresentationAsync({ path: selectedPath, presentation })
        ).unwrap();
        logEvPresenterAction(
          `Successfully created presentation: "${presentation.title}"`
        );
      } catch (error) {
        console.error("Failed to create presentation:", error);
        logSystemError(
          `Failed to create presentation: "${presentation.title}"`,
          {
            error: error instanceof Error ? error.message : String(error),
          }
        );
        throw error;
      }
    },
    [dispatch, selectedPath]
  );

  const savePresentation = useCallback(
    async (id: string, presentation: Partial<Presentation>) => {
      if (!selectedPath) {
        throw new Error("No path selected for updating presentation");
      }
      try {
        await dispatch(
          updatePresentationAsync({
            id,
            directoryPath: selectedPath,
            presentation,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to save presentation:", error);
        throw error;
      }
    },
    [dispatch, selectedPath]
  );

  const removePresentation = useCallback(
    async (presentationId: string) => {
      if (!selectedPath) {
        throw new Error("No path selected for deleting presentation");
      }
      try {
        await dispatch(
          deletePresentationAsync({
            id: presentationId,
            directory: selectedPath,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to delete presentation:", error);
        throw error;
      }
    },
    [dispatch, selectedPath]
  );

  const selectPresentation = useCallback(
    (presentation: Presentation | null) => {
      dispatch(setCurrentPresentation(presentation));
    },
    [dispatch]
  );

  // Navigation operations
  const navigateToCategories = useCallback(() => {
    dispatch(goToCategories());
  }, [dispatch]);

  const navigateToList = useCallback(
    (category: PresentationCategory) => {
      dispatch(goToList(category));
    },
    [dispatch]
  );

  const navigateToDetail = useCallback(
    (presentation: Presentation) => {
      dispatch(goToDetail(presentation));
    },
    [dispatch]
  );

  const navigateToEdit = useCallback(
    (presentation: Presentation) => {
      dispatch(goToEdit(presentation));
    },
    [dispatch]
  );

  const navigateToCreate = useCallback(
    (category: PresentationCategory) => {
      dispatch(goToCreate(category));
    },
    [dispatch]
  );

  const startSlideshow = useCallback(
    (presentation: Presentation) => {
      logEvPresenterAction(`Starting slideshow: "${presentation.title}"`, {
        slidesCount: presentation.slides?.length || 0,
      });
      dispatch(goToSlideshow(presentation));
    },
    [dispatch]
  );

  const stopSlideshow = useCallback(() => {
    logEvPresenterAction("Stopping slideshow");
    dispatch(exitSlideshow());
  }, [dispatch]);

  // Slideshow control operations
  const goToSlide = useCallback(
    (slideIndex: number) => {
      logEvPresenterAction(`Navigating to slide ${slideIndex + 1}`);
      dispatch(setCurrentSlideIndex(slideIndex));
    },
    [dispatch]
  );

  const goToNextSlide = useCallback(() => {
    dispatch(nextSlide());
  }, [dispatch]);

  const goToPreviousSlide = useCallback(() => {
    dispatch(previousSlide());
  }, [dispatch]);

  const startPresentation = useCallback(() => {
    dispatch(setIsPresenting(true));
  }, [dispatch]);

  const stopPresentation = useCallback(() => {
    dispatch(setIsPresenting(false));
  }, [dispatch]);

  const pausePresentation = useCallback(() => {
    dispatch(setIsPaused(true));
  }, [dispatch]);

  const resumePresentation = useCallback(() => {
    dispatch(setIsPaused(false));
  }, [dispatch]);

  const togglePresentationPause = useCallback(() => {
    dispatch(togglePause());
  }, [dispatch]);

  const setAutoAdvanceMode = useCallback(
    (enabled: boolean) => {
      dispatch(setAutoAdvance(enabled));
    },
    [dispatch]
  );

  const updateSlideTimer = useCallback(
    (seconds: number) => {
      dispatch(setSlideTimer(seconds));
    },
    [dispatch]
  );

  // Search and filter operations
  const updateSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const selectCategory = useCallback(
    (category: PresentationCategory | null) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  // Settings operations
  const updateSlideTransition = useCallback(
    (transition: string) => {
      dispatch(setDefaultSlideTransition(transition));
    },
    [dispatch]
  );

  const updateBackgrounds = useCallback(
    (backgrounds: string[]) => {
      dispatch(setPresentationBackgrounds(backgrounds));
    },
    [dispatch]
  );

  // Keyboard shortcuts
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      if (!isPresenting) return;

      switch (event.key) {
        case "ArrowRight":
        case " ": // Space
          event.preventDefault();
          goToNextSlide();
          break;
        case "ArrowLeft":
          event.preventDefault();
          goToPreviousSlide();
          break;
        case "Escape":
          event.preventDefault();
          stopSlideshow();
          break;
        case "p":
          event.preventDefault();
          togglePresentationPause();
          break;
        default:
          break;
      }
    },
    [
      isPresenting,
      goToNextSlide,
      goToPreviousSlide,
      stopSlideshow,
      togglePresentationPause,
    ]
  );

  return {
    // State
    presentations,
    currentPresentation,
    viewState,
    selectedPath,
    currentSlideIndex,
    isPresenting,
    isPaused,
    autoAdvance,
    slideTimer,
    searchQuery,
    selectedCategory,
    isLoading,
    error,
    defaultSlideTransition,
    presentationBackgrounds,

    // Operations
    loadPresentations,
    createPresentation,
    savePresentation,
    removePresentation,
    selectPresentation,
    navigateToCategories,
    navigateToList,
    navigateToDetail,
    navigateToEdit,
    navigateToCreate,
    startSlideshow,
    stopSlideshow,
    goToSlide,
    goToNextSlide,
    goToPreviousSlide,
    startPresentation,
    stopPresentation,
    pausePresentation,
    resumePresentation,
    togglePresentationPause,
    setAutoAdvanceMode,
    updateSlideTimer,
    updateSearchQuery,
    selectCategory,
    updateSlideTransition,
    updateBackgrounds,
    handleKeyboardShortcuts,
  };
};
