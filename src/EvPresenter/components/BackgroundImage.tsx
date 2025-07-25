import React, { useState } from "react";

// Memoized background image component for performance
export const BackgroundImage = React.memo(
  ({
    bg,
    index,
    isSelected,
    onClick,
  }: {
    bg: string;
    index: number;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <div
        onClick={onClick}
        className={`relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 hover:z-10 hover:shadow-lg cursor-pointer ${
          isSelected
            ? "border-[#9a674a] shadow-lg ring-1 ring-[#9a674a]/50 z-20 scale-105"
            : "border-white/20 hover:border-[#9a674a]/60"
        }`}
        style={{
          marginLeft: index === 0 ? "0" : "-8px",
          zIndex: isSelected ? 20 : 10 - index,
        }}
      >
        {!imageError ? (
          <img
            src={bg}
            alt={`BG ${index + 1}`}
            className="w-full h-full object-cover rounded-full"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">❌</span>
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
            isSelected ? "opacity-100" : "opacity-0 hover:opacity-60"
          }`}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#9a674a] shadow-lg border border-white animate-pulse" />
          </div>
        )}
      </div>
    );
  }
);

BackgroundImage.displayName = "BackgroundImage";
