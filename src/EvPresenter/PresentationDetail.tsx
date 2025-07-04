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
        className={`bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] p-2 rounded-lg shadow-sm mr-3 text-white`}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 14, strokeWidth: 2.5 })}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-[#9a674a] dark:text-[#9a674a] mb-0.5">
          {label}
        </p>
        <div className="text-sm text-[#9a674a] dark:text-gray-200 bg-[#faeed1] dark:bg-black/40 rounded-lg p-2.5 border border-[#9a674a]/20 dark:border-[#9a674a]/30 shadow-sm">
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
        className="bg-[#faeed1] dark:bg-black rounded-2xl shadow-xl border border-[#9a674a]/20 dark:border-[#9a674a] w-full max-w-md h-[90%] flex flex-col"
      >
        {/* Receipt-style header with perforated edge */}
        <div className="relative p-6 pb-4">
          <div className="absolute left-0 right-0 bottom-0 h-px bg-[#9a674a]/20 dark:bg-[#9a674a]/20 flex">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-px w-2 bg-[#faeed1] dark:bg-black mx-0.5"></div>
            ))}
          </div>
          
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] p-2.5 rounded-xl text-white shadow-md">
              {presentation.type === "sermon" ? (
                <BookOpen size={18} strokeWidth={2} />
              ) : (
                <FileText size={18} strokeWidth={2} />
              )}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-[#9a674a] dark:text-[#9a674a]">
              {presentation.title}
            </h1>
            <p className="text-xs text-[#9a674a]/70 dark:text-[#9a674a]/70 mt-1 font-medium">
              {presentation.type === "sermon" ? "Sermon Details" : "Presentation Details"}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6">
          <div className="space-y-1">
            {presentation.type === "sermon" ? (
              <>
                <DetailItem
                  icon={<User />}
                  label="Preacher"
                  value={(presentation as any).preacher}
                  color="brown"
                />

                <DetailItem
                  icon={<Calendar />}
                  label="Date"
                  value={new Date((presentation as any).date).toLocaleDateString()}
                  color="brown"
                />

                <DetailItem
                  icon={<BookOpen />}
                  label="Scriptures"
                  value={
                    <div className="grid grid-cols-2 gap-2">
                      {(presentation as any).scriptures.map(
                        (scripture: any, index: number) => (
                          <motion.div
                            key={index}
                            custom={index}
                            variants={fadeInUpVariants}
                            initial="hidden"
                            animate="visible"
                            className="px-3 py-2 bg-[#faeed1] dark:bg-black/60 rounded-md border border-[#9a674a]/20 dark:border-[#9a674a]/30 shadow-sm flex items-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#9a674a] dark:bg-[#9a674a] mr-2"></div>
                            <span className="text-xs text-[#9a674a] dark:text-gray-200 truncate">
                              {scripture.text}
                            </span>
                          </motion.div>
                        )
                      )}
                    </div>
                  }
                  color="brown"
                />

                {(presentation as any).mainMessage && (
                  <DetailItem
                    icon={<MessageSquare />}
                    label="Main Message"
                    value={(presentation as any).mainMessage}
                    color="brown"
                  />
                )}

                {(presentation as any).quote && (
                  <DetailItem
                    icon={<Quote />}
                    label="Quote"
                    value={
                      <div className="border-l-3 border-[#9a674a] dark:border-[#9a674a] pl-2 italic text-xs">
                        "{(presentation as any).quote}"
                      </div>
                    }
                    color="brown"
                  />
                )}
              </>
            ) : (
              <DetailItem
                icon={<FileText />}
                label="Message"
                value={(presentation as any).message}
                color="brown"
              />
            )}
          </div>
        </div>

        {/* Receipt-style footer with perforated edge */}
        <div className="relative p-6 pt-4 mt-auto">
          <div className="absolute left-0 right-0 top-0 h-px bg-[#9a674a]/20 dark:bg-[#9a674a]/20 flex">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-px w-2 bg-[#faeed1] dark:bg-black mx-0.5"></div>
            ))}
          </div>

          <div className="flex space-x-2 mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEdit}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#9a674a] to-[#8b5a3c] text-white rounded-lg shadow-md hover:shadow-[#9a674a]/30 transition-all font-medium text-xs"
            >
              <Pencil size={14} className="mr-1.5" />
              <span>Edit</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePresent}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#8b5a3c] to-[#9a674a] text-white rounded-lg shadow-md hover:shadow-[#9a674a]/30 transition-all font-medium text-xs"
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