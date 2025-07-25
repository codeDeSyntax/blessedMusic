import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Info,
  Sparkles,
  Star,
  Zap,
  Music,
  Heart,
  Wand2,
} from "lucide-react";
import TitleBar from "../shared/TitleBar";

// Define our instrument type
interface Instrument {
  id: number;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  audioSample?: string;
}

// Sample data
const instruments: Instrument[] = [
  {
    id: 1,
    name: "Brass Trumpet",
    type: "Brass",
    description: "A masterpiece of craftsmanship with rich, warm tone.",
    imageUrl: "./trump.png",
    audioSample: "violin-sample.mp3",
  },
  {
    id: 2,
    name: "Steinway & Sons Grand Piano",
    type: "Percussion",
    description: "Concert grand piano with unparalleled depth and resonance.",
    imageUrl: "./grandp1.png",
    audioSample: "piano-sample.mp3",
  },
  {
    id: 3,
    name: "Gibson Les Paul Custom",
    type: "Electric Guitar",
    description:
      "Legendary electric guitar with mahogany body and PAF-style humbuckers.",
    imageUrl: "./guitar.png",
    audioSample: "guitar-sample.mp3",
  },
  {
    id: 4,
    name: "Selmer Paris Reference 54 Saxophone",
    type: "Woodwind",
    description:
      "Professional saxophone with warm, vibrant tone and exceptional projection.",
    imageUrl: "./grandp2.png",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 5,
    name: "Vector Instrument set",
    type: "Woodwind",
    description: "All music set",
    imageUrl: "./inst2.png",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 6,
    name: "Music",
    type: "Brass",
    description: "All music set",
    imageUrl: "./grandp3.jpg",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 7,
    name: "Vector Instrument set",
    type: "Electric Guitar",
    description: "All music set",
    imageUrl: "./guitar2.png",
    audioSample: "saxophone-sample.mp3",
  },
  {
    id: 8,
    name: "Vector Instrument set",
    type: "Electric Guitar",
    description: "All music set",
    imageUrl: "./guitar1.png",
    audioSample: "saxophone-sample.mp3",
  },
];

const InstrumentShowroom: React.FC = () => {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(
    instruments[0]
  );
  const [hoveredInstrument, setHoveredInstrument] = useState<Instrument | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentView, setCurrentView] = useState<"gallery" | "showcase">(
    "gallery"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get local theme
  const [localTheme, setLocalTheme] = useState(
    localStorage.getItem("bmusictheme") || "white"
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem("bmusictheme");
    if (savedTheme) {
      setLocalTheme(savedTheme);
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === "bmusictheme") {
        setLocalTheme(e.detail.newValue);
      }
    };

    window.addEventListener(
      "localStorageChange",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "localStorageChange",
        handleCustomStorageChange as EventListener
      );
    };
  }, []);

  // Theme-based colors
  const themeColors = {
    primary: localTheme === "creamy" ? "#9a674a" : "#4a5568",
    secondary: localTheme === "creamy" ? "#d4af37" : "#e2e8f0",
    accent: localTheme === "creamy" ? "#f4e4bc" : "#f7fafc",
    background: localTheme === "creamy" ? "#fdf4d0" : "#ffffff",
    text: localTheme === "creamy" ? "#654321" : "#2d3748",
    muted: localTheme === "creamy" ? "#c8a882" : "#a0aec0",
  };

  // Floating particles animation
  const FloatingParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
            }}
          >
            {i % 4 === 0 && <Sparkles className="w-3 h-3 text-yellow-400" />}
            {i % 4 === 1 && <Star className="w-2 h-2 text-purple-400" />}
            {i % 4 === 2 && <Zap className="w-3 h-3 text-blue-400" />}
            {i % 4 === 3 && <Heart className="w-2 h-2 text-pink-400" />}
          </motion.div>
        ))}
      </div>
    );
  };

  // Toggle audio
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background:
          localTheme === "creamy"
            ? "linear-gradient(135deg, #fdf4d0 0%, #f4e4bc 25%, #e6d196 75%, #d4af37 100%)"
            : "linear-gradient(135deg, #f7fafc 0%, #edf2f7 25%, #e2e8f0 75%, #cbd5e0 100%)",
      }}
    >
      <TitleBar />
      <FloatingParticles />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={selectedInstrument?.audioSample}
        onEnded={() => setIsAudioPlaying(false)}
      />

      {/* Magical Gallery Layout */}
      <div className="pt-16 pb-8 px-8 min-h-screen">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Wand2
              className="w-12 h-12 mx-auto"
              style={{ color: themeColors.primary }}
            />
          </motion.div>
          <h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Enchanted Instrument Gallery
          </h1>
          <p className="text-lg" style={{ color: themeColors.muted }}>
            Discover the magic of musical mastery
          </p>
        </motion.div>

        {/* Main Gallery Grid - Hexagonal Layout */}
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-center">
            {instruments.map((instrument, index) => (
              <motion.div
                key={instrument.id}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredInstrument(instrument)}
                onMouseLeave={() => setHoveredInstrument(null)}
                onClick={() => {
                  setSelectedInstrument(instrument);
                  setCurrentView("showcase");
                }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Hexagonal Card Container */}
                <div className="relative w-64 h-64">
                  {/* Glowing background ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle, ${themeColors.primary}20 0%, transparent 70%)`,
                    }}
                    animate={{
                      scale:
                        hoveredInstrument?.id === instrument.id
                          ? [1, 1.2, 1]
                          : 1,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Main card */}
                  <motion.div
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                      background:
                        localTheme === "creamy"
                          ? "linear-gradient(135deg, #faf5e6 0%, #f0e4c3 50%, #e6d196 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f7fafc 50%, #edf2f7 100%)",
                      border: `2px solid ${themeColors.secondary}40`,
                    }}
                    whileHover={{
                      boxShadow: `0 25px 50px -12px ${themeColors.primary}40`,
                    }}
                  >
                    {/* Magical shimmer overlay */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(45deg, transparent 30%, ${themeColors.secondary}20 50%, transparent 70%)`,
                      }}
                      animate={{
                        x:
                          hoveredInstrument?.id === instrument.id
                            ? [-100, 400]
                            : -100,
                      }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Instrument Image */}
                    <div className="relative p-6 h-full flex items-center justify-center">
                      <motion.img
                        src={instrument.imageUrl}
                        alt={instrument.name}
                        className="max-w-full max-h-48 object-contain drop-shadow-lg"
                        whileHover={{
                          filter: "brightness(1.1) saturate(1.2)",
                          rotate: [0, 3, -3, 0],
                        }}
                        transition={{ duration: 0.5 }}
                      />

                      {/* Floating musical notes */}
                      {hoveredInstrument?.id === instrument.id && (
                        <div className="absolute inset-0 pointer-events-none">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute"
                              initial={{
                                x: Math.random() * 200,
                                y: Math.random() * 200,
                                opacity: 0,
                                scale: 0,
                              }}
                              animate={{
                                y: -50,
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 2,
                                delay: i * 0.2,
                                repeat: Infinity,
                                repeatDelay: 1,
                              }}
                            >
                              <Music
                                className="w-4 h-4"
                                style={{ color: themeColors.primary }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info badge */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4"
                      style={{
                        background: `linear-gradient(to top, ${themeColors.accent}95, transparent)`,
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{
                        y: hoveredInstrument?.id === instrument.id ? 0 : 20,
                        opacity:
                          hoveredInstrument?.id === instrument.id ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3
                        className="font-bold text-lg mb-1"
                        style={{ color: themeColors.text }}
                      >
                        {instrument.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: themeColors.muted }}
                      >
                        {instrument.type}
                      </p>
                    </motion.div>

                    {/* Magic sparkle corners */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star className="w-5 h-5 text-blue-400" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className="flex items-center space-x-4 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl border"
            style={{
              background: `${themeColors.accent}95`,
              borderColor: `${themeColors.secondary}60`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDetails(!showDetails)}
              className="p-3 rounded-full shadow-lg transition-all duration-300"
              style={{
                backgroundColor: showDetails
                  ? themeColors.primary
                  : themeColors.secondary,
                color: showDetails ? "white" : themeColors.text,
              }}
            >
              <Info size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAudio}
              className="p-3 rounded-full shadow-lg transition-all duration-300"
              style={{
                backgroundColor: isAudioPlaying
                  ? themeColors.primary
                  : themeColors.secondary,
                color: isAudioPlaying ? "white" : themeColors.text,
              }}
            >
              <Volume2 size={20} />
              {isAudioPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: themeColors.primary }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.button>

            <div
              className="text-sm font-medium px-3"
              style={{ color: themeColors.text }}
            >
              {hoveredInstrument ? hoveredInstrument.name : "Hover to preview"}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Showcase Modal */}
      <AnimatePresence>
        {currentView === "showcase" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            style={{ backgroundColor: `${themeColors.background}95` }}
            onClick={() => setCurrentView("gallery")}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden shadow-3xl"
              style={{ backgroundColor: themeColors.accent }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentView("gallery")}
                className="absolute top-6 right-6 z-10 p-2 rounded-full backdrop-blur-md"
                style={{ backgroundColor: `${themeColors.secondary}80` }}
              >
                <Zap
                  className="w-6 h-6"
                  style={{ color: themeColors.primary }}
                />
              </motion.button>

              <div className="flex flex-col lg:flex-row h-full min-h-[500px]">
                {/* Image Section */}
                <div className="lg:w-1/2 p-8 flex items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 1, -1, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <img
                      src={selectedInstrument.imageUrl}
                      alt={selectedInstrument.name}
                      className="max-w-full max-h-96 object-contain drop-shadow-2xl"
                    />

                    {/* Magical aura */}
                    <motion.div
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{
                        background: `radial-gradient(circle, ${themeColors.primary}20 0%, transparent 70%)`,
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>
                </div>

                {/* Details Section */}
                <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                  <motion.h2
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-4"
                    style={{
                      color: themeColors.text,
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {selectedInstrument.name}
                  </motion.h2>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center mb-6"
                  >
                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${themeColors.primary}20`,
                        color: themeColors.primary,
                      }}
                    >
                      {selectedInstrument.type}
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg leading-relaxed mb-8"
                    style={{ color: themeColors.muted }}
                  >
                    {selectedInstrument.description}
                  </motion.p>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex space-x-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleAudio}
                      className="flex items-center space-x-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: "white",
                      }}
                    >
                      <Volume2 size={20} />
                      <span>
                        {isAudioPlaying ? "Stop Sample" : "Play Sample"}
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
                      style={{
                        backgroundColor: themeColors.secondary,
                        color: themeColors.text,
                      }}
                    >
                      <Heart size={20} />
                      <span>Add to Favorites</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstrumentShowroom;
