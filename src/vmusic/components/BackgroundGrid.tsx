import React from "react";
import BackgroundThumbnail from "./BackgroundThumbnail";
import { motion } from "framer-motion";

interface Background {
  name: string;
  src: string;
  category: string;
  isCustom?: boolean;
}

interface BackgroundGridProps {
  backgrounds: Background[];
  selectedBackground: Background | null;
  onSelectBackground: (background: Background) => void;
}

const BackgroundGrid: React.FC<BackgroundGridProps> = ({
  backgrounds,
  selectedBackground,
  onSelectBackground,
}) => {
  // Function to generate random position within constraints
  const generatePosition = (index: number) => {
    // Create a repeatable pattern based on index
    const row = Math.floor(index / 5); // Changed from 3 to 5 cards per row
    const col = index % 5; // Changed from 3 to 5
    
    // Base position - adjusted spacing for 5 columns
    const baseX = col * 160; // Slightly overlapping from 180px width
    const baseY = row * 140; // Slightly overlapping from 160px height
    
    // Add some randomness but keep it within bounds
    const randomX = (Math.sin(index) * 15) - 7.5; // Reduced from ±10px to ±7.5px for tighter spacing
    const randomY = (Math.cos(index) * 15) - 7.5; // Reduced from ±10px to ±7.5px for tighter spacing
    
    // Random rotation between -10 and 10 degrees (reduced from ±15)
    const rotation = ((index % 5) - 2) * 5; // Adjusted for 5 columns and reduced rotation
    
    return {
      x: baseX + randomX,
      y: baseY + randomY,
      rotation,
      scale: 0.85, // Slightly smaller to fit 5 in a row
      zIndex: index,
    };
  };

  return (
    <motion.div 
      className="relative p-8 w-fit mx-auto"
      initial="hidden"
      animate="visible"
    >
      <div className="relative" style={{ 
        height: Math.ceil(backgrounds.length / 5) * 140 + 100,
        width: 5 * 160 // Set a fixed width based on 5 columns
      }}>
        {backgrounds.map((background, index) => {
          const { x, y, rotation, scale, zIndex } = generatePosition(index);
          
          return (
            <BackgroundThumbnail
              key={background.src}
              background={background}
              isSelected={selectedBackground?.src === background.src}
              onSelect={() => onSelectBackground(background)}
              rotation={rotation}
              scale={scale}
              x={x}
              y={y}
              zIndex={selectedBackground?.src === background.src ? 10 : zIndex}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default BackgroundGrid; 