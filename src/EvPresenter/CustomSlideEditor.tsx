// components/CustomSlideEditor.tsx

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Save,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Trash2,
  Move,
  Edit3,
  ArrowLeft,
  Settings,
  Palette,
  X,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Slide, SlideElement, EvCustom } from "@/types";
import { useTheme } from "@/Provider/Theme";

interface CustomSlideEditorProps {
  initialData?: Partial<EvCustom>;
  onSave: () => void;
  onCancel: () => void;
}

export const CustomSlideEditor: React.FC<CustomSlideEditorProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { createPresentation, savePresentation } = usePresenterOperations();
  const { isDarkMode } = useTheme();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [slides, setSlides] = useState<Slide[]>(initialData?.slides || []);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [backgroundImage, setBackgroundImage] = useState(
    initialData?.backgroundImage || ""
  );

  // Create initial slide if none exist
  useEffect(() => {
    if (slides.length === 0) {
      const initialSlide: Slide = {
        id: `slide-${Date.now()}`,
        type: "custom",
        title: "New Slide",
        elements: [],
        background: backgroundImage,
      };
      setSlides([initialSlide]);
    }
  }, []);

  const currentSlide = slides[currentSlideIndex] || null;

  const addNewSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      type: "custom",
      title: `Slide ${slides.length + 1}`,
      elements: [],
      background: backgroundImage,
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
    }
  };

  const addTextElement = () => {
    if (!currentSlide) return;

    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type: "text",
      content: "Click to edit text",
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      style: {
        fontSize: 24,
        fontWeight: "normal",
        color: "#9a674a",
        backgroundColor: "transparent",
      },
    };

    const updatedSlide: Slide = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement],
    };

    const updatedSlides = slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    );
    setSlides(updatedSlides);
  };

  const addShapeElement = (shapeType: "rectangle" | "circle") => {
    if (!currentSlide) return;

    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type: "shape",
      content: shapeType,
      position: { x: 150, y: 150 },
      size: { width: 100, height: 100 },
      style: {
        backgroundColor: "#9a674a",
        borderRadius: shapeType === "circle" ? 50 : 8,
      },
    };

    const updatedSlide: Slide = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement],
    };

    const updatedSlides = slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    );
    setSlides(updatedSlides);
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    if (!currentSlide) return;

    const updatedElements = (currentSlide.elements || []).map((element) =>
      element.id === elementId ? { ...element, ...updates } : element
    );

    const updatedSlide: Slide = {
      ...currentSlide,
      elements: updatedElements,
    };

    const updatedSlides = slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    );
    setSlides(updatedSlides);
  };

  const deleteElement = (elementId: string) => {
    if (!currentSlide) return;

    const updatedElements = (currentSlide.elements || []).filter(
      (element) => element.id !== elementId
    );

    const updatedSlide: Slide = {
      ...currentSlide,
      elements: updatedElements,
    };

    const updatedSlides = slides.map((slide, index) =>
      index === currentSlideIndex ? updatedSlide : slide
    );
    setSlides(updatedSlides);
    setSelectedElement(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your presentation");
      return;
    }

    setIsSubmitting(true);
    try {
      const presentationData: EvCustom = {
        id: initialData?.id || `custom-${Date.now()}`,
        type: "custom",
        title: title.trim(),
        description: description.trim(),
        slides,
        backgroundImage,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.id) {
        await savePresentation(initialData.id, presentationData);
      } else {
        await createPresentation(presentationData);
      }

      onSave();
    } catch (error) {
      console.error("Failed to save custom presentation:", error);
      alert("Failed to save presentation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#faeed1] dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-900/50 border-b border-[#9a674a]/20">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Presentation Title"
              className="text-xl font-bold bg-transparent border-none outline-none text-[#9a674a] dark:text-white placeholder-[#9a674a]/50"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="block text-sm bg-transparent border-none outline-none text-[#9a674a]/70 dark:text-gray-400 placeholder-[#9a674a]/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isPreviewMode
                ? "bg-[#9a674a] text-white"
                : "bg-[#9a674a]/10 text-[#9a674a] hover:bg-[#9a674a]/20"
            }`}
          >
            {isPreviewMode ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-[#9a674a] text-white hover:bg-[#8b5a3c] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      <div className="flex-1 flex">
        {/* Sidebar - Tools */}
        {!isPreviewMode && (
          <div className="w-64 bg-white/30 dark:bg-gray-900/30 border-r border-[#9a674a]/20 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#9a674a] dark:text-gray-300 mb-2">
                  Add Elements
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={addTextElement}
                    className="w-full p-2 rounded-lg bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] transition-colors flex items-center gap-2"
                  >
                    <Type size={16} />
                    Text
                  </button>
                  <button
                    onClick={() => addShapeElement("rectangle")}
                    className="w-full p-2 rounded-lg bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] transition-colors flex items-center gap-2"
                  >
                    <Square size={16} />
                    Rectangle
                  </button>
                  <button
                    onClick={() => addShapeElement("circle")}
                    className="w-full p-2 rounded-lg bg-[#9a674a]/10 hover:bg-[#9a674a]/20 text-[#9a674a] transition-colors flex items-center gap-2"
                  >
                    <Circle size={16} />
                    Circle
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#9a674a] dark:text-gray-300 mb-2">
                  Slides
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        index === currentSlideIndex
                          ? "border-[#9a674a] bg-[#9a674a]/10"
                          : "border-transparent bg-white/20 hover:bg-white/30"
                      }`}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#9a674a] dark:text-gray-300">
                          {slide.title}
                        </span>
                        {slides.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(index);
                            }}
                            className="p-1 rounded hover:bg-red-100 text-red-500"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addNewSlide}
                    className="w-full p-2 rounded-lg border-2 border-dashed border-[#9a674a]/50 text-[#9a674a] hover:bg-[#9a674a]/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    New Slide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 p-4">
          <div
            ref={canvasRef}
            className="relative w-full h-full bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {currentSlide?.elements?.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-pointer ${
                  selectedElement === element.id ? "ring-2 ring-[#9a674a]" : ""
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height,
                  backgroundColor: element.style.backgroundColor,
                  borderRadius: element.style.borderRadius,
                  color: element.style.color,
                  fontSize: element.style.fontSize,
                  fontWeight: element.style.fontWeight,
                }}
                onClick={() => setSelectedElement(element.id)}
              >
                {element.type === "text" ? (
                  <div
                    contentEditable={!isPreviewMode}
                    suppressContentEditableWarning
                    className="w-full h-full outline-none p-2"
                    onBlur={(e) => {
                      updateElement(element.id, {
                        content: e.currentTarget.textContent || "",
                      });
                    }}
                  >
                    {element.content}
                  </div>
                ) : element.type === "shape" ? (
                  <div className="w-full h-full" />
                ) : null}

                {/* Element controls */}
                {selectedElement === element.id && !isPreviewMode && (
                  <div className="absolute -top-8 left-0 flex gap-1">
                    <button
                      onClick={() => deleteElement(element.id)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {(!currentSlide?.elements || currentSlide.elements.length === 0) &&
              !isPreviewMode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Plus size={48} className="mx-auto mb-2" />
                    <p>Click "Add Elements" to start building your slide</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSlideEditor;
