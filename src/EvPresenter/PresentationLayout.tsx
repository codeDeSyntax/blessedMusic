// components/PresentationLayout.tsx

import React, { useEffect } from "react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
// import { usePresentationContext } from '@/contexts/PresentationContext';
import { X, Minus, Maximize2, ArrowLeft } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import { EvPresenterThemeProvider } from "@/Provider/EvPresenterTheme";
import { EvPresenterThemeToggle } from "@/shared/EvPresenterThemeToggler";

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
  //   const { isPresentationMode } = usePresentationContext();/

  // Don't show window controls in presentation mode
  //   if (isPresentationMode) {
  //     return <div className="w-full h-full bg-white dark:bg-black">{children}</div>;
  //   }

  return (
    <EvPresenterThemeProvider>
      <div
        className="flex flex-col h-screen bg-[#faeed1] dark:bg-black text-[#9a674a] dark:text-white"
        data-evpresenter-theme
      >
        {/* Window Controls */}
        <div className="flex items-center justify-between px-2 h-[5%] z-40 bg-[#faeed1] dark:bg-black border-b border-[#9a674a]/10 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {hasBackButton && (
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-[#9a674a]/10 dark:hover:bg-gray-800 text-[#9a674a] dark:text-white transition-colors duration-200"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-lg font-semibold text-[#9a674a] dark:text-white">
              {title}
            </h1>
          </div>
          <div className="flex space-x-2 items-center">
            <EvPresenterThemeToggle />
            <div
              onClick={handleMinimize}
              className="rounded-full h-6 w-6 flex items-center justify-center text-[#9a674a] dark:text-white hover:bg-[#9a674a]/10 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            >
              <Minus size={16} />
            </div>
            <div
              onClick={handleMaximize}
              className="rounded-full h-6 w-6 flex items-center justify-center text-[#9a674a] dark:text-white hover:bg-[#9a674a]/10 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            >
              <Maximize2 size={16} />
            </div>
            <div
              onClick={handleClose}
              className="rounded-full h-6 w-6 flex items-center justify-center text-[#9a674a] dark:text-white hover:bg-red-200 dark:hover:bg-red-900 cursor-pointer transition-colors duration-200"
            >
              <X size={16} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="overflow-y-hidden no-scrollbar px-3 h-[94%] bg-[#faeed1] dark:bg-black">
          {children}
        </div>
      </div>
    </EvPresenterThemeProvider>
  );
};
