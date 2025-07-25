import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideProps {
  content: React.ReactNode;
  currentSlide: number;
  slideIndex: number;
  backgroundImage: string;
  animation?: string;
  titleColor?: string;
  scriptureColor?: string;
  quoteColor?: string;
}

interface CarouselViewProps {
  slides: React.ReactNode[];
  currentSlide: number;
  direction: number;
  backgroundImage: string;
  selectedAnimation: string;
  titleColor: string;
  scriptureColor: string;
  quoteColor: string;
}

// Slide wrapper component with animations
const Slide: React.FC<SlideProps> = ({
  content,
  currentSlide,
  slideIndex,
  backgroundImage,
  animation = "bouncing-text",
  titleColor,
  scriptureColor,
  quoteColor,
}) => {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      custom={currentSlide > slideIndex ? 1 : -1}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", ease: "easeInOut", duration: 0.8 }}
      className="absolute inset-0 flex items-center justify-center bg-[#30261d]"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full overflow-hidden no-scrollbar text-center font-archivo text-white relative">
          {content}
        </div>
      </div>
    </motion.div>
  );
};

export const CarouselView: React.FC<CarouselViewProps> = ({
  slides,
  currentSlide,
  direction,
  backgroundImage,
  selectedAnimation,
  titleColor,
  scriptureColor,
  quoteColor,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <Slide
          key={currentSlide}
          content={slides[currentSlide]}
          currentSlide={currentSlide}
          slideIndex={currentSlide}
          backgroundImage={backgroundImage}
          animation={selectedAnimation}
          titleColor={titleColor}
          scriptureColor={scriptureColor}
          quoteColor={quoteColor}
        />
      </AnimatePresence>
    </div>
  );
};

export default CarouselView;
