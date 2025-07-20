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
  Edit2,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation, Scripture, MessagePoint, Quote } from "@/types";
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
  const [quotes, setQuotes] = useState<Quote[]>(
    (initialData as any)?.quotes || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newScripture, setNewScripture] = useState("");
  const [newMessagePoint, setNewMessagePoint] = useState("");
  const [newQuoteReference, setNewQuoteReference] = useState("");
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteProphetInitials, setNewQuoteProphetInitials] = useState("");
  const [newQuotePreacherImage, setNewQuotePreacherImage] = useState("");
  const [editingQuoteIndex, setEditingQuoteIndex] = useState<number | null>(
    null
  );
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

  const addQuote = () => {
    if (newQuoteText.trim()) {
      const newQuote: Quote = {
        text: newQuoteText.trim(),
        reference: newQuoteReference.trim() || undefined,
        prophetInitials: newQuoteProphetInitials.trim() || undefined,
        preacherImage: newQuotePreacherImage.trim() || undefined,
      };

      if (editingQuoteIndex !== null) {
        // Update existing quote
        const updatedQuotes = [...quotes];
        updatedQuotes[editingQuoteIndex] = newQuote;
        setQuotes(updatedQuotes);
        setEditingQuoteIndex(null);
      } else {
        // Add new quote
        setQuotes([...quotes, newQuote]);
      }

      setNewQuoteReference("");
      setNewQuoteText("");
      setNewQuoteProphetInitials("");
      setNewQuotePreacherImage("");
    }
  };

  const editQuote = (index: number) => {
    const quote = quotes[index];
    setNewQuoteReference(quote.reference || "");
    setNewQuoteText(quote.text);
    setNewQuoteProphetInitials(quote.prophetInitials || "");

    // Map the preacher image to the correct initials when editing
    if (quote.preacherImage === "./bob.jpg") {
      setNewQuotePreacherImage("./bob.jpg");
      // Ensure initials match if not already set
      if (!quote.prophetInitials) {
        setNewQuoteProphetInitials("R.L.L");
      }
    } else if (quote.preacherImage === "./wmb.jpeg") {
      setNewQuotePreacherImage("./wmb.jpeg");
      // Ensure initials match if not already set
      if (!quote.prophetInitials) {
        setNewQuoteProphetInitials("WMB");
      }
    } else {
      setNewQuotePreacherImage(quote.preacherImage || "");
    }

    setEditingQuoteIndex(index);
  };

  const cancelEditQuote = () => {
    setNewQuoteReference("");
    setNewQuoteText("");
    setNewQuoteProphetInitials("");
    setNewQuotePreacherImage("");
    setEditingQuoteIndex(null);
  };

  const removeQuote = (index: number) => {
    // Show confirmation dialog before deleting
    const quote = quotes[index];
    const previewText =
      quote.text.substring(0, 100) + (quote.text.length > 100 ? "..." : "");
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this quote?\n\n"${previewText}"`
    );

    if (confirmDelete) {
      const updatedQuotes = [...quotes];
      updatedQuotes.splice(index, 1);
      setQuotes(updatedQuotes);

      // If we're editing this quote, cancel the edit
      if (editingQuoteIndex === index) {
        cancelEditQuote();
      } else if (editingQuoteIndex !== null && editingQuoteIndex > index) {
        // Adjust editing index if needed
        setEditingQuoteIndex(editingQuoteIndex - 1);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: "scripture" | "messagePoint" | "quote"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "scripture" && newScripture.trim()) {
        addScripture();
      } else if (type === "messagePoint" && newMessagePoint.trim()) {
        addMessagePoint();
      } else if (type === "quote" && newQuoteText.trim()) {
        addQuote();
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
        quotes: quotes.length > 0 ? quotes : undefined,
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
                  className="px-4 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] dark:bg-[#9a674a] dark:hover:bg-[#8b5a3c] transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {scriptures.map((scripture, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 group rounded-full bg-[#fdf4d0] dark:bg-stone-800/30 border border-dashed border-[#9a674a]/20 dark:border-gray-700"
                  >
                    <span className="text-sm text-[#9a674a] dark:text-gray-300">
                      {scripture.text}
                    </span>
                    <div
                      // type="div"
                      onClick={() => removeScripture(index)}
                      className="p-1 h-4 w-4 hidden group-hover:flex cursor-pointer  rounded-full bg-red-700 text-center hover:bg-red-700 dark:hover:bg-red-700 text-[#9a674a] dark:text-gray-400 transition-colors duration-200"
                    >
                      <X size={14} />
                    </div>
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
                        <div
                          key={index}
                          onClick={() => setBackgroundImage(img)}
                          className={`relative w-16 h-16 rounded-full overflow-hidden hover:translate-y-[-4px] transform transition-all duration-200 cursor-pointer ${
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
                        </div>
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
                    className="w-16 h-16 object-cover rounded-full shadow-md"
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
                  className="px-4 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] dark:bg-[#9a674a] dark:hover:bg-[#8b5a3c] transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {mainMessagePoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#fdf4d0] dark:bg-stone-800/30 border border-dashed border-[#9a674a]/20 dark:border-stone-300"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#9a674a] mt-2"></div>
                    <span className="flex-1 text-sm text-[#9a674a] dark:text-gray-300">
                      {point.text}
                    </span>
                    <div
                      // type="div"
                      onClick={() => removeMessagePoint(index)}
                      className="p-1 h-4 w-4 cursor-pointer rounded-full bg-red-700 hover:bg-red-700 dark:hover:bg-red-700 text-white  transition-colors duration-200"
                    >
                      <X size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes Input - New Tag-Based System */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#9a674a] dark:text-gray-300">
                <div className="flex items-center">
                  <QuoteIcon size={16} className="mr-1" />
                  <span>Quotes (Optional)</span>
                </div>
              </label>

              {/* Quote input fields */}
              <div className="space-y-3 p-4 bg-[#fdf4d0]/50 dark:bg-bgray/50 rounded-lg border border-[#9a674a]/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newQuoteReference}
                    onChange={(e) => setNewQuoteReference(e.target.value)}
                    placeholder="Quote reference (e.g., Isaiah 1:18)"
                    className="px-3 py-2 rounded-lg border-none border-[#9a674a]/20 dark:border-[#9a674a]/20 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-[#9a674a] transition-all shadow-sm text-sm"
                  />
                  <input
                    type="text"
                    value={newQuoteProphetInitials}
                    onChange={(e) => setNewQuoteProphetInitials(e.target.value)}
                    placeholder="Prophet's initials (auto-filled when selecting preacher)"
                    className="px-3 py-2 rounded-lg border-none border-[#9a674a]/20 dark:border-[#9a674a]/20 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-[#9a674a] transition-all shadow-sm text-sm"
                  />

                  {/* Preacher Selection by Initials */}
                  <div className="flex gap-2">
                    <div
                      onClick={() => {
                        setNewQuotePreacherImage("/bob.jpg");
                        setNewQuoteProphetInitials("R.L.L");
                      }}
                      className={`cursor-pointer rounded-full h-10 w-10 flex items-center justify-center border transition-all duration-200 text-xs font-bold ${
                        newQuotePreacherImage === "/bob.jpg"
                          ? "bg-[#9a674a] border-[#9a674a] ring-2 ring-[#9a674a]/50 text-white"
                          : "bg-[#fdf4d0] dark:bg-bgray border-[#9a674a]/20 hover:bg-[#9a674a]/10 text-[#9a674a] dark:text-gray-300"
                      }`}
                      title="R.L.L - Select Bob's image"
                    >
                      R.L.L
                    </div>
                    <div
                      onClick={() => {
                        setNewQuotePreacherImage("/wmb.jpeg");
                        setNewQuoteProphetInitials("WMB");
                      }}
                      className={`cursor-pointer rounded-full h-10 w-10 flex items-center justify-center border transition-all duration-200 text-xs font-bold ${
                        newQuotePreacherImage === "/wmb.jpeg"
                          ? "bg-[#9a674a] border-[#9a674a] ring-2 ring-[#9a674a]/50 text-white"
                          : "bg-[#fdf4d0] dark:bg-bgray border-[#9a674a]/20 hover:bg-[#9a674a]/10 text-[#9a674a] dark:text-gray-300"
                      }`}
                      title="WMB - Select WMB's image"
                    >
                      WMB
                    </div>
                  </div>
                </div>

                {/* Selected preacher image preview */}
                {/* {newQuotePreacherImage && (
                  <div className="flex items-center gap-2 p-2 bg-[#9a674a]/10 dark:bg-gray-800/50 rounded-lg">
                    <img
                      src={newQuotePreacherImage}
                      alt="Selected preacher"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-xs text-[#9a674a] dark:text-gray-300">
                      Selected:{" "}
                      {newQuotePreacherImage
                        .replace("./", "")
                        .split(".")[0]
                        .toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewQuotePreacherImage("")}
                      className="ml-auto p-1 rounded-full hover:bg-[#9a674a]/20 text-[#9a674a] dark:text-gray-400"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                )} */}
                <div className="flex gap-2">
                  <textarea
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        e.preventDefault();
                        addQuote();
                      }
                    }}
                    placeholder="Enter the quote text"
                    rows={10}
                    className="flex-1 px-3 no-scrollbar py-2 rounded-lg border-none border-[#9a674a]/20 dark:border-[#9a674a]/20 bg-[#fdf4d0] dark:bg-bgray text-[#9a674a] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a674a] dark:focus:ring-[#9a674a] transition-all shadow-sm resize-none text-sm"
                  />
                  <div
                    // type="div"
                    onClick={
                      editingQuoteIndex !== null ? cancelEditQuote : addQuote
                    }
                    // disabled={!newQuoteText.trim()}/
                    className={`px-4 py-2 h-8  rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 ${
                      editingQuoteIndex !== null
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#9a674a] hover:bg-[#8b5a3c]"
                    }`}
                  >
                    {editingQuoteIndex !== null ? (
                      <>
                        <X size={16} />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add
                      </>
                    )}
                  </div>
                  {editingQuoteIndex !== null && (
                    <div
                      // type="div"
                      onClick={addQuote}
                      // disabled={!newQuoteText.trim()}
                      className="px-4 py-2 h-8 rounded-lg bg-primary text-white hove disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                    >
                      <Save size={16} />
                      Update
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#9a674a]/70 dark:text-gray-400">
                  {editingQuoteIndex !== null
                    ? "Currently editing a quote. Update it or cancel to add a new one."
                    : "Press Ctrl+Enter in the text area or click Add to add the quote"}
                </p>
              </div>

              {/* Quote tags display */}
              <div className="flex flex-wrap gap-2">
                {quotes.map((quoteItem, index) => {
                  return (
                    <div
                      key={index}
                      className={`inline-flex flex-col gap-1 p-3 rounded-xl border-dashed border shadow-sm max-w-xs transition-all duration-200 ${
                        editingQuoteIndex === index
                          ? "bg-stone-50 dark:bg-primary/20 border-primary dark:border-primary ring-2 ring-primary dark:ring-primary"
                          : "bg-[#fdf4d0] dark:bg-stone-800/30 border-[#9a674a]/20 dark:border-stone-700"
                      }`}
                    >
                      {/* Quote header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Preacher image avatar */}
                          {quoteItem.preacherImage && (
                            <img
                              src={quoteItem.preacherImage}
                              alt="Preacher"
                              className="w-6 h-6 rounded-full object-cover border-2 border-[#9a674a]/20"
                            />
                          )}
                          {quoteItem.reference && (
                            <span className="text-xs font-medium text-[#9a674a] dark:text-gray-400">
                              {quoteItem.reference}
                            </span>
                          )}
                          {quoteItem.prophetInitials && (
                            <span className="text-xs px-2 py-0.5 bg-[#9a674a]/10 text-[#9a674a] dark:bg-gray-700 dark:text-gray-300 rounded-full font-bold">
                              {quoteItem.prophetInitials}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            onClick={() => editQuote(index)}
                            className="p-1 h-4 w-4 bg-red-700 text-white rounded-full  dark:hover:bg-red-700  dark:text-gray-400 transition-colors duration-200"
                            title="Edit quote"
                          >
                            <Edit2 size={10} />
                          </div>
                          <div
                            onClick={() => removeQuote(index)}
                            className="p-1 h-4 w-4 bg-red-700 text-white rounded-full  dark:hover:bg-red-700  dark:text-gray-400 transition-colors duration-200"
                            title="Remove quote"
                          >
                            <X size={12} />
                          </div>
                        </div>
                      </div>
                      {/* Quote text */}
                      <p className="text-sm text-[#9a674a] dark:text-gray-300 line-clamp-3">
                        "{quoteItem.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#9a674a]/20 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] dark:bg-[#9a674a] dark:hover:bg-[#8b5a3c] transition-colors duration-200 flex items-center gap-2"
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
