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
  ArrowLeft,
  Play,
  Edit3,
  Copy,
  Share2,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation as PresentationType } from "@/types";

export const PresentationDetail: React.FC<{
  presentation: PresentationType;
  onBack: () => void;
  onEdit: () => void;
  onPresent: (presentation: PresentationType) => void;
}> = ({ presentation, onBack, onEdit, onPresent }) => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#282828] rounded-2xl shadow-2xl border border-[#606060]/30 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#404040]/30 bg-gradient-to-r from-[#282828] to-[#3a3a3a]">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-[#404040] hover:bg-[#505050] text-[#f5f5f5] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#606060] to-[#505050] text-white">
                {presentation.type === "sermon" ? (
                  <BookOpen size={24} />
                ) : (
                  <FileText size={24} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f5f5f5] mb-1">
                  {presentation.title}
                </h1>
                <p className="text-sm text-[#808080]">
                  {presentation.type === "sermon"
                    ? "Sermon Details"
                    : "Presentation Details"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePresent}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
            >
              <Play size={18} />
              Present
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <Edit3 size={18} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20">
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4 flex items-center gap-2">
                  <User size={20} className="text-[#606060]" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[#808080] uppercase tracking-wide">
                      Preacher
                    </label>
                    <p className="text-[#f5f5f5] font-medium mt-1">
                      {(presentation as any).preacher}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#808080] uppercase tracking-wide">
                      Date
                    </label>
                    <p className="text-[#f5f5f5] font-medium mt-1">
                      {new Date(
                        (presentation as any).date
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#808080] uppercase tracking-wide">
                      Type
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#606060]/20 text-[#f5f5f5] border border-[#606060]/30">
                        {presentation.type === "sermon"
                          ? "Sermon"
                          : "Presentation"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20">
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#404040] rounded-lg">
                    <p className="text-2xl font-bold text-[#f5f5f5]">
                      {(presentation as any).scriptures?.length || 0}
                    </p>
                    <p className="text-xs text-[#808080]">Scriptures</p>
                  </div>
                  <div className="text-center p-3 bg-[#404040] rounded-lg">
                    <p className="text-2xl font-bold text-[#f5f5f5]">
                      {(presentation as any).quotes?.length || 0}
                    </p>
                    <p className="text-xs text-[#808080]">Quotes</p>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20">
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-[#404040] hover:bg-[#505050] rounded-lg transition-colors text-[#f5f5f5]">
                    <Copy size={16} />
                    <span>Duplicate</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-[#404040] hover:bg-[#505050] rounded-lg transition-colors text-[#f5f5f5]">
                    <Share2 size={16} />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Middle Column - Scriptures & Message Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Scriptures */}
              {(presentation as any).scriptures &&
                (presentation as any).scriptures.length > 0 && (
                  <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20">
                    <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-[#606060]" />
                      Scriptures
                    </h3>
                    <div className="space-y-3">
                      {(presentation as any).scriptures.map(
                        (scripture: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-3 p-3 bg-[#404040] rounded-lg border border-[#606060]/20"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#606060]"></div>
                            <span className="text-sm text-[#f5f5f5]">
                              {scripture.text}
                            </span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Message Points */}
              {(presentation as any).mainMessagePoints &&
                (presentation as any).mainMessagePoints.length > 0 && (
                  <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20">
                    <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4 flex items-center gap-2">
                      <MessageSquare size={20} className="text-[#606060]" />
                      Message Points
                    </h3>
                    <div className="space-y-3">
                      {(presentation as any).mainMessagePoints.map(
                        (point: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start gap-3 p-3 bg-[#404040] rounded-lg border border-[#606060]/20"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#606060] flex items-center justify-center text-xs font-bold text-white mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm text-[#f5f5f5] flex-1">
                              {point.text}
                            </span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Main Message */}
              {(presentation as any).mainMessage && (
                <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20">
                  <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-[#606060]" />
                    Main Message
                  </h3>
                  <div className="p-4 bg-[#404040] rounded-lg border border-[#606060]/20">
                    <p className="text-sm text-[#f5f5f5] leading-relaxed">
                      {(presentation as any).mainMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Empty state for middle column if no content */}
              {!(presentation as any).scriptures?.length &&
                !(presentation as any).mainMessagePoints?.length &&
                !(presentation as any).mainMessage && (
                  <div className="bg-[#3a3a3a] rounded-xl p-8 border border-[#606060]/20 text-center">
                    <BookOpen
                      size={32}
                      className="text-[#606060]/30 mx-auto mb-3"
                    />
                    <p className="text-sm text-[#808080]">
                      No scriptures or message points added yet
                    </p>
                  </div>
                )}
            </motion.div>

            {/* Right Column - Quotes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {(presentation as any).quotes &&
                (presentation as any).quotes.length > 0 && (
                  <div className="bg-[#3a3a3a] rounded-xl p-5 border border-[#606060]/20 h-full">
                    <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4 flex items-center gap-2">
                      <Quote size={20} className="text-[#606060]" />
                      Quotes ({(presentation as any).quotes.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {(presentation as any).quotes.map(
                        (quote: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-4 bg-[#404040] rounded-lg border border-[#606060]/20"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              {quote.preacherImage && (
                                <img
                                  src={quote.preacherImage}
                                  alt="Preacher"
                                  className="w-8 h-8 rounded-full object-cover border-2 border-[#606060]/30"
                                />
                              )}
                              {quote.reference && (
                                <span className="text-xs bg-[#606060]/20 px-2 py-1 rounded-full text-[#f5f5f5] font-medium">
                                  {quote.reference}
                                </span>
                              )}
                              {quote.prophetInitials && (
                                <span className="text-xs bg-[#505050] px-2 py-1 rounded-full text-[#f5f5f5] font-bold">
                                  {quote.prophetInitials}
                                </span>
                              )}
                            </div>
                            <blockquote className="text-sm text-[#f5f5f5] italic border-l-3 border-[#606060] pl-3 leading-relaxed">
                              "{quote.text}"
                            </blockquote>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Empty state for quotes if none exist */}
              {!(presentation as any).quotes ||
                ((presentation as any).quotes.length === 0 && (
                  <div className="bg-[#3a3a3a] rounded-xl p-8 border border-[#606060]/20 text-center">
                    <Quote
                      size={32}
                      className="text-[#606060]/30 mx-auto mb-3"
                    />
                    <p className="text-sm text-[#808080] mb-4">
                      No quotes added yet
                    </p>
                    <button
                      onClick={onEdit}
                      className="px-4 py-2 bg-[#404040] hover:bg-[#505050] text-[#f5f5f5] rounded-lg transition-colors text-sm"
                    >
                      Add Quotes
                    </button>
                  </div>
                ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
