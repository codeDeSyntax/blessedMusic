// components/PresentationLayout.tsx

import React, { useEffect } from "react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
// import { usePresentationContext } from '@/contexts/PresentationContext';
import { X, Minus, Maximize2, ArrowLeft } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import { ThemeToggle } from "@/shared/ThemeToggler";

type PresentationLayoutProps = {
  children: React.ReactNode;
  title: string;
  hasBackButton?: boolean;
  onBackClick?: () => void;
};

export const PresentationLayout: React.FC<PresentationLayoutProps> = ({
  children,
  title,
  hasBackButton = false,
  onBackClick,
}) => {
  const dispatch = useAppDispatch();
  
  const handleClose = () => window.api?.closeApp?.();
  const handleMaximize = () => window.api?.maximizeApp?.();
  const handleMinimize = () => window.api?.minimizeApp?.();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // switch (event.key) {
      //   case "Esc":
      //     setCurrentScreen("bible");
      //     break;
      //   default:
      //     break;
      // }
      if (event.key === "Space") {
        dispatch(setCurrentScreen("bible"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  //   const { isPresentationMode } = usePresentationContext();/

  // Don't show window controls in presentation mode
  //   if (isPresentationMode) {
  //     return <div className="w-full h-full bg-white dark:bg-black">{children}</div>;
  //   }

  return (
    <div className="flex flex-col h-screen  bg-white dark:bg-black text-black dark:text-white">
      {/* Window Controls */}
      <div className="flex items-center justify-between px-2 h-[5%] z-40 bg-gray-100 dark:bg-ltgray">
        <div className="flex items-center">
          {hasBackButton && (
            <button
              onClick={onBackClick}
              className="mr-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex space-x-2 items-center justce">
          <ThemeToggle />
          <div
            onClick={handleMinimize}
            className=" rounded-full h-6 w-6 flex items-center justify-center  hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <Minus size={16} />
          </div>
          <div
            onClick={handleMaximize}
            className=" rounded-full h-6 w-6 flex items-center justify-center  hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <Maximize2 size={16} />
          </div>
          <div
            onClick={handleClose}
            className=" rounded-full h-6 w-6 flex items-center justify-center   hover:bg-red-200 dark:hover:bg-red-900"
          >
            <X size={16} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" overflow-y-scroll no-scrollbar p-3 h-[95%]">
        {children}
      </div>
    </div>
  );
};
