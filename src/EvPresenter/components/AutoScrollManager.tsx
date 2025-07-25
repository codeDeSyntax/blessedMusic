import { useEffect, useRef } from "react";

interface AutoScrollManagerProps {
  currentSlide: number;
  currentPresentation: any;
  scriptureScrollRef: React.RefObject<HTMLDivElement>;
  messagePointsScrollRef: React.RefObject<HTMLDivElement>;
  isAutoScrollPaused: boolean;
  isMessagePointsAutoScrollPaused: boolean;
}

export const useAutoScrollManager = ({
  currentSlide,
  currentPresentation,
  scriptureScrollRef,
  messagePointsScrollRef,
  isAutoScrollPaused,
  isMessagePointsAutoScrollPaused,
}: AutoScrollManagerProps) => {
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagePointsAutoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll effect for scripture slides
  useEffect(() => {
    const startAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }

      if (scriptureScrollRef.current && !isAutoScrollPaused) {
        const scrollContainer = scriptureScrollRef.current;
        let scrollDirection = 1; // 1 for down, -1 for up

        autoScrollTimerRef.current = setInterval(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const maxScroll = scrollHeight - clientHeight;

          if (maxScroll > 0) {
            // Check if we've reached the bottom
            if (scrollTop >= maxScroll - 10) {
              scrollDirection = -1; // Start scrolling up
            }
            // Check if we've reached the top
            else if (scrollTop <= 10) {
              scrollDirection = 1; // Start scrolling down
            }

            // Scroll by small increment
            scrollContainer.scrollTop += scrollDirection * 2;
          }
        }, 100); // Slow, smooth scrolling
      }
    };

    // Start auto-scroll for scripture slides when there are many scriptures
    if (
      currentPresentation?.type === "sermon" &&
      (currentPresentation as any).scriptures?.length > 3
    ) {
      const timer = setTimeout(startAutoScroll, 2000); // Start after 2 seconds

      return () => {
        clearTimeout(timer);
        if (autoScrollTimerRef.current) {
          clearInterval(autoScrollTimerRef.current);
        }
      };
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [
    currentSlide,
    isAutoScrollPaused,
    currentPresentation,
    scriptureScrollRef,
  ]);

  // Auto-scroll effect for message points slide
  useEffect(() => {
    const startMessagePointsAutoScroll = () => {
      if (messagePointsAutoScrollTimerRef.current) {
        clearInterval(messagePointsAutoScrollTimerRef.current);
      }

      if (messagePointsScrollRef.current && !isMessagePointsAutoScrollPaused) {
        const scrollContainer = messagePointsScrollRef.current;
        let scrollDirection = 1; // 1 for down, -1 for up

        messagePointsAutoScrollTimerRef.current = setInterval(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const maxScroll = scrollHeight - clientHeight;

          if (maxScroll > 0) {
            // Check if we've reached the bottom
            if (scrollTop >= maxScroll - 10) {
              scrollDirection = -1; // Start scrolling up
            }
            // Check if we've reached the top
            else if (scrollTop <= 10) {
              scrollDirection = 1; // Start scrolling down
            }

            // Scroll by small increment
            scrollContainer.scrollTop += scrollDirection * 1.5;
          }
        }, 120); // Slightly slower than scripture scroll
      }
    };

    // Start auto-scroll for message points when there are many points
    if (
      currentPresentation?.type === "sermon" &&
      (currentPresentation as any).mainMessagePoints?.length > 2
    ) {
      const timer = setTimeout(startMessagePointsAutoScroll, 3000); // Start after 3 seconds

      return () => {
        clearTimeout(timer);
        if (messagePointsAutoScrollTimerRef.current) {
          clearInterval(messagePointsAutoScrollTimerRef.current);
        }
      };
    }

    return () => {
      if (messagePointsAutoScrollTimerRef.current) {
        clearInterval(messagePointsAutoScrollTimerRef.current);
      }
    };
  }, [
    currentSlide,
    isMessagePointsAutoScrollPaused,
    currentPresentation,
    messagePointsScrollRef,
  ]);

  return {
    autoScrollTimerRef,
    messagePointsAutoScrollTimerRef,
  };
};

export default useAutoScrollManager;
