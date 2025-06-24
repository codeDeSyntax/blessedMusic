import React from 'react';
import { X, Type, Weight, PaintBucket, TextQuote } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveFeature, setFontSize, setFontWeight, setFontFamily, setVerseTextColor } from '@/store/slices/bibleSlice';
import { CustomSelect } from '@/shared/Selector';

const SettingsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);

  if (activeFeature !== 'settings') return null;

  const fontSizes = [
    { value: 'small', text: 'Small' },
    { value: 'medium', text: 'Medium' },
    { value: 'large', text: 'Large' },
    { value: 'xl', text: 'Extra Large' },
    { value: '2xl', text: '2X Large' },
  ];

  const fontWeights = [
    { value: 'normal', text: 'Normal' },
    { value: 'medium', text: 'Medium' },
    { value: 'semibold', text: 'Semi Bold' },
    { value: 'bold', text: 'Bold' },
  ];

  const fontFamilies = [
    { value: "'Times New Roman', Times, serif", text: "Times New Roman" },
    { value: "'Arial', sans-serif", text: "Arial" },
    { value: "'Helvetica', sans-serif", text: "Helvetica" },
    { value: "'Georgia', serif", text: "Georgia" },
    { value: "Palatino", text: "Palatino" },
    { value: "Garamond", text: "Garamond" },
    { value: "Bookman", text: "Bookman" },
  ];

  const colors = [
    { value: "#1d1c1c", text: "Black" },
    { value: "#4a5568", text: "Gray" },
    { value: "#2d3748", text: "Dark Gray" },
    { value: "#fcd8c0", text: "Light Orange" },
  ];

  const renderSection = (title: string, icon: JSX.Element, description: string, content: JSX.Element) => (
    <div className="group">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 group-hover:from-gray-100 group-hover:to-gray-200 dark:group-hover:from-gray-700 dark:group-hover:to-gray-800 transition-all duration-200">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {content}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md" 
        onClick={() => dispatch(setActiveFeature(null))}
      />
      
      {/* Modern Modal */}
      <div className="relative bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-scroll no-scrollbar shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        
        {/* Sleek Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-transparent via-gray-50/30 to-transparent dark:via-gray-800/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <Type size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize your scripture reading experience</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setActiveFeature(null))}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
          >
            <X size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-8 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Font Size Section */}
            {renderSection(
              'Font Size',
              <Type size={20} className="text-blue-600 dark:text-blue-400" />,
              'Adjust the size of scripture text for comfortable reading',
              <>
                <CustomSelect
                  value={fontSize}
                  onChange={(value) => dispatch(setFontSize(value))}
                  options={fontSizes}
                />
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-900/50 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-200" 
                     style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'medium' ? '16px' : fontSize === 'large' ? '18px' : fontSize === 'xl' ? '20px' : '24px' }}>
                    "For God so loved the world..." — Preview at {fontSize} size
                  </p>
                </div>
              </>
            )}

            {/* Font Weight Section */}
            {renderSection(
              'Font Weight',
              <Weight size={20} className="text-green-600 dark:text-green-400" />,
              'Control the boldness and emphasis of text',
              <>
                <CustomSelect
                  value={fontWeight}
                  onChange={(value) => dispatch(setFontWeight(value))}
                  options={fontWeights}
                />
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-stone-800 dark:to-stone-900/50 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-200" style={{ fontWeight }}>
                    "In the beginning was the Word..." — {fontWeight} weight
                  </p>
                </div>
              </>
            )}

            {/* Font Family Section */}
            {renderSection(
              'Font Family',
              <TextQuote size={20} className="text-purple-600 dark:text-purple-400" />,
              'Choose a font that enhances your reading focus',
              <>
                <CustomSelect
                  value={fontFamily}
                  onChange={(value) => dispatch(setFontFamily(value))}
                  options={fontFamilies}
                />
                <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-900/50 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-gray-700 dark:text-gray-200" style={{ fontFamily }}>
                    "Be still and know that I am God..." — {fontFamily.split(',')[0].replace(/['"]+/g, '')} font
                  </p>
                </div>
              </>
            )}

            {/* Text Color Section */}
            {/* {renderSection(
              'Text Color',
              <PaintBucket size={20} className="text-orange-600 dark:text-orange-400" />,
              'Select the perfect color for extended reading comfort',
              <>
                <CustomSelect
                  value={verseTextColor}
                  onChange={(value) => dispatch(setVerseTextColor(value))}
                  options={colors}
                />
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="font-medium" style={{ color: verseTextColor }}>
                    "The Lord is my shepherd, I shall not want..." — Selected color preview
                  </p>
                </div>
              </>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;