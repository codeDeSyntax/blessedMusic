// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Play,
//   Pause,
//   Settings,
//   Maximize,
//   Home,
//   Monitor,
//   Palette,
//   Layout,
//   RotateCcw,
// } from "lucide-react";
// import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
// import { useAppDispatch } from "@/store";
// import { setCurrentScreen } from "@/store/slices/appSlice";
// import {
//   SlideTemplates,
//   TemplateType,
//   SlideContentData,
// } from "./templates/SlideTemplates";
// import {
//   PresentationThemes,
//   ThemeType,
//   getThemeByName,
//   getAllThemeNames,
// } from "./templates/ThemeColors";

// export const EnhancedPresentationSlideshow: React.FC<{
//   onBack: () => void;
// }> = ({ onBack }) => {
//   const { currentPresentation, stopPresentation } = usePresenterOperations();
//   const dispatch = useAppDispatch();

//   // Core slideshow state
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [slides, setSlides] = useState<SlideContentData[]>([]);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(false);
//   const [autoPlayInterval, setAutoPlayInterval] = useState(5000);
//   const [isPresentationMode, setIsPresentationMode] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);

//   // Template and theme state
//   const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
//     () =>
//       (localStorage.getItem("presentationTemplate") as TemplateType) ||
//       "minimal"
//   );
//   const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
//     () =>
//       (localStorage.getItem("presentationTheme") as ThemeType) || "classicBlue"
//   );

//   // Animation settings
//   const [selectedAnimation, setSelectedAnimation] = useState(() => {
//     const saved = localStorage.getItem("presentationAnimation");
//     return saved || "bouncing-text";
//   });

//   const animations = [
//     { value: "bouncing-text", label: "🚀 Bouncing Text" },
//     { value: "gliding-sweep", label: "✨ Gliding Sweep" },
//     { value: "explosive-zoom", label: "💥 Explosive Zoom" },
//     { value: "wave-reveal", label: "🌊 Wave Reveal" },
//   ];

//   // Refs
//   const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const settingsRef = useRef<HTMLDivElement>(null);

//   // Current theme and template
//   const currentTheme = getThemeByName(selectedTheme);
//   const CurrentTemplate = SlideTemplates[selectedTemplate];

//   // Generate slides from presentation data
//   const generateSlides = useCallback(() => {
//     if (!currentPresentation) return [];

//     const newSlides: SlideContentData[] = [];

//     // Title slide
//     newSlides.push({
//       title: currentPresentation.title,
//       subtitle: `${currentPresentation.preacher} • ${new Date(
//         currentPresentation.date
//       ).toLocaleDateString()}`,
//       preacher: currentPresentation.preacher,
//       date: new Date(currentPresentation.date).toLocaleDateString(),
//     });

//     // Scripture slides - Create ONE slide with ALL scriptures for auto-cycling
//     if (
//       currentPresentation.scriptures &&
//       currentPresentation.scriptures.length > 0
//     ) {
//       newSlides.push({
//         title: "Scripture",
//         scriptures: currentPresentation.scriptures, // Pass all scriptures to one slide
//         reference: "Holy Bible",
//       });
//     }

//     // Main message slide
//     if (currentPresentation.mainMessage) {
//       newSlides.push({
//         title: "Message",
//         mainMessage: currentPresentation.mainMessage,
//       });
//     }

//     // Quote slides
//     if (currentPresentation.quotes && currentPresentation.quotes.length > 0) {
//       currentPresentation.quotes.forEach((quote) => {
//         newSlides.push({
//           title: "Quote",
//           quote: quote.text,
//           author: quote.reference || "Unknown",
//         });
//       });
//     }

//     // Message points (if available in your data structure)
//     // You might need to add this to your Presentation type
//     if ((currentPresentation as any).mainMessagePoints) {
//       const points = (currentPresentation as any).mainMessagePoints;
//       if (points && points.length > 0) {
//         newSlides.push({
//           title: "Key Points",
//           points: points.map((point: any) => point.text || point),
//         });
//       }
//     }

//     return newSlides;
//   }, [currentPresentation]);

//   // Initialize slides
//   useEffect(() => {
//     const generatedSlides = generateSlides();
//     setSlides(generatedSlides);
//     setCurrentSlide(0);
//   }, [generateSlides]);

//   // Auto-play functionality
//   useEffect(() => {
//     if (isAutoPlaying && slides.length > 0) {
//       autoPlayTimerRef.current = setInterval(() => {
//         setCurrentSlide((prev) => (prev + 1) % slides.length);
//       }, autoPlayInterval);
//     } else {
//       if (autoPlayTimerRef.current) {
//         clearInterval(autoPlayTimerRef.current);
//         autoPlayTimerRef.current = null;
//       }
//     }

//     return () => {
//       if (autoPlayTimerRef.current) {
//         clearInterval(autoPlayTimerRef.current);
//       }
//     };
//   }, [isAutoPlaying, autoPlayInterval, slides.length]);

//   // Save settings to localStorage
//   useEffect(() => {
//     localStorage.setItem("presentationTemplate", selectedTemplate);
//     localStorage.setItem("presentationTheme", selectedTheme);
//     localStorage.setItem("presentationAnimation", selectedAnimation);
//   }, [selectedTemplate, selectedTheme, selectedAnimation]);

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (isPresentationMode) {
//         switch (event.key) {
//           case "ArrowRight":
//           case " ":
//             event.preventDefault();
//             nextSlide();
//             break;
//           case "ArrowLeft":
//             event.preventDefault();
//             previousSlide();
//             break;
//           case "Escape":
//             event.preventDefault();
//             setIsPresentationMode(false);
//             break;
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isPresentationMode]);

//   // Navigation functions
//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length);
//   };

//   const previousSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
//   };

//   const goToSlide = (index: number) => {
//     setCurrentSlide(index);
//   };

//   const toggleAutoPlay = () => {
//     setIsAutoPlaying(!isAutoPlaying);
//   };

//   const enterPresentationMode = () => {
//     setIsPresentationMode(true);
//     setShowSettings(false);
//     document.documentElement.requestFullscreen?.();
//   };

//   const exitPresentationMode = () => {
//     setIsPresentationMode(false);
//     document.exitFullscreen?.();
//   };

//   // Settings panel component
//   const SettingsPanel = () => (
//     <motion.div
//       ref={settingsRef}
//       initial={{ opacity: 0, x: 300 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 300 }}
//       className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 p-6 overflow-y-auto"
//     >
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-bold text-gray-800">Settings</h3>
//           <button
//             onClick={() => setShowSettings(false)}
//             className="p-2 rounded-full hover:bg-gray-200 transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Template Selection */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3">
//             <Layout className="w-4 h-4 inline mr-2" />
//             Template Style
//           </label>
//           <div className="grid grid-cols-1 gap-2">
//             {Object.keys(SlideTemplates).map((template) => (
//               <button
//                 key={template}
//                 onClick={() => setSelectedTemplate(template as TemplateType)}
//                 className={`p-3 rounded-lg border-2 text-left transition-all ${
//                   selectedTemplate === template
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-200 hover:border-gray-300"
//                 }`}
//               >
//                 <div className="font-medium capitalize">{template}</div>
//                 <div className="text-xs text-gray-500">
//                   {template === "minimal" && "Clean and modern design"}
//                   {template === "corporate" && "Professional business style"}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Theme Selection */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3">
//             <Palette className="w-4 h-4 inline mr-2" />
//             Color Theme
//           </label>
//           <div className="grid grid-cols-2 gap-2">
//             {getAllThemeNames().map((themeName) => {
//               const theme = getThemeByName(themeName);
//               return (
//                 <button
//                   key={themeName}
//                   onClick={() => setSelectedTheme(themeName)}
//                   className={`p-3 rounded-lg border-2 transition-all ${
//                     selectedTheme === themeName
//                       ? "border-blue-500 ring-2 ring-blue-200"
//                       : "border-gray-200 hover:border-gray-300"
//                   }`}
//                 >
//                   <div className="flex items-center space-x-2 mb-2">
//                     <div
//                       className="w-4 h-4 rounded-full"
//                       style={{ backgroundColor: theme.primary }}
//                     />
//                     <div
//                       className="w-4 h-4 rounded-full"
//                       style={{ backgroundColor: theme.accent }}
//                     />
//                   </div>
//                   <div className="text-xs font-medium">{theme.name}</div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Animation Selection */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3">
//             <RotateCcw className="w-4 h-4 inline mr-2" />
//             Animation Style
//           </label>
//           <div className="space-y-2">
//             {animations.map((animation) => (
//               <button
//                 key={animation.value}
//                 onClick={() => setSelectedAnimation(animation.value)}
//                 className={`w-full p-3 rounded-lg border text-left transition-all ${
//                   selectedAnimation === animation.value
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-200 hover:border-gray-300"
//                 }`}
//               >
//                 <div className="text-sm font-medium">{animation.label}</div>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Auto-play Settings */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-3">
//             Auto-play Settings
//           </label>
//           <div className="space-y-3">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={isAutoPlaying}
//                 onChange={toggleAutoPlay}
//                 className="rounded"
//               />
//               <span className="ml-2 text-sm">Enable auto-play</span>
//             </label>
//             <div>
//               <label className="block text-xs text-gray-600 mb-1">
//                 Interval (seconds): {autoPlayInterval / 1000}
//               </label>
//               <input
//                 type="range"
//                 min="2000"
//                 max="10000"
//                 step="1000"
//                 value={autoPlayInterval}
//                 onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
//                 className="w-full"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );

//   // Main render
//   if (!currentPresentation || slides.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-700 mb-4">
//             No Presentation Loaded
//           </h2>
//           <button
//             onClick={onBack}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-screen overflow-hidden">
//       {/* Main slide display */}
//       <div className="relative w-full h-full">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentSlide}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="absolute inset-0"
//           >
//             <CurrentTemplate
//               content={slides[currentSlide]}
//               theme={currentTheme}
//               animation={selectedAnimation}
//               isVisible={true}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Control panel (hidden in presentation mode) */}
//       {!isPresentationMode && (
//         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
//           <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg">
//             {/* Navigation */}
//             <button
//               onClick={previousSlide}
//               disabled={slides.length <= 1}
//               className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronLeft size={20} />
//             </button>

//             {/* Slide counter */}
//             <span className="text-sm font-medium px-3">
//               {currentSlide + 1} / {slides.length}
//             </span>

//             <button
//               onClick={nextSlide}
//               disabled={slides.length <= 1}
//               className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronRight size={20} />
//             </button>

//             {/* Auto-play toggle */}
//             <button
//               onClick={toggleAutoPlay}
//               className={`p-2 rounded-full transition-colors ${
//                 isAutoPlaying
//                   ? "bg-blue-100 text-blue-600"
//                   : "hover:bg-gray-200"
//               }`}
//             >
//               {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>

//             {/* Settings */}
//             <button
//               onClick={() => setShowSettings(!showSettings)}
//               className="p-2 rounded-full hover:bg-gray-200 transition-colors"
//             >
//               <Settings size={20} />
//             </button>

//             {/* Presentation mode */}
//             <button
//               onClick={enterPresentationMode}
//               className="p-2 rounded-full hover:bg-gray-200 transition-colors"
//             >
//               <Maximize size={20} />
//             </button>

//             {/* Home */}
//             <button
//               onClick={onBack}
//               className="p-2 rounded-full hover:bg-gray-200 transition-colors"
//             >
//               <Home size={20} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Presentation mode controls */}
//       {isPresentationMode && (
//         <div className="absolute bottom-6 right-6 z-40">
//           <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
//             <span className="text-white text-sm">
//               {currentSlide + 1}/{slides.length}
//             </span>
//             <button
//               onClick={exitPresentationMode}
//               className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
//             >
//               <Monitor size={16} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Slide thumbnails (hidden in presentation mode) */}
//       {!isPresentationMode && slides.length > 1 && (
//         <div className="absolute top-6 right-6 z-40">
//           <div className="bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-lg max-w-xs">
//             <h4 className="text-sm font-semibold text-gray-700 mb-3">Slides</h4>
//             <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
//               {slides.map((slide, index) => (
//                 <button
//                   key={index}
//                   onClick={() => goToSlide(index)}
//                   className={`relative w-16 h-12 rounded border-2 transition-all ${
//                     currentSlide === index
//                       ? "border-blue-500 ring-2 ring-blue-200"
//                       : "border-gray-200 hover:border-gray-300"
//                   }`}
//                   style={{ backgroundColor: currentTheme.primary }}
//                 >
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <span className="text-white text-xs font-medium">
//                       {index + 1}
//                     </span>
//                   </div>
//                   {slide.title && (
//                     <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b truncate">
//                       {slide.title}
//                     </div>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Settings panel */}
//       <AnimatePresence>{showSettings && <SettingsPanel />}</AnimatePresence>
//     </div>
//   );
// };
