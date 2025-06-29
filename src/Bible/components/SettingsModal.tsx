import React, { useState, useEffect } from 'react';
import { X, Type, Weight, PaintBucket, TextQuote, BookOpen, Image, Maximize, FolderUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveFeature, setFontSize, setFontWeight, setFontFamily, setVerseTextColor, setVerseByVerseMode, setImageBackgroundMode, setFullScreen, setSelectedBackground } from '@/store/slices/bibleSlice';
import { setBibleBgs } from '@/store/slices/appSlice';
import { CustomSelect } from '@/shared/Selector';
import { useTheme } from '@/Provider/Theme';

const SettingsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);
  const verseByVerseMode = useAppSelector((state) => state.bible.verseByVerseMode);
  const imageBackgroundMode = useAppSelector((state) => state.bible.imageBackgroundMode);
  const isFullScreen = useAppSelector((state) => state.bible.isFullScreen);
  const bibleBgs = useAppSelector((state) => state.app.bibleBgs);
  const selectedBackground = useAppSelector((state) => state.bible.selectedBackground);

  // New state for custom images path
  const [customImagesPath, setCustomImagesPath] = useState(
    localStorage.getItem("bibleCustomImagesPath") || ""
  );

  // Load custom images when path changes
  useEffect(() => {
    const loadCustomImages = async () => {
      if (customImagesPath) {
        try {
          const customImages = await window.api.getImages(customImagesPath);
          // Combine default backgrounds with custom images
          const allBackgrounds = [...bibleBgs];
          customImages.forEach((img: string) => {
            if (!allBackgrounds.includes(img)) {
              allBackgrounds.push(img);
            }
          });
          dispatch(setBibleBgs(allBackgrounds));
        } catch (error) {
          console.error("Failed to load custom images:", error);
        }
      }
    };

    loadCustomImages();
  }, [customImagesPath, dispatch]);

  const handleSelectImagesDirectory = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (typeof result === 'string' && result) {
        setCustomImagesPath(result);
        localStorage.setItem("bibleCustomImagesPath", result);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  if (activeFeature !== 'settings') return null;

  const fontWeights = [
    { value: 'normal', text: 'Normal' },
    { value: 'medium', text: 'Medium' },
    { value: 'semibold', text: 'Semi Bold' },
    { value: 'bold', text: 'Bold' },
  ];

  const fontFamilies = [
    { value: "'Times New Roman', Times, serif", text: "Times New Roman" },
    { value: "'Arial', sans-serif", text: "Arial" },
    { value: "Helvetica", text: "Helvetica" },
    { value: "Georgia", text: "Georgia" },
    {value: "Impact", text: "Impact"},
    { value: "Palatino", text: "Palatino" },
    { value: "garamond", text: "Garamond" },
    { value: "Bookman", text: "Bookman" },

  ];

  const colors = [
    { value: "#1d1c1c", text: "Black" },
    { value: "#4a5568", text: "Gray" },
    { value: "#2d3748", text: "Dark Gray" },
    { value: "#fcd8c0", text: "Light Orange" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-md" 
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        onClick={() => dispatch(setActiveFeature(null))}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 dark:bg-[#30261d] backdrop-blur-sm rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-scroll no-scrollbar shadow-2xl border border-gray-200/50 dark:border-[#4a3e34]/50">
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-gray-50/30 via-gray-100/20 to-gray-50/30 dark:from-gray-800/30 dark:via-gray-700/20 dark:to-gray-800/30 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #9a674a 0%, #8b5e3c 100%)',
                  boxShadow: '0 8px 24px rgba(154, 103, 74, 0.3)'
                }}
              >
                <Type size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading Settings</h2>
                <p className="text-sm opacity-80 text-gray-600 dark:text-gray-300">Customize your scripture experience</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setActiveFeature(null))}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
          >
              <X size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 pt-8">
            {/* Typography Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Font Size</h3>
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: 'rgba(154, 103, 74, 0.1)',
                      color: '#9a674a'
                    }}
                  >
                    {fontSize}px
                  </div>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  // step={1}
                  value={parseInt(fontSize)}
                  onChange={(e) => dispatch(setFontSize(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(90deg, #9a674a 0%, #8b5e3c var(--value), #4a3e34 var(--value), #4a3e34 100%)'
                      : 'linear-gradient(90deg, #9a674a 0%, #8b5e3c var(--value), #e5e7eb var(--value), #e5e7eb 100%)',
                    '--value': `${((parseInt(fontSize) - 12) / (48 - 12)) * 100}%`
                  } as any}
                />
                </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Font Weight</h3>
                <CustomSelect
                  value={fontWeight}
                  onChange={(value) => dispatch(setFontWeight(value))}
                  options={fontWeights}
                  className="bg-white dark:bg-[#3d332a] border-gray-200 dark:border-[#4a3e34] text-gray-900 dark:text-white"
                />
                </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Font Family</h3>
                <CustomSelect
                  value={fontFamily}
                  onChange={(value) => dispatch(setFontFamily(value))}
                  options={fontFamilies}
                  className="bg-white dark:bg-[#3d332a] border-gray-200 dark:border-[#4a3e34] text-gray-900 dark:text-white"
                />
                </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Text Color</h3>
                <CustomSelect
                  value={verseTextColor}
                  onChange={(value) => dispatch(setVerseTextColor(value))}
                  options={colors}
                  className="bg-white dark:bg-[#3d332a] border-gray-200 dark:border-[#4a3e34] text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Display Mode Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Display Mode</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-gray-100">Verse by Verse Mode</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display one verse at a time with background image support</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verseByVerseMode}
                        onChange={(e) => {
                          dispatch(setVerseByVerseMode(e.target.checked));
                          if (!e.target.checked) {
                            dispatch(setImageBackgroundMode(false));
                            dispatch(setSelectedBackground(null));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {verseByVerseMode && (
                  <>
                    <div className="flex items-center justify-between pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="font-medium text-gray-900 dark:text-gray-100">Background Image Mode</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable custom background images for verses</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={imageBackgroundMode}
                            onChange={(e) => {
                              dispatch(setImageBackgroundMode(e.target.checked));
                              if (!e.target.checked) {
                                dispatch(setSelectedBackground(null));
                              }
                            }}
                            className="sr-only peer text-primary"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {imageBackgroundMode && (
                      <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <label className="font-medium text-gray-900 dark:text-gray-100">Custom Images Directory</label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Add your own background images</p>
                          </div>
                          <button
                            onClick={handleSelectImagesDirectory}
                            className="flex items-center gap-2 px-4 py-2 bg-[#4d3403] text-white rounded-lg hover:bg-[#5d4413] transition-colors"
                          >
                            <FolderUp className="w-4 h-4" />
                            <span>Select Folder</span>
                          </button>
                        </div>
                        {customImagesPath && (
                          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Loading images from: {customImagesPath}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-gray-100">Fullscreen Mode</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View scripture in fullscreen</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFullScreen}
                        onChange={(e) => dispatch(setFullScreen(e.target.checked))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Images Section */}
            {verseByVerseMode && imageBackgroundMode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Background Images</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(Only works in verse-by-verse mode)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {bibleBgs.map((bg, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        dispatch(setSelectedBackground(bg));
                        // Force a re-render by toggling a state
                        dispatch(setImageBackgroundMode(false));
                        setTimeout(() => dispatch(setImageBackgroundMode(true)), 0);
                      }}
                      className={`relative cursor-pointer rounded-lg overflow-hidden aspect-video transition-all duration-200 ${
                        selectedBackground === bg ? 'ring-2 ring-primary scale-95' : 'hover:scale-95'
                      }`}
                    >
                      <img
                        src={bg}
                        alt={`Background ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedBackground === bg && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;