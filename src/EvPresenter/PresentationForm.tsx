// components/PresentationForm.tsx

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Plus,
  Save,
  Loader2,
  BookOpen,
  Film,
  Calendar,
  User,
  MessageSquare,
  Quote as QuoteIcon,
  Image as ImageIcon,
  X as XIcon,
  FolderUp,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation, Scripture, MessagePoint } from "@/types";
import { useTheme } from "@/Provider/Theme";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

interface SermonFormProps {
  initialData?: Partial<Presentation>;
  onSave: () => void;
  onCancel: () => void;
}

// Update input classes to use primary color for focus
const inputClasses =
  "w-full px-4 py-3 rounded-lg border-none border-[#9a674a]/20 dark:border-[#9a674a]/20 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-[#9a674a] transition-all shadow-sm";
const halfInputClasses =
  "w-[80%] px-4 py-3 rounded-lg border-none border-[#9a674a]/20 dark:border-[#9a674a]/20 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-[#9a674a] transition-all shadow-sm";

export const SermonForm: React.FC<SermonFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { createPresentation, savePresentation } = usePresenterOperations();

  // Local path management
  const selectedPath = localStorage.getItem("evpresenterfilespath") || "";
  const { isDarkMode } = useTheme();

  const [title, setTitle] = useState(initialData?.title || "");
  const [preacher, setPreacher] = useState(
    (initialData as any)?.preacher || ""
  );
  const [date, setDate] = useState(
    (initialData as any)?.date || new Date().toISOString().split("T")[0]
  );
  const [scriptures, setScriptures] = useState<Scripture[]>(
    (initialData as any)?.scriptures || []
  );
  const [mainMessage, setMainMessage] = useState(
    (initialData as any)?.mainMessage || ""
  );
  const [mainMessagePoints, setMainMessagePoints] = useState<MessagePoint[]>(
    (initialData as any)?.mainMessagePoints || []
  );
  const [quote, setQuote] = useState((initialData as any)?.quote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newScripture, setNewScripture] = useState("");
  const [newMessagePoint, setNewMessagePoint] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(
    initialData?.backgroundImage || ""
  );
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("evpresenterimagespath") || ""
  );
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  // Load custom images when path changes
  useEffect(() => {
    const loadCustomImages = async () => {
      if (customImagesPath) {
        try {
          const customImages = await window.api.getImages(customImagesPath);
          setAvailableImages(customImages);
        } catch (error) {
          console.error("Failed to load custom images:", error);
        }
      }
    };

    loadCustomImages();
  }, [customImagesPath]);

  const handleSelectImagesDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === "string" && result) {
        setCustomImagesPath(result);
        localStorage.setItem("evpresenterimagespath", result);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  const addScripture = () => {
    if (newScripture.trim()) {
      setScriptures([...scriptures, { text: newScripture.trim() }]);
      setNewScripture("");
    }
  };

  const removeScripture = (index: number) => {
    const updatedScriptures = [...scriptures];
    updatedScriptures.splice(index, 1);
    setScriptures(updatedScriptures);
  };

  const addMessagePoint = () => {
    if (newMessagePoint.trim()) {
      setMainMessagePoints([
        ...mainMessagePoints,
        { text: newMessagePoint.trim() },
      ]);
      setNewMessagePoint("");
    }
  };

  const removeMessagePoint = (index: number) => {
    const updatedPoints = [...mainMessagePoints];
    updatedPoints.splice(index, 1);
    setMainMessagePoints(updatedPoints);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: "scripture" | "messagePoint"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "scripture" && newScripture.trim()) {
        addScripture();
      } else if (type === "messagePoint" && newMessagePoint.trim()) {
        addMessagePoint();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sermonData = {
        type: "sermon" as const,
        title,
        preacher,
        date,
        scriptures,
        mainMessage: mainMessage || undefined,
        mainMessagePoints:
          mainMessagePoints.length > 0 ? mainMessagePoints : undefined,
        quote: quote || undefined,
        slides: initialData?.slides || [],
        backgroundImage,
      };

      if (initialData?.id) {
        await savePresentation(initialData.id, sermonData);
      } else {
        await createPresentation(sermonData);
      }

      onSave();
    } catch (error) {
      console.error("Failed to save sermon:", error);
      // Could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  const randomColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`;
    };
    return {
      color1: generateRandomColor(),
      color2: generateRandomColor(),
      color3: generateRandomColor(),
      color4: generateRandomColor(),
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="h-[98%] max-w-3xl mx-auto">
      <div
        className="bg-[#faeed1] dark:bg-bgray/70 rounded-2xl shadow-xl border border-[#9a674a]/20 dark:border-gray-800 h-full flex flex-col"
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: "#9a674a",
        }}
      >
        {/* Form Header - Fixed */}
        <div className="flex items-center p-6 pb-4 border-b border-[#9a674a]/20 dark:border-gray-800">
          <div className="bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] p-3 rounded-xl text-white shadow-md mr-4">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#9a674a] dark:text-gray-100">
              {initialData?.id ? "Edit Sermon" : "New Sermon"}
            </h2>
            <p className="text-sm text-[#9a674a]/70 dark:text-gray-400">
              Fill in the details below
            </p>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="space-y-5">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter sermon title"
                className={halfInputClasses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {/* Preacher Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                  <div className="flex items-center">
                    <User size={16} className="mr-1" />
                    <span>Preacher</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={preacher}
                  onChange={(e) => setPreacher(e.target.value)}
                  required
                  placeholder="Enter preacher name"
                  className={halfInputClasses}
                />
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={halfInputClasses}
                />
              </div>
            </div>

            {/* Scripture Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  <span>Scriptures</span>
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newScripture}
                  onChange={(e) => setNewScripture(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "scripture")}
                  placeholder="Add scripture reference"
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={addScripture}
                  className="px-4 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] dark:bg-[#8b5a3c] dark:hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {scriptures.map((scripture, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fdf4d0] dark:bg-gray-800/30 border border-[#9a674a]/20 dark:border-gray-700"
                  >
                    <span className="text-sm text-[#9a674a] dark:text-gray-300">
                      {scripture.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeScripture(index)}
                      className="p-1 rounded-full hover:bg-[#9a674a]/10 dark:hover:bg-gray-700 text-[#9a674a] dark:text-gray-400 transition-colors duration-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Image Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-[#9a674a] mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ImageIcon size={16} className="mr-1" />
                    <span>Background Image</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectImagesDirectory}
                    className="flex items-center px-3 py-1.5 text-xs rounded-lg bg-[#9a674a]/10 text-[#9a674a] hover:bg-[#9a674a]/20 transition-colors"
                  >
                    <FolderUp size={14} className="mr-1.5" />
                    Select Folder
                  </button>
                </div>
              </label>

              {/* Image Grid with Overlapping Cards */}
              <div className="relative p-2">
                <div className="flex overflow-x-auto no-scrollbar py-4 px-2">
                  <div className="flex space-x-[-20px]">
                    {availableImages.length > 0 ? (
                      availableImages.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setBackgroundImage(img)}
                          className={`relative w-24 h-16 rounded-lg overflow-hidden hover:translate-y-[-4px] transform transition-all duration-200 ${
                            backgroundImage === img
                              ? "ring-2 ring-[#9a674a] translate-y-[-4px] z-10"
                              : "hover:z-10"
                          }`}
                          style={{
                            boxShadow:
                              backgroundImage === img
                                ? "0 4px 12px rgba(154, 103, 74, 0.2)"
                                : "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Background ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {backgroundImage === img && (
                            <div className="absolute inset-0 bg-[#9a674a]/10 border-2 border-[#9a674a]" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-[#9a674a]/70 w-full">
                        No images available. Select a folder with images.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Image Preview */}
              {backgroundImage && (
                <div className="relative inline-block">
                  <img
                    src={backgroundImage}
                    alt="Selected background"
                    className="w-24 h-16 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setBackgroundImage("")}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Main Message Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                <div className="flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  <span>Main Message (Optional)</span>
                </div>
              </label>
              <textarea
                value={mainMessage}
                onChange={(e) => setMainMessage(e.target.value)}
                placeholder="Enter the main message"
                rows={3}
                className="w-[90%] px-4 py-3 rounded-lg border-none border-[#9a674a]/20 dark:border-gray-700 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-purple-500 transition-all shadow-sm resize-none"
              />
            </div>

            {/* Main Message Points */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                <div className="flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  <span>Message Points (Optional)</span>
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessagePoint}
                  onChange={(e) => setNewMessagePoint(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "messagePoint")}
                  placeholder="Add main message point"
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={addMessagePoint}
                  className="px-4 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] dark:bg-[#8b5a3c] dark:hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {mainMessagePoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#fdf4d0] dark:bg-gray-800/30 border border-[#9a674a]/20 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#9a674a] mt-2"></div>
                    <span className="flex-1 text-sm text-[#9a674a] dark:text-gray-300">
                      {point.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMessagePoint(index)}
                      className="p-1 rounded-full hover:bg-[#9a674a]/10 dark:hover:bg-gray-700 text-[#9a674a] dark:text-gray-400 transition-colors duration-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                <div className="flex items-center">
                  <QuoteIcon size={16} className="mr-1" />
                  <span>Quote (Optional)</span>
                </div>
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Enter a memorable quote"
                rows={2}
                className="w-[90%] px-4 py-3 rounded-lg border-none border-[#9a674a]/20 dark:border-gray-700 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-purple-500 transition-all shadow-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#9a674a]/20 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 rounded-lg border border-[#9a674a]/20 dark:border-gray-700 text-[#9a674a] dark:text-gray-300 hover:bg-[#9a674a]/10 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] dark:bg-[#8b5a3c] transition-colors duration-200 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export const OtherForm: React.FC<SermonFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { createPresentation, savePresentation } = usePresenterOperations();
  const { isDarkMode } = useTheme();

  const [title, setTitle] = useState(initialData?.title || "");
  const [message, setMessage] = useState((initialData as any)?.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    initialData?.backgroundImage || ""
  );
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("evpresenterimagespath") || ""
  );
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  // Load custom images when path changes
  useEffect(() => {
    const loadCustomImages = async () => {
      if (customImagesPath) {
        try {
          const customImages = await window.api.getImages(customImagesPath);
          setAvailableImages(customImages);
        } catch (error) {
          console.error("Failed to load custom images:", error);
        }
      }
    };

    loadCustomImages();
  }, [customImagesPath]);

  const handleSelectImagesDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === "string" && result) {
        setCustomImagesPath(result);
        localStorage.setItem("evpresenterimagespath", result);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const presentationData = {
        type: "other" as const,
        title,
        message,
        slides: initialData?.slides || [],
        backgroundImage,
      };

      if (initialData?.id) {
        await savePresentation(initialData.id, presentationData);
      } else {
        await createPresentation(presentationData);
      }

      onSave();
    } catch (error) {
      console.error("Failed to save presentation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const randomColors = useMemo(() => {
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`;
    };
    return {
      color1: generateRandomColor(),
      color2: generateRandomColor(),
      color3: generateRandomColor(),
      color4: generateRandomColor(),
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="h-[98%] max-w-3xl mx-auto">
      <div
        className="bg-[#faeed1] dark:bg-bgray/70 rounded-2xl shadow-xl border border-[#9a674a]/20 dark:border-gray-800 h-full flex flex-col"
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: isDarkMode ? "purple" : "#9a674a",
        }}
      >
        {/* Form Header */}
        <div className="flex items-center p-6 pb-4 border-b border-[#9a674a]/20 dark:border-gray-800">
          <div className="bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] p-3 rounded-xl text-white shadow-md mr-4">
            <Film size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#9a674a] dark:text-gray-100">
              {initialData?.id ? "Edit Presentation" : "New Presentation"}
            </h2>
            <p className="text-sm text-[#9a674a]/70 dark:text-gray-400">
              Fill in the details below
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="space-y-5">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter presentation title"
                className={halfInputClasses}
              />
            </div>

            {/* Background Image Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-[#9a674a] mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ImageIcon size={16} className="mr-1" />
                    <span>Background Image</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectImagesDirectory}
                    className="flex items-center px-3 py-1.5 text-xs rounded-lg bg-[#9a674a]/10 text-[#9a674a] hover:bg-[#9a674a]/20 transition-colors"
                  >
                    <FolderUp size={14} className="mr-1.5" />
                    Select Folder
                  </button>
                </div>
              </label>

              {/* Image Grid with Overlapping Cards */}
              <div className="relative p-2">
                <div className="flex overflow-x-auto no-scrollbar py-4 px-2">
                  <div className="flex space-x-[-20px]">
                    {availableImages.length > 0 ? (
                      availableImages.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setBackgroundImage(img)}
                          className={`relative w-24 h-16 rounded-lg overflow-hidden hover:translate-y-[-4px] transform transition-all duration-200 ${
                            backgroundImage === img
                              ? "ring-2 ring-[#9a674a] translate-y-[-4px] z-10"
                              : "hover:z-10"
                          }`}
                          style={{
                            boxShadow:
                              backgroundImage === img
                                ? "0 4px 12px rgba(154, 103, 74, 0.2)"
                                : "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Background ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {backgroundImage === img && (
                            <div className="absolute inset-0 bg-[#9a674a]/10 border-2 border-[#9a674a]" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-[#9a674a]/70 w-full">
                        No images available. Select a folder with images.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Image Preview */}
              {backgroundImage && (
                <div className="relative inline-block">
                  <img
                    src={backgroundImage}
                    alt="Selected background"
                    className="w-24 h-16 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setBackgroundImage("")}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Enter presentation message"
                rows={4}
                className={`${inputClasses} min-h-[120px] resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="p-6 border-t border-[#9a674a]/20 dark:border-gray-800 flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border-2 border-[#9a674a] dark:border-purple-500 text-[#9a674a] dark:text-purple-400 hover:bg-[#9a674a]/5 dark:hover:bg-purple-500/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] text-white hover:from-[#8b5a3c] hover:to-[#9a674a] transition-all flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
