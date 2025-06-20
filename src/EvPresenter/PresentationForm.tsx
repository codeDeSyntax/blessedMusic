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
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation, Scripture } from "@/types";
import { useTheme } from "@/Provider/Theme";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";
import { updatePresentation } from "@/store/slices/presenterSlice";

interface SermonFormProps {
  initialData?: Partial<Presentation>;
  onSave: () => void;
  onCancel: () => void;
}

export const SermonForm: React.FC<SermonFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { createPresentation } = usePresenterOperations();
  
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
  const [quote, setQuote] = useState((initialData as any)?.quote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newScripture, setNewScripture] = useState("");

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newScripture.trim()) {
      e.preventDefault();
      addScripture();
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
        quote: quote || undefined,
      };

      if (initialData?.id) {
        console.log("Update sermon:", initialData.id, sermonData); // TODO: Implement update
      } else {
        await createPresentation({
          ...sermonData,
          id: "",
          slides: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div
        className="bg-white dark:bg-bgray/70 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: isDarkMode ? "purple" : randomColors.color3,
        }}
      >
        {/* Form Header */}
        <div className="flex items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl text-white shadow-md mr-4">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {initialData?.id ? "Edit Sermon" : "New Sermon"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the details below
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter sermon title"
              className="w-1/2 px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Preacher Input */}
            <div className="space-y-2 ">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-[80%] px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
              />
            </div>

            {/* Date Input */}
            <div className="space-y-2 ">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-[80%] px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 placeholder:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Scriptures Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scriptures
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newScripture}
                onChange={(e) => setNewScripture(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add scripture reference (e.g., Revelation 10:1)"
                className="flex-1 px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addScripture}
                className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
              </motion.button>
            </div>

            <div className="mt-2 max-h-40 overflow-y-auto pr-1 space-y-2">
              {scriptures.length === 0 ? (
                <p className="text-sm italic text-gray-500 dark:text-gray-400 py-2">
                  No scriptures added yet
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-2">
                  {scriptures.map((scripture, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/30 rounded-full w-auto"
                    >
                      <span className="text-gray-50 dark:text-indigo-300 mr-2 ">
                        {scripture.text}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeScripture(index)}
                        className="flex-shrink-0 h-6 w-6 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                      >
                        <X size={16} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-1" />
                <span>Main Message (Optional)</span>
              </div>
            </label>
            <textarea
              value={mainMessage}
              onChange={(e) => setMainMessage(e.target.value)}
              rows={4}
              placeholder="Enter the main message or summary"
              className="w-[90%] px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
            />
          </div>

          {/* Quote */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <QuoteIcon size={16} className="mr-1" />
                <span>Quote (Optional)</span>
              </div>
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              placeholder="Enter a memorable quote from the sermon"
              className="w-[90%] px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-4 pt-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all ${
            isSubmitting ? "opacity-80" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              <span>Save Sermon</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
};

export const OtherForm: React.FC<SermonFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { createPresentation } = usePresenterOperations();

  const [title, setTitle] = useState(initialData?.title || "");
  const [message, setMessage] = useState((initialData as any)?.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const otherData = {
        type: "other" as const,
        title,
        message,
      };

      if (initialData?.id) {
        console.log("Update presentation:", initialData.id, otherData); // TODO: Implement update
      } else {
        await createPresentation({
          ...otherData,
          id: "",
          slides: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      onSave();
    } catch (error) {
      console.error("Failed to save presentation:", error);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div
        className="bg-white dark:bg-bgray/70 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: isDarkMode ? "purple" : randomColors.color3,
        }}
      >
        {/* Form Header */}
        <div className="flex items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl text-white shadow-md mr-4">
            <Film size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {initialData?.id ? "Edit Presentation" : "New Presentation"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the details below
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter presentation title"
              className="w-[90%] px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-1" />
                <span>Message</span>
              </div>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={12}
              placeholder="Enter your presentation content or notes here"
              className="w-[90%] px-4 py-3 rounded-lg border-none border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bgray text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-4 pt-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all ${
            isSubmitting ? "opacity-80" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              <span>Save Presentation</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
};
