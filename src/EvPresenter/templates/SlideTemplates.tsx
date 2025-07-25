// Slide Templates - Modern PowerPoint-inspired designs
import React from "react";
import { motion } from "framer-motion";
import { ThemeColors } from "./ThemeColors";

export interface SlideContentData {
  title?: string;
  subtitle?: string;
  content?: string;
  scripture?: string;
  quote?: string;
  author?: string;
  reference?: string;
  mainMessage?: string;
  points?: string[];
  preacher?: string;
  date?: string;
}

export interface SlideProps {
  content: SlideContentData;
  theme: ThemeColors;
  animation?: string;
  isVisible?: boolean;
}

// Template 1: Modern Minimal
export const MinimalTemplate: React.FC<SlideProps> = ({
  content,
  theme,
  animation = "bouncing-text",
  isVisible = true,
}) => {
  const getAnimationVariants = () => {
    switch (animation) {
      case "bouncing-text":
        return {
          hidden: { opacity: 0, y: -50, scale: 0.8 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              damping: 20,
              stiffness: 300,
              duration: 0.8,
            },
          },
        };
      case "gliding-sweep":
        return {
          hidden: { opacity: 0, x: -100 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              type: "tween",
              ease: "easeOut",
              duration: 1.2,
            },
          },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        };
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        minHeight: "100vh",
      }}
    >
      {/* Geometric background elements */}
      <div className="absolute inset-0">
        {/* Primary geometric shape */}
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-10 transform rotate-45"
          style={{ backgroundColor: theme.accent }}
        />

        {/* Secondary shape */}
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: theme.text }}
        />

        {/* Accent lines */}
        <div
          className="absolute top-1/3 left-0 w-full h-px opacity-20"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute top-2/3 left-0 w-full h-px opacity-20"
          style={{ backgroundColor: theme.accent }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center h-full p-12">
        <div className="text-center max-w-5xl">
          <motion.div
            variants={getAnimationVariants()}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="space-y-8"
          >
            {/* Title */}
            {content.title && (
              <motion.h1
                className="text-6xl md:text-7xl font-bold leading-tight"
                style={{
                  color: theme.text,
                  fontFamily: "'Inter', sans-serif",
                  textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                {content.title}
              </motion.h1>
            )}

            {/* Subtitle */}
            {content.subtitle && (
              <motion.h2
                className="text-2xl md:text-3xl font-medium opacity-90"
                style={{ color: theme.textSecondary }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {content.subtitle}
              </motion.h2>
            )}

            {/* Scripture */}
            {content.scripture && (
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <blockquote
                  className="text-xl md:text-2xl italic font-light leading-relaxed"
                  style={{ color: theme.text }}
                >
                  "{content.scripture}"
                </blockquote>
                {content.reference && (
                  <cite
                    className="block mt-4 text-lg font-medium"
                    style={{ color: theme.accent }}
                  >
                    — {content.reference}
                  </cite>
                )}
              </motion.div>
            )}

            {/* Quote */}
            {content.quote && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="absolute -top-4 -left-4 text-6xl opacity-30"
                  style={{ color: theme.accent }}
                >
                  "
                </div>
                <p
                  className="text-xl md:text-2xl italic leading-relaxed pl-8"
                  style={{ color: theme.text }}
                >
                  {content.quote}
                </p>
                {content.author && (
                  <p
                    className="mt-4 text-lg font-semibold"
                    style={{ color: theme.accent }}
                  >
                    — {content.author}
                  </p>
                )}
              </motion.div>
            )}

            {/* Main Message */}
            {content.mainMessage && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p
                  className="text-2xl md:text-3xl font-medium leading-relaxed"
                  style={{ color: theme.text }}
                >
                  {content.mainMessage}
                </p>
              </motion.div>
            )}

            {/* Points */}
            {content.points && content.points.length > 0 && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {content.points.map((point, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <p
                      className="text-xl font-medium"
                      style={{ color: theme.text }}
                    >
                      {point}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 w-full h-2"
        style={{ backgroundColor: theme.accent }}
      />
    </div>
  );
};

// Template 2: Corporate Professional
export const CorporateTemplate: React.FC<SlideProps> = ({
  content,
  theme,
  animation = "gliding-sweep",
  isVisible = true,
}) => {
  const getAnimationVariants = () => {
    switch (animation) {
      case "gliding-sweep":
        return {
          hidden: { opacity: 0, x: -100 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              type: "tween",
              ease: "easeOut",
              duration: 1.0,
            },
          },
        };
      case "explosive-zoom":
        return {
          hidden: { opacity: 0, scale: 0.3 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 400,
            },
          },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        };
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background: `linear-gradient(45deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.primary} 100%)`,
        minHeight: "100vh",
      }}
    >
      {/* Header section with accent */}
      <div
        className="absolute top-0 left-0 w-full h-24"
        style={{
          background: `linear-gradient(90deg, ${theme.accent} 0%, transparent 100%)`,
          opacity: 0.3,
        }}
      />

      {/* Side panel design */}
      <div
        className="absolute top-0 right-0 w-32 h-full opacity-20"
        style={{ backgroundColor: theme.accent }}
      />

      {/* Main content area */}
      <div className="relative z-10 flex items-center justify-start h-full pl-16 pr-48">
        <div className="max-w-4xl">
          <motion.div
            variants={getAnimationVariants()}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="space-y-12"
          >
            {/* Title section */}
            {content.title && (
              <div
                className="border-l-8 pl-8"
                style={{ borderColor: theme.accent }}
              >
                <motion.h1
                  className="text-5xl md:text-6xl font-bold leading-tight"
                  style={{
                    color: theme.text,
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  {content.title}
                </motion.h1>

                {content.subtitle && (
                  <motion.p
                    className="text-xl md:text-2xl mt-4 font-light"
                    style={{ color: theme.textSecondary }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {content.subtitle}
                  </motion.p>
                )}
              </div>
            )}

            {/* Scripture card */}
            {content.scripture && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="absolute -left-4 top-0 w-1 h-full rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-8 shadow-2xl">
                  <p
                    className="text-xl md:text-2xl font-medium leading-relaxed"
                    style={{ color: theme.text }}
                  >
                    {content.scripture}
                  </p>
                  {content.reference && (
                    <p
                      className="mt-6 text-lg font-semibold text-right"
                      style={{ color: theme.accent }}
                    >
                      {content.reference}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quote section */}
            {content.quote && (
              <motion.div
                className="relative pl-12"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className="absolute left-0 top-0 text-8xl opacity-20 leading-none"
                  style={{ color: theme.accent }}
                >
                  "
                </div>
                <blockquote
                  className="text-xl md:text-2xl italic leading-relaxed"
                  style={{ color: theme.text }}
                >
                  {content.quote}
                </blockquote>
                {content.author && (
                  <footer
                    className="mt-4 text-lg font-medium"
                    style={{ color: theme.accent }}
                  >
                    — {content.author}
                  </footer>
                )}
              </motion.div>
            )}

            {/* Main message */}
            {content.mainMessage && (
              <motion.div
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: theme.accent }}
                >
                  Key Message
                </h2>
                <p
                  className="text-xl md:text-2xl leading-relaxed"
                  style={{ color: theme.text }}
                >
                  {content.mainMessage}
                </p>
              </motion.div>
            )}

            {/* Points with corporate styling */}
            {content.points && content.points.length > 0 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{ color: theme.accent }}
                >
                  Key Points
                </h3>
                {content.points.map((point, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div
                      className="mt-2 w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <span className="text-white text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <p
                      className="text-lg md:text-xl leading-relaxed"
                      style={{ color: theme.text }}
                    >
                      {point}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer with presenter info */}
      {(content.preacher || content.date) && (
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="flex justify-between items-center">
            {content.preacher && (
              <p
                className="text-lg font-medium"
                style={{ color: theme.textSecondary }}
              >
                {content.preacher}
              </p>
            )}
            {content.date && (
              <p className="text-lg" style={{ color: theme.textSecondary }}>
                {content.date}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Export all templates
export const SlideTemplates = {
  minimal: MinimalTemplate,
  corporate: CorporateTemplate,
};

export type TemplateType = keyof typeof SlideTemplates;
