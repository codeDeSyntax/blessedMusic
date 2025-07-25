// components/PresentationLayout.tsx

import React, { useEffect } from "react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { X, Minus, Maximize2, ArrowLeft } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";

type PresentationLayoutProps = {
  children: React.ReactNode;
  title: string;
  hasBackButton?: boolean;
  onBackClick?: () => void;
};

export const PresentationLayout: React.FC<PresentationLayoutProps> = ({
  children,
  title,
  hasBackButton = true,
  onBackClick,
}) => {
  const dispatch = useAppDispatch();

  const handleClose = () => window.api?.closeApp?.();
  const handleMaximize = () => window.api?.maximizeApp?.();
  const handleMinimize = () => window.api?.minimizeApp?.();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      dispatch(setCurrentScreen("bible"));
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Space") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onBackClick]);

  return (
    <div className="flex flex-col h-full bg-[#30261d] text-white overflow-hidden">
      {/* Window Controls */}
      <div className="flex items-center justify-between px-2 h-12 z-40 bg-[#30261d] border-b border-gray-700">
        <div className="flex items-center gap-3">
          {hasBackButton && (
            <div
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-800 text-white transition-colors duration-200"
            >
              <ArrowLeft size={18} />
            </div>
          )}
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>
        <div className="flex space-x-2 items-center">
          <div
            onClick={handleMinimize}
            className="rounded-full h-6 w-6 flex items-center justify-center text-white hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          >
            <Minus size={16} />
          </div>
          <div
            onClick={handleMaximize}
            className="rounded-full h-6 w-6 flex items-center justify-center text-white hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          >
            <Maximize2 size={16} />
          </div>
          <div
            onClick={handleClose}
            className="rounded-full h-6 w-6 flex items-center justify-center text-white hover:bg-red-900 cursor-pointer transition-colors duration-200"
          >
            <X size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-[#30261d]">{children}</div>
    </div>
  );
};
