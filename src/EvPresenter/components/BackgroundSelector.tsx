import React from "react";
import { BackgroundImage } from "./BackgroundImage";

interface BackgroundSelectorProps {
  presentationbgs: string[];
  backgroundImage: string;
  onBackgroundChange: (background: string) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  presentationbgs,
  backgroundImage,
  onBackgroundChange,
}) => {
  return (
    <div className="fixed top-8 left-8 z-40">
      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10">
        <h3 className="text-white text-sm font-medium mb-3">Backgrounds</h3>
        <div className="flex space-x-2 max-w-xs overflow-x-auto no-scrollbar">
          {presentationbgs.map((bg, index) => (
            <BackgroundImage
              key={index}
              bg={bg}
              index={index}
              isSelected={backgroundImage === bg}
              onClick={() => onBackgroundChange(bg)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
