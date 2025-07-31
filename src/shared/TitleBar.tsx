import React from "react";
import {
  Plus,
  FolderOpen,
  Save,
  Upload,
  Download,
  Bell,
  Settings,
  Minimize2,
  Maximize2,
  X,
  ArrowLeft,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
const TitleBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentScreen = useAppSelector((state) => state.app.currentScreen);

  const handleMinimize = () => {
    window.api?.minimizeApp();
  };

  const handleMaximize = () => {
    window.api?.maximizeApp();
  };

  const handleClose = () => {
    window.api?.closeApp();
  };

  const handleBack = () => {
    dispatch(setCurrentScreen("Home"));
  };

  // Get the appropriate title based on current screen
  const getTitle = () => {
    if (currentScreen === "mpresenter") {
      return "Presentations";
    }
    return "EvPresenter";
  };

  // Check if we should show back button
  const shouldShowBackButton = currentScreen === "mpresenter";

  return (
    <div className="w-full h-6 backdrop-blur-sm bg-black/20 border-b border-[#2d2d2d] flex items-center justify-between px-4 py-2 shadow-lg drag-region relative z-10">
      {/* Subtle dark glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2d2d2d]/10 via-transparent to-[#404040]/10 pointer-events-none"></div>

      <div className="flex items-center space-x-4 h-full">
        <div className="flex items-center space-x-2">
          {/* Back button for PList screen */}
          {shouldShowBackButton && (
            <div
              className="w-6 h-6 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors mr-2 no-drag"
              onClick={handleBack}
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400 hover:text-white" />
            </div>
          )}

          <div className="rounded-md flex items-center justify-center">
            <img
              src="./evappicon.png"
              alt="EvPresenter Logo"
              className="w-6 h-6"
            />
          </div>
          <div className="text-sm font-semibold text-white tracking-tight">
            {getTitle()}
          </div>
        </div>

        {/* Action Icons - show on all screens */}
        <div className="flex items-center space-x-1  ">
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="New Presentation"
          >
            <Plus className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="Open"
          >
            <FolderOpen className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="Save"
          >
            <Save className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
          <div className="w-px h-4 bg-[#2d2d2d] mx-1"></div>
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="Import"
          >
            <Upload className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="Export"
          >
            <Download className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
          <div className="w-px h-4 bg-[#2d2d2d] mx-1"></div>
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
          <div
            className="w-5 h-5 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors no-drag"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </div>
        </div>
      </div>

      {/* Window Controls */}
      <div className="flex items-center space-x-1 no-drag">
        <div
          className="w-8 h-6 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minimize2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </div>
        <div
          className="w-8 h-6 rounded hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors"
          onClick={handleMaximize}
          title="Maximize"
        >
          <Maximize2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </div>
        <div
          className="w-8 h-6 rounded hover:bg-red-600/20 hover:text-red-400 flex items-center justify-center cursor-pointer transition-colors"
          onClick={handleClose}
          title="Close"
        >
          <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
