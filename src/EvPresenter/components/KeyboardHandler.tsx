import { useEffect } from "react";

interface KeyboardHandlerProps {
  currentSlide: number;
  totalSlides: number;
  setCurrentSlide: (slide: number) => void;
  setDirection: (direction: number) => void;
  setIsPresentationMode: (mode: boolean) => void;
  setIsAutoPlaying: (playing: boolean) => void;
  toggleFullscreen: () => void;
  isAutoPlaying: boolean;
  isPresentationMode: boolean;
}

export const useKeyboardHandler = ({
  currentSlide,
  totalSlides,
  setCurrentSlide,
  setDirection,
  setIsPresentationMode,
  setIsAutoPlaying,
  toggleFullscreen,
  isAutoPlaying,
  isPresentationMode,
}: KeyboardHandlerProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent keyboard navigation when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case " ": // Spacebar
        case "PageDown":
          e.preventDefault();
          if (currentSlide < totalSlides - 1) {
            setDirection(1);
            setCurrentSlide(currentSlide + 1);
          }
          break;

        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(currentSlide - 1);
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          // Go to first slide
          if (currentSlide !== 0) {
            setDirection(-1);
            setCurrentSlide(0);
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          // Go to last slide
          if (currentSlide !== totalSlides - 1) {
            setDirection(1);
            setCurrentSlide(totalSlides - 1);
          }
          break;

        case "Home":
          e.preventDefault();
          // Go to first slide
          if (currentSlide !== 0) {
            setDirection(-1);
            setCurrentSlide(0);
          }
          break;

        case "End":
          e.preventDefault();
          // Go to last slide
          if (currentSlide !== totalSlides - 1) {
            setDirection(1);
            setCurrentSlide(totalSlides - 1);
          }
          break;

        case "F5":
        case "p":
        case "P":
          e.preventDefault();
          setIsPresentationMode(true);
          break;

        case "Escape":
          e.preventDefault();
          if (isPresentationMode) {
            setIsPresentationMode(false);
          }
          break;

        case "F11":
          e.preventDefault();
          toggleFullscreen();
          break;

        case "a":
        case "A":
          e.preventDefault();
          setIsAutoPlaying(!isAutoPlaying);
          break;

        // Number keys for direct slide navigation
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          const slideNumber = parseInt(e.key) - 1;
          if (slideNumber < totalSlides) {
            setDirection(slideNumber > currentSlide ? 1 : -1);
            setCurrentSlide(slideNumber);
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    currentSlide,
    totalSlides,
    setCurrentSlide,
    setDirection,
    setIsPresentationMode,
    setIsAutoPlaying,
    toggleFullscreen,
    isAutoPlaying,
    isPresentationMode,
  ]);
};

export default useKeyboardHandler;
