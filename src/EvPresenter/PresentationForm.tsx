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
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation, Scripture, MessagePoint, Quote } from "@/types";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

interface SermonFormProps {
  initialData?: Partial<Presentation>;
  onSave: () => void;
  onCancel: () => void;
}

// Update input classes to use primary color for focus
const inputClass =
  "w-full px-4 py-3 rounded-lg border border-[#606060]/30 bg-[#3a3a3a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] focus:border-[#808080] transition-all shadow-sm";
const miniInputClass =
  "w-[80%] px-4 py-3 rounded-lg border border-[#606060]/30 bg-[#3a3a3a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] focus:border-[#808080] transition-all shadow-sm";
const halfInputClasses =
  "w-[90%] px-4 py-3 rounded-lg border border-[#606060]/30 bg-[#1a1a1a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] focus:border-[#808080] transition-all shadow-sm";
const inputClasses =
  "w-[90%] px-4 py-3 rounded-lg border border-[#606060]/30 bg-[#1a1a1a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] focus:border-[#808080] transition-all shadow-sm";

export const SermonForm: React.FC<SermonFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { createPresentation, savePresentation } = usePresenterOperations();

  // Local path management
  const selectedPath = localStorage.getItem("evpresenterfilespath") || "";

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
    initialData?.backgroundImage || "./evdefault.jpg"
  );
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("evpresenterimagespath") || ""
  );
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [defaultImages] = useState<string[]>([
    "./wood10.jpg",
    "./wood6.jpg",
    "./wood2.jpg",
    "./snow2.jpg",
  ]);
  const [allImages, setAllImages] = useState<string[]>([]);

  // Load images (custom only or fallback to specific defaults)
  useEffect(() => {
    const loadAllImages = async () => {
      if (customImagesPath) {
        try {
          const customImages = await window.api.getImages(customImagesPath);
          if (customImages && customImages.length > 0) {
            setAvailableImages(customImages);
            setAllImages(customImages); // Only custom images when available
            return;
          } else {
            console.log(
              "No images found in custom directory, using fallback images"
            );
          }
        } catch (error) {
          console.error("Failed to load custom images:", error);
          console.log("Error loading custom images, using fallback images");
        }
      }

      // Fallback to specific default images only
      setAvailableImages(defaultImages);
      setAllImages(defaultImages);
    };

    loadAllImages();
  }, [customImagesPath, defaultImages]);

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

  const handleRefreshImages = async () => {
    const savedPath = localStorage.getItem("evpresenterimagespath");

    if (savedPath) {
      try {
        const customImages = await window.api.getImages(savedPath);
        if (customImages && customImages.length > 0) {
          setAvailableImages(customImages);
          setAllImages(customImages);
          return;
        } else {
          console.log(
            "No images found in custom directory, using fallback images"
          );
        }
      } catch (error) {
        console.error("Failed to refresh custom images:", error);
        console.log("Error refreshing custom images, using fallback images");
      }
    }

    // Fallback to specific default images only
    setAvailableImages(defaultImages);
    setAllImages(defaultImages);
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
        className="bg-[#272727] rounded-2xl shadow-xl border border-[#606060]/30 h-full flex flex-col"
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: "#404040",
        }}
      >
        {/* Form Header - Fixed */}
        <div className="flex items-center p-6 pb-4 border-b border-[#404040]/20">
          <div className="bg-gradient-to-r from-[#404040] to-[#505050] p-3 rounded-xl text-white shadow-md mr-4">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#f5f5f5]">
              {initialData?.id ? "Edit Sermon" : "New Sermon"}
            </h2>
            <p className="text-sm text-[#808080]">Fill in the details below</p>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="space-y-5">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f5f5f5]">
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
                <label className="block text-sm font-medium text-[#f5f5f5]">
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
                <label className="block text-sm font-medium text-[#f5f5f5]">
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
              <label className="block text-sm font-medium text-[#f5f5f5]">
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
                  className="px-4 py-2 rounded-lg bg-[#404040] text-white hover:bg-[#505050] transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {scriptures.map((scripture, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 group rounded-full bg-[#404040] border border-dashed border-[#606060]/30"
                  >
                    <span className="text-sm text-[#f5f5f5]">
                      {scripture.text}
                    </span>
                    <div
                      onClick={() => removeScripture(index)}
                      className="p-1 h-4 w-4 hidden group-hover:flex cursor-pointer rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                    >
                      <X size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Message Points */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#f5f5f5]">
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
                  className="px-4 py-2 rounded-lg bg-[#404040] text-white hover:bg-[#505050] transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {mainMessagePoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#404040] border border-dashed border-[#606060]/30"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#606060] mt-2"></div>
                    <span className="flex-1 text-sm text-[#f5f5f5]">
                      {point.text}
                    </span>
                    <div
                      onClick={() => removeMessagePoint(index)}
                      className="p-1 h-4 w-4 cursor-pointer rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                    >
                      <X size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes Input - New Tag-Based System */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#f5f5f5]">
                <div className="flex items-center">
                  <QuoteIcon size={16} className="mr-1" />
                  <span>Quotes (Optional)</span>
                </div>
              </label>

              {/* Quote input fields */}
              <div className="space-y-3 p-4 bg-[#404040] rounded-lg border border-[#606060]/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newQuoteReference}
                    onChange={(e) => setNewQuoteReference(e.target.value)}
                    placeholder="reference (e.g., Stature of a pe...p56)"
                    className="px-3 py-2 rounded-lg border border-[#606060]/30 bg-[#3a3a3a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] transition-all shadow-sm text-sm"
                  />
                  <input
                    type="text"
                    value={newQuoteProphetInitials}
                    onChange={(e) => setNewQuoteProphetInitials(e.target.value)}
                    placeholder="initials (auto-filled when selecting preacher)"
                    className="px-3 py-2 rounded-lg border border-[#606060]/30 bg-[#3a3a3a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] transition-all shadow-sm text-sm"
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
                          ? "bg-[#606060] border-[#606060] ring-2 ring-[#606060]/50 text-white"
                          : "bg-[#3a3a3a] border-[#606060]/20 hover:bg-[#606060]/10 text-[#f5f5f5]"
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
                          ? "bg-[#606060] border-[#606060] ring-2 ring-[#606060]/50 text-white"
                          : "bg-[#3a3a3a] border-[#606060]/20 hover:bg-[#606060]/10 text-[#f5f5f5]"
                      }`}
                      title="WMB - Select WMB's image"
                    >
                      WMB
                    </div>
                  </div>
                </div>

                {/* Selected preacher image preview - Removed, not needed for current theme */}
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
                    className="flex-1 px-4 py-3 rounded-lg border border-[#606060]/30 bg-[#3a3a3a] text-[#f5f5f5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#606060] focus:border-[#808080] transition-all shadow-sm resize-none"
                  />
                  <div
                    // type="div"
                    onClick={
                      editingQuoteIndex !== null ? cancelEditQuote : addQuote
                    }
                    // disabled={!newQuoteText.trim()}/
                    className={`px-4 py-2 h-8 cursor-pointer  rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 ${
                      editingQuoteIndex !== null
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-[#404040] hover:bg-[#8b5a3c]"
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
                <p className="text-xs text-[#808080]">
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
                          ? "bg-[#505050] border-[#606060] ring-2 ring-[#606060]"
                          : "bg-[#2f2f2f] border-[#606060]/30"
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
                              className="w-6 h-6 rounded-full object-cover border-2 border-[#606060]/20"
                            />
                          )}
                          {quoteItem.reference && (
                            <span className="text-xs font-medium text-[#d0d0d0]">
                              {quoteItem.reference}
                            </span>
                          )}
                          {quoteItem.prophetInitials && (
                            <span className="text-xs px-2 py-0.5 bg-[#606060]/20 text-[#f5f5f5] rounded-full font-bold">
                              {quoteItem.prophetInitials}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            onClick={() => editQuote(index)}
                            className="p-1 h-4 w-4 bg-primary hover:bg-primary/30 text-white rounded-full cursor-pointer transition-colors duration-200"
                            title="Edit quote"
                          >
                            <Edit2 size={10} />
                          </div>
                          <div
                            onClick={() => removeQuote(index)}
                            className="p-1 h-4 w-4 bg-red-500 hover:bg-red-600 text-white rounded-full cursor-pointer transition-colors duration-200"
                            title="Remove quote"
                          >
                            <X size={12} />
                          </div>
                        </div>
                      </div>
                      {/* Quote text */}
                      <p className="text-sm text-[#f5f5f5] line-clamp-3">
                        "{quoteItem.text}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Background Image Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#f5f5f5]">
                <div className="flex items-center">
                  <ImageIcon size={16} className="mr-1" />
                  <span>Background Image</span>
                </div>
              </label>

              {/* Custom Directory Controls */}
              <div className="bg-[#404040] rounded-lg p-3 border border-[#606060]/30">
                <div className="space-y-3">
                  {/* Current Path Display and Controls */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#f5f5f5]/70">
                      {customImagesPath
                        ? "Custom images:"
                        : "Using default images"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRefreshImages}
                        className="p-1.5 rounded bg-[#3a3a3a] hover:bg-[#505050] transition-colors"
                        title="Refresh images"
                      >
                        <RefreshCw size={12} className="text-[#f5f5f5]/80" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectImagesDirectory}
                        className="p-1.5 rounded bg-[#3a3a3a] hover:bg-[#505050] transition-colors"
                        title="Select custom images folder"
                      >
                        <FolderOpen size={12} className="text-[#f5f5f5]/80" />
                      </button>
                      {customImagesPath && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomImagesPath("");
                            localStorage.removeItem("evpresenterimagespath");
                          }}
                          className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
                          title="Use default images"
                        >
                          <X size={12} className="text-[#f5f5f5]/80" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Path Display */}
                  {customImagesPath && (
                    <div className="text-xs text-[#f5f5f5]/60 truncate bg-[#1a1a1a] rounded px-3 py-2">
                      {customImagesPath}
                    </div>
                  )}

                  {/* Background Images Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#f5f5f5]/70">
                        Selected:{" "}
                        {backgroundImage
                          ? backgroundImage.split("/").pop()
                          : "None"}
                      </span>
                      <span className="text-xs text-[#f5f5f5]/60">
                        {allImages.length} image
                        {allImages.length !== 1 ? "s" : ""} available
                      </span>
                    </div>

                    <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                      {allImages.length > 0 ? (
                        allImages.map((image, index) => (
                          <div
                            key={index}
                            className={`relative flex-shrink-0 transition-all duration-300 ${
                              index > 0 ? "-ml-4" : ""
                            } ${
                              backgroundImage === image
                                ? "z-20 scale-110 ring-2 ring-[#606060]/80"
                                : "z-10 hover:z-15 hover:scale-105"
                            }`}
                          >
                            <div
                              onClick={() => setBackgroundImage(image)}
                              className="block cursor-pointer"
                              title={image.split("/").pop()}
                            >
                              <div
                                className="w-12 h-12 rounded-full border-2 border-[#606060]/50 bg-cover bg-center shadow-lg hover:border-[#606060] transition-all"
                                style={{
                                  backgroundImage: `url(${image})`,
                                }}
                              />
                              {/* Selection indicator */}
                              {backgroundImage === image && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#272727] flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#f5f5f5]/60 text-center py-4 w-full">
                          No images found
                        </div>
                      )}
                    </div>

                    {/* Current selection preview */}
                    {backgroundImage && (
                      <div className="mt-3 p-2 bg-[#3a3a3a] rounded-lg border border-[#606060]/30">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-12 rounded bg-cover bg-center border border-[#606060]/50"
                            style={{
                              backgroundImage: `url(${backgroundImage})`,
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-[#f5f5f5]">
                              Current Background
                            </div>
                            <div className="text-xs text-[#f5f5f5]/70 truncate">
                              {backgroundImage.split("/").pop()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#404040]/20">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-[#404040] text-white hover:bg-[#505050] transition-colors duration-200 flex items-center gap-2"
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
