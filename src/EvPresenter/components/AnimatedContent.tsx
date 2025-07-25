import React from "react";
import { motion } from "framer-motion";

// Custom Animation Wrapper Component
export const AnimatedContent: React.FC<{
  children: React.ReactNode;
  animation: string;
  isVisible: boolean;
}> = ({ children, animation, isVisible }) => {
  const getAnimationVariants = () => {
    switch (animation) {
      case "bouncing-text":
        return {
          hidden: {
            opacity: 0,
            y: -100,
            scale: 0.3,
            rotateX: 90,
          },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            transition: {
              type: "spring",
              damping: 10,
              stiffness: 100,
              duration: 1.2,
              delay: 0.2,
              when: "beforeChildren",
              staggerChildren: 0.1,
            },
          },
        };

      case "gliding-sweep":
        return {
          hidden: {
            opacity: 0,
            x: -200,
            scale: 0.8,
            filter: "blur(10px)",
          },
          visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              type: "tween",
              ease: [0.25, 0.46, 0.45, 0.94],
              duration: 1.5,
              delay: 0.3,
            },
          },
        };

      case "explosive-zoom":
        return {
          hidden: {
            opacity: 0,
            scale: 0.1,
            rotate: -180,
            filter: "brightness(0)",
          },
          visible: {
            opacity: 1,
            scale: [0.1, 1.2, 1],
            rotate: 0,
            filter: "brightness(1)",
            transition: {
              duration: 1.0,
              ease: "easeOut",
              times: [0, 0.7, 1],
              delay: 0.1,
            },
          },
        };

      case "wave-reveal":
        return {
          hidden: {
            opacity: 0,
            y: 100,
            skewY: 10,
            scale: 0.9,
          },
          visible: {
            opacity: 1,
            y: 0,
            skewY: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 1.5,
              delay: 0.2,
            },
          },
        };

      case "spiral-entrance":
        return {
          hidden: {
            opacity: 0,
            scale: 0.3,
            rotate: -720,
            y: 200,
          },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 2.0,
              delay: 0.3,
            },
          },
        };

      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8 } },
        };
    }
  };

  return (
    <motion.div
      variants={getAnimationVariants()}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
