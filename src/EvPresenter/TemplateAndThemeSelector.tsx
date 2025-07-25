import React from "react";
import { motion } from "framer-motion";
import { Layout, Palette, Eye } from "lucide-react";
import { SlideTemplates, TemplateType } from "./templates/SlideTemplates";
import { PresentationThemes, ThemeType, getThemeByName, getAllThemeNames } from "./templates/ThemeColors";

interface TemplateAndThemeSelectorProps {
  selectedTemplate: TemplateType;
  selectedTheme: ThemeType;
  onTemplateChange: (template: TemplateType) => void;
  onThemeChange: (theme: ThemeType) => void;
  className?: string;
}

export const TemplateAndThemeSelector: React.FC<TemplateAndThemeSelectorProps> = ({
  selectedTemplate,
  selectedTheme,
  onTemplateChange,
  onThemeChange,
  className = "",
}) => {
  const currentTheme = getThemeByName(selectedTheme);

  const templateDescriptions = {
    minimal: {
      name: "Minimal",
      description: "Clean and modern design with plenty of white space",
      features: ["Simple layouts", "Modern typography", "Subtle animations"],
    },
    corporate: {
      name: "Corporate",
      description: "Professional business-style presentation",
      features: ["Structured layouts", "Professional fonts", "Geometric elements"],
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Template Selection */}
      <div>
        <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
          <Layout className="w-5 h-5 mr-2" />
          Slide Template
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(SlideTemplates).map((template) => {
            const templateKey = template as TemplateType;
            const templateInfo = templateDescriptions[templateKey];
            
            return (
              <motion.button
                key={template}
                onClick={() => onTemplateChange(templateKey)}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate === template
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Template Preview */}
                <div
                  className="w-full h-24 rounded-lg mb-4 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded px-3 py-1 text-xs font-medium text-gray-700">
                      {templateInfo.name} Preview
                    </div>
                  </div>
                  {templateKey === "minimal" && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-white/80 rounded h-2 mb-1"></div>
                      <div className="bg-white/60 rounded h-1"></div>
                    </div>
                  )}
                  {templateKey === "corporate" && (
                    <>
                      <div className="absolute top-2 left-2 w-8 h-8 bg-white/60 rounded"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/80 rounded h-1 mb-1"></div>
                        <div className="bg-white/60 rounded h-1"></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Template Info */}
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {templateInfo.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {templateInfo.description}
                  </p>
                  <div className="space-y-1">
                    {templateInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedTemplate === template && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
          <Palette className="w-5 h-5 mr-2" />
          Color Theme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {getAllThemeNames().map((themeName) => {
            const theme = getThemeByName(themeName);
            return (
              <motion.button
                key={themeName}
                onClick={() => onThemeChange(themeName)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTheme === themeName
                    ? "border-blue-500 ring-2 ring-blue-200 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Color Preview */}
                <div className="flex items-center space-x-1 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: theme.secondary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>

                {/* Theme Name */}
                <div className="text-sm font-medium text-gray-800 text-center">
                  {theme.name}
                </div>

                {/* Selection indicator */}
                {selectedTheme === themeName && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center text-lg font-semibold text-gray-800 mb-4">
          <Eye className="w-5 h-5 mr-2" />
          Preview
        </div>
        <div
          className="w-full h-40 rounded-lg relative overflow-hidden shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 50%, ${currentTheme.accent} 100%)`,
          }}
        >
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: currentTheme.text.primary }}
              >
                Sample Presentation
              </h3>
              <p
                className="text-lg opacity-90"
                style={{ color: currentTheme.text.secondary }}
              >
                {templateDescriptions[selectedTemplate].name} template with {currentTheme.name} theme
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.text.primary,
                }}
              >
                {currentTheme.name}
              </div>
              <div
                className="text-sm opacity-75"
                style={{ color: currentTheme.text.secondary }}
              >
                {templateDescriptions[selectedTemplate].name} Template
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
