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
  Monitor,
} from "lucide-react";
import TitleBar from "../shared/TitleBar";
import CustomEditor from "./SongCreator";
import SongEditor from "./SongEditor";
import { motion, AnimatePresence } from "framer-motion";
import { useBmusicContext } from "@/Provider/Bmusic";
import { Song } from "@/types";
import { useEastVoiceContext } from "@/Provider/EastVoice";

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
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-8 left-1/2 z-50"
    >
      <div
        className={`flex items-center gap-2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  );
};

export default function EditSong() {
  const {
    selectedSong,
    songRepo,
    setSongRepo,
    theme,
    setTheme,
    songs,
    setSongs,
    refetch,
  } = useBmusicContext();
  const { setCurrentScreen } = useEastVoiceContext();
  const [formData, setFormData] = useState({
    title: selectedSong?.title || "",
    message: selectedSong?.content || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const savedDirectory = localStorage.getItem("songRepoDirectory");
    const savedTheme = localStorage.getItem("bmusictheme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
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
    if (!formData?.title.trim()) {
      showNotification("Please enter a song title!", "error");
      return false;
    }
    if (!formData?.message.trim()) {
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
      showNotification("Song updated successfully! 🎵", "success");
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
      refetch();
      setFormData({ title: "", message: "" });
    } catch (error) {
      console.error("Error saving song:", error);
      showNotification("Failed to save song. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#faeed1]  overflow-hidden">
      <TitleBar />

      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto px-4 h-full">
        <div className="max-w-6xl mx-auto pt-20 pb-8 h-full">
          <div
            className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl h-[calc(100vh-8rem)] 
                        overflow-y-scroll no-scrollbar border border-[#9a674a]/10"
          >
            <div className="flex h-full">
              <div className="p-6 w-[30%] border-b lg:border-b-0 lg:border-r border-[#9a674a]/10">
                <div className="  flex gap-2  items-center">
                  <ArrowLeftCircle
                    className="w-6 h-6 text-[#9a674a] hover:scale-105 hover:cursor-pointer"
                    onClick={() => setCurrentScreen("Songs")}
                  />
                  <Monitor
                    className="w-6 h-6 text-[#9a674a] hover:scale-105 hover:cursor-pointer"
                    onClick={() => {
                      window.api.projectSong(formData);
                      window.api.onDisplaySong((formData) => {
                        // handle songData
                        console.log(`songData: ${formData.title}`);
                      });
                    }}
                  />
                </div>
                <div className="border-b border-[#9a674a]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Music className="w-6 h-6 text-[#9a674a]" />
                      <h1 className="text-2xl font-semibold text-[#9a674a]">
                        Edit song
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-[#9a674a]"
                    >
                      Song Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-[90%] px-4 py-2.5 rounded-lg border-2 border-[#9a674a]/20 
                               focus:border-[#9a674a] focus:outline-none bg-white/50 
                               text-[#9a674a] placeholder-[#9a674a]/50 transition-all"
                      placeholder="Enter your song title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={selectDirectory}
                      className="w-full py-2.5 px-4 hidden bg-white/50 border-2 border-[#9a674a]/20
                               hover:border-[#9a674a] text-[#9a674a] rounded-lg
                               transition-all duration-300  items-center justify-center gap-2
                               focus:outline-none group"
                    >
                      <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Select Directory</span>
                    </button>
                    {songRepo && (
                      <p className="text-sm text-[#9a674a]/70 truncate px-2">
                        📂 {songRepo}
                      </p>
                    )}
                  </div>
                  <form onSubmit={handleSaveSong} className="flex-shrink-0">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-6 py-2.5 bg-[#9a674a] hover:bg-[#8a5739]
                             text-white rounded-lg transition-all duration-300 
                             flex items-center gap-2 shadow-md hover:shadow-lg
                             ${
                               isSaving ? "opacity-70 cursor-not-allowed" : ""
                             }`}
                    >
                      <Save
                        className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`}
                      />
                      <span className="font-medium">
                        {isSaving ? "Saving..." : "Save Song"}
                      </span>
                    </button>
                  </form>
                </div>
              </div>
              <div className="w-[70%] h-[100%]  flex items-center justify-start overflow-x-hidden">
                <style>
                  {`
              .ProseMirror p {
                color: black !important;
              }
              @media (prefers-color-scheme: dark) {
                .ProseMirror p {
                  color: black !important;
                }
              }
            `}
                </style>
                <SongEditor formData={formData} setFormData={setFormData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
