import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Pencil,
  FolderOpen,
  Save,
  Music,
  CheckCircle,
  AlertCircle,
  ArrowLeftCircle,
  FileText,
  Calendar,
  Hash,
} from "lucide-react";
import TitleBar from "../shared/TitleBar";
import CustomEditor from "./SongCreator";
import { motion, AnimatePresence } from "framer-motion";
import { useBmusicContext } from "@/Provider/Bmusic";
import { useEastVoiceContext } from "@/Provider/EastVoice";

interface CreateSong {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

const Notification = ({
  message,
  type = "success",
}: {
  message: string;
  type?: "success" | "error" | "warning";
}) => {
  const bgColor = {
    success: "bg-[#9a674a]",
    error: "bg-red-500",
    warning: "bg-amber-500",
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed top-8 left-1/2 z-50 transform -translate-x-1/2"
    >
      <div
        className={`flex items-center gap-3 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium text-sm">{message}</span>
      </div>
    </motion.div>
  );
};

export default function CreateSong() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const { songRepo, setSongRepo, songs, setSongs, selectedSong, refetch } =
    useBmusicContext();
  const { setCurrentScreen } = useEastVoiceContext();
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const savedDirectory = localStorage.getItem("songRepoDirectory");
    if (savedDirectory) {
      setSongRepo(savedDirectory);
    }
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    setNotification({ show: true, message, type });
  };

  const validateSongData = (): boolean => {
    if (!songRepo) {
      showNotification("Please select a directory first!", "error");
      return false;
    }
    if (!formData.title.trim()) {
      showNotification("Please enter a song title!", "error");
      return false;
    }
    if (!formData.message.trim()) {
      showNotification("Please add some song content!", "warning");
      return false;
    }
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectDirectory = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSongRepo(path);
      localStorage.setItem("songRepoDirectory", path);
    }
  };

  const handleSaveSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateSongData()) {
      return;
    }

    try {
      setIsSaving(true);
      const filePath = await window.api.saveSong(
        songRepo,
        formData.title,
        formData.message
      );
      showNotification("Song created successfully! 🎵", "success");
      setSongs([
        ...songs,
        {
          id: selectedSong?.id || "",
          title: formData.title,
          path: selectedSong?.path || "",
          content: formData.message,
          dateModified: selectedSong?.dateModified || "",
          categories: selectedSong?.categories || [],
        },
      ]);
      setFormData({ title: "", message: "" });
      refetch();
    } catch (error) {
      console.error("Error saving song:", error);
      showNotification("Failed to save song. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getWordCount = () => {
    const text = formData.message.replace(/<[^>]*>/g, "").trim();
    return text ? text.split(/\s+/).length : 0;
  };

  return (
    <div className="w-screen min-h-screen bg-[#faeed1] overflow-hidden">
      <TitleBar />

      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto px-6 h-full">
        <div className="max-w-6xl mx-auto pt-20 pb-8 h-full">
          {/* Receipt-style container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-yellow-50 rounded-3xl shadow-2xl h-[calc(100vh-12rem)]  lg:h-[calc(100vh-8rem)] overflow-hidden border border-gray-100 relative"
          >
            {/* Receipt perforated edge effect */}
            {/* <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-30"></div>
            <div className="absolute top-2 left-4 right-4 border-t-2 border-dashed border-gray-200"></div> */}

            <div className="flex h-full bg-yellow-50">
              {/* Left Panel - Receipt Style */}
              <div className="w-[40%]  border-r border-gray-100 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <ArrowLeftCircle
                      className="w-6 h-6 text-[#9a674a] hover:scale-110 hover:cursor-pointer transition-transform duration-200"
                      onClick={() => setCurrentScreen("Songs")}
                    />
                  </div>

                  {/* Receipt Header */}
                  <div className="text-center ">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Music className="w-7 h-7 text-[#9a674a]" />
                      <h1 className="text-xl font-bold text-[#9a674a] tracking-tight">
                        SONG CREATOR
                      </h1>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {getCurrentDate()}
                    </div>
                    <div className="w-16 h-px bg-gray-300 mx-auto mt-2"></div>
                  </div>
                </div>

                {/* Form Fields - Receipt Style */}
                <div className="flex- px-6 py-2 space-y-1">
                  {/* Song Title Field */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      <FileText className="w-4 h-4" />
                      <span>Song Title</span>
                    </div>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-[90%] px-4 py-3 rounded-xl ring-2 ring-primary/10 outline-none border-0   border-gray-200 
                               focus:border-[#9a674a] focus:outline-none focus:ring-2 focus:ring-[#9a674a]/20
                               bg-yellow-50 text-gray-800 placeholder-gray-400 transition-all duration-200
                               font-medium"
                      placeholder="Enter song title..."
                      required
                    />
                    <div className="border-b border-dashed border-gray-200"></div>
                  </div>

                  {/* Directory Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      <FolderOpen className="w-4 h-4" />
                      <span>Save Location</span>
                    </div>
                    <button
                      onClick={selectDirectory}
                      className="w-full py-3 px-4 bg-[#9a674a] border border-gray-200
                               hover:border-[#9a674a] hover:bg-primary/20 text-gray-50 rounded-xl
                               transition-all duration-200 flex items-center justify-center gap-2
                               focus:outline-none focus:ring-2 focus:ring-[#9a674a]/10 group"
                    >
                      <FolderOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Select Directory</span>
                    </button>
                    {songRepo && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-3">
                        <p className="text-xs text-green-700 font-mono truncate">
                          📂 {songRepo}
                        </p>
                      </div>
                    )}
                    <div className="border-b border-dashed border-gray-200"></div>
                  </div>

                  {/* Stats Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
                      <Hash className="w-1 h-1" />
                      <span>Statistics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className=" rounded-lg  text-center">
                        <div className="text-lg font-bold text-[#9a674a]">
                          {getWordCount()}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Words
                        </div>
                      </div>
                      <div className=" rounded-lg text-center">
                        <div className="text-lg font-bold text-[#9a674a]">
                          {formData.title.length}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Title Chars
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button - Receipt Footer */}
                <div className="px-6 border-t border-gray-100 ">
                  <div className="border-b border-dashed border-gray-300 mb-4"></div>
                  <form onSubmit={handleSaveSong}>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full py-3 bg-[#9a674a] hover:bg-[#8a5739]
                             text-white rounded-xl transition-all duration-300 
                             flex items-center justify-center gap-3 shadow-lg hover:shadow-xl
                             font-semibold text-sm uppercase tracking-wide
                             ${
                               isSaving
                                 ? "opacity-70 cursor-not-allowed"
                                 : "hover:scale-[1.02]"
                             }`}
                    >
                      <Save
                        className={`w-5 h-5 ${isSaving ? "animate-spin" : ""}`}
                      />
                      <span>{isSaving ? "Saving..." : "Save Song"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Editor Panel */}
              <div className=" w-[80%]  bg-yelow-50 relative h-full">
                {/* Subtle header line */}
                <div className="absolut top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9a674a]/20 to-transparent"></div>
                <div className="h-full flex items-center justify-center p-4 overflow-hidden">
                  <CustomEditor formData={formData} setFormData={setFormData} />
                </div>
              </div>
            </div>

            {/* Receipt bottom perforated edge */}
            {/* <div className="absolute bottom-2 left-4 right-4 border-b-2 border-dashed border-gray-200"></div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-30"></div> */}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
