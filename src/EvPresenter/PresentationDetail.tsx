import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Quote,
  Pencil,
  Trash2,
  Presentation as PresentationIcon,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation as PresentationType } from "@/types";

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  color?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon,
  label,
  value,
  color = "violet",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start mb-3 group"
    >
      <div
        className={`bg-gradient-to-r ${
          color === "violet" ? "from-violet-500 to-purple-500" : "from-purple-500 to-violet-500"
        } p-2 rounded-lg shadow-sm mr-3 text-white`}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 14, strokeWidth: 2.5 })}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-0.5">
          {label}
        </p>
        <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-black/40 rounded-lg p-2.5 border border-violet-100 dark:border-violet-900/30 shadow-sm">
          {value}
        </div>
      </div>
    </motion.div>
  );
};

export const PresentationDetail: React.FC<{
  presentation: PresentationType;
  onBack: () => void;
  onEdit: () => void;
  onPresent: (presentation:PresentationType) => void
}> = ({ presentation, onBack, onEdit, onPresent}) => {
  const { startPresentation } = usePresenterOperations();
  
  // Local path management
  const selectedPath = localStorage.getItem("evpresenterfilespath") || "";

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      console.log("Delete presentation:", presentation.id); // TODO: Implement delete functionality
      onBack();
    }
  };

  const handlePresent = () => {
    onPresent(presentation);
    startPresentation();
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 border border-violet-100 dark:border-violet-900 w-full max-w-md"
      >
        {/* Receipt-style header with perforated edge */}
        <div className="relative mb-5 pb-4">
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200 dark:bg-gray-800 flex">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-px w-2 bg-white dark:bg-black mx-0.5"></div>
            ))}
          </div>
          
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2.5 rounded-xl text-white shadow-md">
              {presentation.type === "sermon" ? (
                <BookOpen size={18} strokeWidth={2} />
              ) : (
                <FileText size={18} strokeWidth={2} />
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {presentation.title}
            </h1>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 font-medium">
              {presentation.type === "sermon" ? "Sermon Details" : "Presentation Details"}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {presentation.type === "sermon" ? (
            <>
              <DetailItem
                icon={<User />}
                label="Preacher"
                value={(presentation as any).preacher}
                color="purple"
              />

              <DetailItem
                icon={<Calendar />}
                label="Date"
                value={new Date((presentation as any).date).toLocaleDateString()}
                color="violet"
              />

              <DetailItem
                icon={<BookOpen />}
                label="Scriptures"
                value={
                  <div className="space-y-1.5">
                    {(presentation as any).scriptures.map(
                      (scripture: any, index: number) => (
                        <motion.div
                          key={index}
                          custom={index}
                          variants={fadeInUpVariants}
                          initial="hidden"
                          animate="visible"
                          className="px-3 py-2 bg-white dark:bg-black/60 rounded-md border border-violet-200 dark:border-violet-800/50 shadow-sm flex items-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-600 mr-2"></div>
                          <span className="text-xs text-gray-800 dark:text-gray-200">
                            {scripture.text}
                          </span>
                        </motion.div>
                      )
                    )}
                  </div>
                }
                color="purple"
              />

              {(presentation as any).mainMessage && (
                <DetailItem
                  icon={<MessageSquare />}
                  label="Main Message"
                  value={(presentation as any).mainMessage}
                  color="violet"
                />
              )}

              {(presentation as any).quote && (
                <DetailItem
                  icon={<Quote />}
                  label="Quote"
                  value={
                    <div className="border-l-3 border-purple-400 dark:border-purple-600 pl-2 italic text-xs">
                      "{(presentation as any).quote}"
                    </div>
                  }
                  color="purple"
                />
              )}
            </>
          ) : (
            <DetailItem
              icon={<FileText />}
              label="Message"
              value={(presentation as any).message}
              color="violet"
            />
          )}
        </div>

        {/* Receipt-style footer with perforated edge */}
        <div className="relative mt-5 pt-4">
          <div className="absolute left-0 right-0 top-0 h-px bg-gray-200 dark:bg-gray-800 flex">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-px w-2 bg-white dark:bg-black mx-0.5"></div>
            ))}
          </div>

          <div className="flex space-x-2 mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEdit}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-violet-500/30 transition-all font-medium text-xs"
            >
              <Pencil size={14} className="mr-1.5" />
              <span>Edit</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePresent}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg shadow-md hover:shadow-purple-500/30 transition-all font-medium text-xs"
            >
              <PresentationIcon size={14} className="mr-1.5" />
              <span>Present</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#ef4565" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="w-10 flex items-center justify-center py-2.5 border border-red-200 dark:border-red-800/50 bg-white dark:bg-black text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};