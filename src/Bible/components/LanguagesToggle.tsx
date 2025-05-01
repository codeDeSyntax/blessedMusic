import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Book, BookText, BookOpen, BookA } from "lucide-react";
import { useBibleContext } from "@/Provider/Bible";

const LanguageToggler = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {setCurrentTranslation}  = useBibleContext()

  // You can replace these functions with your actual language switching logic
  const switchToKJV = () => {
    console.log("Switching to KJV");
    // Implementation of language switch
    setCurrentTranslation("KJV")
    setIsOpen(false);
  };

  const switchToTWI = () => {
    console.log("Switching to TWI");
    // Implementation of language switch
    setCurrentTranslation("TWI")
    setIsOpen(false);
  };

  const switchToEWE = () => {
    console.log("Switching to EWE");
    // Implementation of language switch
    setCurrentTranslation("EWE")
    setIsOpen(false);
  };

  const switchToFrench = () => {
    console.log("Switching to French");
    // Implementation of language switch
    setCurrentTranslation("FRENCH")
    setIsOpen(false);
  };

  const languageOptions = [
    {
      id: 1,
      icon: (
        <Book
          size={14}
          className="text-indigo-500 dark:text-primary group-hover:text-white"
        />
      ),
      text: "KJV",
      onClick: switchToKJV,
      style: "rounded-tr-md",
    },
    {
      id: 2,
      icon: (
        <BookText
          size={14}
          className="text-indigo-500 dark:text-primary group-hover:text-white"
        />
      ),
      text: "TWI",
      onClick: switchToTWI,
    },
    {
      id: 3,
      icon: (
        <BookOpen
          size={14}
          className="text-indigo-500 dark:text-primary group-hover:text-white"
        />
      ),
      text: "EWE",
      onClick: switchToEWE,
    },
    {
      id: 4,
      icon: (
        <BookA
          size={14}
          className="text-indigo-500 dark:text-primary group-hover:text-white"
        />
      ),
      text: "French",
      onClick: switchToFrench,
      style: "rounded-br-md",
    },
  ];

  const toggleLanguages = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-10 md:bottom-24 left-20 z-50">
      <motion.button
        className="bg-white h-16 w-16 flex items-center justify-center   dark:bg-bgray text-indigo-500 dark:text-indigo-300 p-4 rounded-full shadow-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleLanguages}
        aria-label="Toggle Language Menu"
      >
        <Languages size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-16 -left-6 space-y-2 mb-4"
          >
            {languageOptions.map((language, index) => (
              <motion.button
                key={language.id}
                onClick={language.onClick}
                className={`flex justify-between group items-center w-40 h-10 px-4 bg-gray-50 dark:bg-ltgray hover:bg-indigo-500 hover:text-white dark:hover:bg-primary dark:hover:text-white text-gray-800 dark:text-gray-200 text-[12px] font-medium transition-colors rounded-full duration-300 ${language.style}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {language.text}
                {language.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageToggler;
