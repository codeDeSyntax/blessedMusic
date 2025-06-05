import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, Plus, Minus, Square, X, Music, Book } from "lucide-react";
import { motion } from "framer-motion";
import { useBmusicContext } from "@/Provider/Bmusic";
import { useSermonContext } from "@/Provider/Vsermons";
import { useEastVoiceContext } from "@/Provider/EastVoice";

// Define types in a separate file and import them to reduce parsing time
interface Song {
  title: string;
  path: string;
  content: string;
  message?: string;
  dateModified: string;
}

// Preload image to ensure it's cached
const preloadImages = () => {
  const imagesToPreload = ["./wood6.jpg", "./grandp1.png", "./wheat1.png"];
  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// Button component for window controls
interface WindowControlButtonProps {
  type: "close" | "minimize" | "maximize";
  onClick: () => void;
  isHovered: string | null;
  setIsHovered: (type: string | null) => void;
}

const WindowControlButton: React.FC<WindowControlButtonProps> = ({
  type,
  onClick,
  isHovered,
  setIsHovered,
}) => {
  const colors = {
    close: {
      bg: "bg-[#FF5F57]",
      hover: "hover:bg-red-600",
      icon: <X className="absolute text-white w-3 h-3" />,
    },
    minimize: {
      bg: "bg-[#FFBD2E]",
      hover: "hover:bg-yellow-600",
      icon: <Minus className="absolute text-white w-3 h-3" />,
    },
    maximize: {
      bg: "bg-[#28CA41]",
      hover: "hover:bg-green-600",
      icon: <Square className="absolute text-white w-3 h-3" />,
    },
  };

  const { bg, hover, icon } = colors[type];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(type)}
      onMouseLeave={() => setIsHovered(null)}
      className={`w-4 h-4 rounded-full ${bg} ${hover} hover:cursor-pointer flex items-center justify-center relative`}
    >
      {isHovered === type && icon}
    </div>
  );
};

const WorkspaceSelector = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [randomSong, setRandomSong] = useState<Song | null>(null);
  const [randomVerse, setRandomVerse] = useState("");
  const { songs } = useBmusicContext();
  const { setAndSaveCurrentScreen } = useEastVoiceContext();
  const { allSermons } = useSermonContext();
  // const { allSermons } = useSermonContext();

  // Array of country gospel verses
  const verses = [
    "Amazing grace! How sweet the sound, That saved a wretch like me!",
    "I once was lost, but now am found, Was blind, but now I see.",
    "Will the circle be unbroken, By and by, Lord, by and by",
    "In the sweet by and by, We shall meet on that beautiful shore",
    "I'll fly away, Oh Glory, I'll fly away",
    "When we've been there ten thousand years, Bright shining as the sun",
    "There's power in the blood, power in the blood",
    "Standing on the promises of Christ my King",
    "Blessed assurance, Jesus is mine! Oh, what a foretaste of glory divine!",
  ];

  // Preload images on component mount
  useEffect(() => {
    preloadImages();

    // Set images as loaded after a short delay
    const timer = setTimeout(() => {
      setImagesLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Select a random song and verse when songs change
  useEffect(() => {
    if (songs && songs.length > 0) {
      setRandomSong(songs[Math.floor(Math.random() * songs.length)]);
      setRandomVerse(verses[Math.floor(Math.random() * verses.length)]);
    }
  }, [songs]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleMinimize = useCallback(() => {
    window.api.minimizeApp();
  }, []);

  const handleMaximize = useCallback(() => {
    window.api.maximizeApp();
  }, []);

  const handleClose = useCallback(() => {
    window.api.closeApp();
  }, []);

  // Navigate to screens with memoized callbacks
  const navigateToSongs = useCallback(() => {
    setAndSaveCurrentScreen("Songs");
  }, [setAndSaveCurrentScreen]);

  const navigateToCreate = useCallback(() => {
    setAndSaveCurrentScreen("create");
  }, [setAndSaveCurrentScreen]);

  // Use will-change to optimize GPU rendering
  const willChangeStyle = { willChange: "transform, opacity" };

  // Colors for country gospel theme
  const colors = {
    hdColor: "bg-[#694a3f]",
    hdButton: "bg-[#c77c5d]",
    accent: "bg-[#8f6b5e]",
  };

  return (
    <div
      className="w-screen  h-full overflow-y-scroll no-scrollbar bg-cover bg-no-repeat flex p-6 relative font-serif"
      style={{
        backgroundImage: `url(./wood6.jpg)`,
        ...willChangeStyle,
      }}
    >
      {/* Vintage paper texture overlay for aged look */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: "url(./wood2.jpg)",
        }}
      />

      {/* Loading indicator */}
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      )}

      {/* Main content area */}
      <div className="w-1/2 mx-auto p-4 md:p-6 h-[86%] -rotate-6 border-4 border-[#8c6e63] rounded-xl shadow-xl relative">
        {/* Static background - wood6.jpg */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat rounded-lg"
          style={{
            backgroundImage: `url(./wood6.jpg)`,
            ...willChangeStyle,
          }}
        />

        {/* Header */}
        <div className="mb-4 relative z-10">
          <div className="flex items-center space-x-2 ml-2">
            <WindowControlButton
              type="close"
              onClick={handleClose}
              isHovered={isHovered}
              setIsHovered={setIsHovered}
            />
            <WindowControlButton
              type="minimize"
              onClick={handleMinimize}
              isHovered={isHovered}
              setIsHovered={setIsHovered}
            />
            <WindowControlButton
              type="maximize"
              onClick={handleMaximize}
              isHovered={isHovered}
              setIsHovered={setIsHovered}
            />
          </div>

          {/* Title with vintage styling */}
          <div className="mt-4 text-center">
            <h2
              className="text-3xl font-bold font-serif text-white drop-shadow-lg"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
            >
              EastVoice
            </h2>
            <p className="text-white mt-1 font-serif italic">
              Enjoy unperverted music for the soul
            </p>
            <div className="w-32 h-1 bg-[#c77c5d] mx-auto mt-2 rounded-full"></div>
          </div>
        </div>

        {/* Main workspace items */}
        <div className="space-y-4 relative z-10 mt-6">
          {/* All Songs Button */}
          <div
            className={`flex items-center justify-between px-4 py-3 ${colors.hdColor} border border-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${colors.hdButton} rounded-lg flex items-center justify-center text-white font-semibold shadow-inner`}
              >
                <img src="./music1.png" alt="cloud" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-white text-[14px]">
                  All Songs
                </h3>
                <p className="text-sm text-white opacity-80">
                  {songs?.length || 0} songs available
                </p>
              </div>
            </div>
            <button
              onClick={navigateToSongs}
              className={`px-4 py-2 ${colors.hdButton} text-white rounded-md hover:bg-[#a66c55] transition-colors duration-200 shadow-md font-serif`}
            >
              Browse
            </button>
          </div>

          {/* Add Song Button */}
          {/* <div
            className={`flex items-center justify-between px-4 py-3   border border-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${colors.hdColor} backdrop-blur rounded-lg flex items-center justify-center text-white font-semibold shadow-inner`}
              >
                <img src="./cloud.png" alt="cloud" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-white text-[14px]">
                  His voice
                </h3>
                <p className="text-sm text-white opacity-80">
                  {allSermons.length} sermons
                </p>
              </div>
            </div>
            <button
              onClick={() => setAndSaveCurrentScreen("hisvoice")}
              className={`px-4 py-2 ${colors.hdButton} text-white rounded-md hover:bg-[#a66c55] transition-colors duration-200 shadow-md font-serif text-[12px]`}
            >
              Open
            </button>
          </div> */}
          <div
            className={`flex items-center justify-between px-4 py-3   border border-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${colors.hdColor} backdrop-blur rounded-lg flex items-center justify-center text-white font-semibold shadow-inner`}
              >
                {/* <img src="./cloud.png" alt="cloud" className="h-6 w-6" /> */}
                B
              </div>
              <div>
                <h3 className="font-medium text-white text-[14px]">Bible</h3>
                <p className="text-sm text-white opacity-80">{}</p>
              </div>
            </div>
            <button
              onClick={() => setAndSaveCurrentScreen("bible")}
              className={`px-4 py-2 ${colors.hdButton} text-white rounded-md hover:bg-[#a66c55] transition-colors duration-200 shadow-md font-serif text-[12px]`}
            >
              Open
            </button>
          </div>
        </div>

        {/* Testimonial - Styled with vintage elements */}
        <div className="mt-8 px-6 py-4 rounded-lg text-white relative z-10 border border-[#c77c5d] bg-[#00000040]">
          <p className="text-[15px] leading-relaxed font-serif italic">
            "{randomVerse}"
          </p>
          <div className="flex justify-between items-center py-2 mt-2 border-t border-[#c77c5d]">
            <p className="mt-2 font-medium text-sm">
              {randomSong?.title || "Amazing Grace"}
            </p>
            <img
              src="./swipebook.gif"
              className="size-10 mix-blend-luminosity hue-rotate-180"
              style={{
                accentColor: "red",
              }}
              alt="swipebook"
              width="40"
              height="40"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Right Side Content */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="text-center">
          {/* Images with vintage styling */}
          <div className="flex items-center justify-center mb-6 mx-auto relative">
            {/* Decorative elements for vintage feel */}
            <div className="absolute inset-0 rounded-full border-4 border-[#c77c5d] transform rotate-45"></div>

            <div className="relative">
              <img
                src="./grandp1.png"
                alt="Workspace illustration"
                className="w-64 h-64 object-cover rounded-full border-4 border-[#8c6e63] shadow-xl -hue-rotate-15"
                width="256"
                height="256"
                loading="eager"
              />
              <div className="absolute bottom-0 right-0 transform translate-x-1/4">
                <img
                  src="./wheat1.png"
                  alt="Wheat illustration"
                  className="w-40 h-40 object-cover rounded-full border-4 border-[#8c6e63] shadow-lg -hue-rotate-15 "
                  width="160"
                  height="160"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Song display with vintage styling */}
          <div className="bg-[#00000050] p-4 rounded-lg border border-[#c77c5d] shadow-lg max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3 font-serif">
              {randomSong?.title || "Amazing Grace"}
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  randomSong?.content?.slice(0, 60) ||
                  "Amazing grace! How sweet the sound, That saved a wretch like me!...",
              }}
              className="text-blue-100 max-w-xs mx-auto font-serif"
            />

            {/* Vintage design element */}
            <div className="flex items-center justify-center mt-4">
              <div className="w-16 h-1 bg-[#c77c5d] mx-2"></div>
              <div className="w-2 h-2 bg-[#c77c5d] rounded-full"></div>
              <div className="w-16 h-1 bg-[#c77c5d] mx-2"></div>
            </div>

            <p className="text-xs text-white/70 mt-4 italic">
              "Let me listen to what kind of music you're playing on your radio.
              Let me see what kind of pictures you got in your house. I'll tell
              you what you're made out of."
            </p>
            <p className="text-xs text-white/70 mt-1">
              (56-0728 Making The Valley Full Of Ditches)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelector;
