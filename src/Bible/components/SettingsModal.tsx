import React from 'react';
import { X, Type, Weight, PaintBucket, TextQuote } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveFeature, setFontSize, setFontWeight, setFontFamily, setVerseTextColor } from '@/store/slices/bibleSlice';

const SettingsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFeature = useAppSelector((state) => state.bible.activeFeature);
  const fontSize = useAppSelector((state) => state.bible.fontSize);
  const fontWeight = useAppSelector((state) => state.bible.fontWeight);
  const fontFamily = useAppSelector((state) => state.bible.fontFamily);
  const verseTextColor = useAppSelector((state) => state.bible.verseTextColor);

  if (activeFeature !== 'settings') return null;

  const fontSizes = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'xl' },
    { label: '2X Large', value: '2xl' },
  ];

  const fontWeights = [
    { label: 'Normal', value: 'normal' },
    { label: 'Medium', value: 'medium' },
    { label: 'Semi Bold', value: 'semibold' },
    { label: 'Bold', value: 'bold' },
  ];

  const fontFamilies = [
    { label: 'Serif', value: 'serif' },
    { label: 'Sans Serif', value: 'sans-serif' },
    { label: 'Monospace', value: 'monospace' },
    { label: 'Palatino', value: 'Palatino' },
    { label: 'Times New Roman', value: 'Times New Roman' },
  ];

  const colors = [
    { label: 'Black', value: '#1d1c1c' },
    { label: 'Dark Gray', value: '#4a4a4a' },
    { label: 'Brown', value: '#8b4513' },
    { label: 'Dark Blue', value: '#1a237e' },
    { label: 'Dark Green', value: '#1b5e20' },
  ];

  const renderSection = (title: string, icon: React.ReactNode, description: string, children: React.ReactNode) => (
    <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 mb-4">
      <div className="flex items-start space-x-3 mb-4">
        <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm" 
        onClick={() => dispatch(setActiveFeature(null))}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1a1a1a]/80 rounded-3xl w-[600px] max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customize your reading experience</p>
          </div>
          <button
            onClick={() => dispatch(setActiveFeature(null))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 4rem)' }}>
          {/* Font Size Section */}
          {renderSection(
            'Font Size',
            <Type size={20} className="text-gray-600 dark:text-gray-300" />,
            'Adjust the size of the scripture text',
            <div className="grid grid-cols-3 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => dispatch(setFontSize(size.value))}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    fontSize === size.value
                      ? 'bg-primary/10 text-primary dark:text-primary'
                      : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}

          {/* Font Weight Section */}
          {renderSection(
            'Font Weight',
            <Weight size={20} className="text-gray-600 dark:text-gray-300" />,
            'Choose the thickness of the text',
            <div className="grid grid-cols-2 gap-2">
              {fontWeights.map((weight) => (
                <button
                  key={weight.value}
                  onClick={() => dispatch(setFontWeight(weight.value))}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    fontWeight === weight.value
                      ? 'bg-primary/10 text-primary dark:text-primary'
                      : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          )}

          {/* Font Family Section */}
          {renderSection(
            'Font Family',
            <TextQuote size={20} className="text-gray-600 dark:text-gray-300" />,
            'Select your preferred font style',
            <div className="grid grid-cols-2 gap-2">
              {fontFamilies.map((family) => (
                <button
                  key={family.value}
                  onClick={() => dispatch(setFontFamily(family.value))}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    fontFamily === family.value
                      ? 'bg-primary/10 text-primary dark:text-primary'
                      : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                  style={{ fontFamily: family.value }}
                >
                  {family.label}
                </button>
              ))}
            </div>
          )}

          {/* Text Color Section */}
          {renderSection(
            'Text Color',
            <PaintBucket size={20} className="text-gray-600 dark:text-gray-300" />,
            'Choose the color of the scripture text',
            <div className="grid grid-cols-2 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => dispatch(setVerseTextColor(color.value))}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center space-x-3 ${
                    verseTextColor === color.value
                      ? 'bg-primary/10'
                      : 'bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className={
                    verseTextColor === color.value
                      ? 'text-primary dark:text-primary'
                      : 'text-gray-600 dark:text-gray-400'
                  }>
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 