import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Clock,
  User,
  Settings,
  Bell,
  Download,
  Upload,
  FolderOpen,
  Save,
  Printer,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { Presentation } from "@/types";
import { exportPresentationToPDF } from "@/utils/pdfExporter";

const EvPresenterWelcome: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { presentations, loadPresentations, removePresentation } =
    usePresenterOperations();

  // Get recent presentations (last 5, sorted by updated/created date)
  const recentPresentations = useMemo(() => {
    return [...presentations]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [presentations]);

  // Filter presentations for table
  const filteredPresentations = useMemo(() => {
    return [...presentations]
      .filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p as any).preacher?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
  }, [presentations, searchQuery]);

  // Load presentations on mount
  useEffect(() => {
    loadPresentations();
  }, [loadPresentations]);

  // Debug presentation data
  useEffect(() => {
    if (presentations.length > 0) {
      console.log("Presentations loaded:", presentations);
      console.log(
        "First presentation backgroundImage:",
        (presentations[0] as any).backgroundImage
      );
    }
  }, [presentations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handlePresentationClick = (presentation: Presentation) => {
    console.log("Opening presentation:", presentation.title);
    dispatch(setCurrentScreen("mpresenter"));
  };

  const handlePrintPresentation = async (presentation: Presentation) => {
    try {
      const success = await exportPresentationToPDF(presentation, {
        includeScriptures: true,
        includeQuotes: true,
        includeMainMessage: true,
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
      });

      if (success) {
        console.log("PDF export initiated for:", presentation.title);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
    setActiveDropdown(null);
  };

  const handleOpenInDefaultApp = async (presentation: Presentation) => {
    try {
      const selectedPath = localStorage.getItem("evpresenterfilespath");
      if (!selectedPath) {
        alert("No presentation path selected. Please select a path first.");
        return;
      }

      // Remove invalid filename characters, replace spaces with underscores, convert to lowercase
      const sanitizedTitle = presentation.title
        .replace(/[/\\?%*:|"<>]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .substring(0, 50); // Truncate to match server logic

      const fileName = `${sanitizedTitle}_${presentation.id}.txt`;

      // Use the proper path construction API
      const pathResult = await window.api.constructFilePath(
        selectedPath,
        fileName
      );
      if (!pathResult.success || !pathResult.path) {
        alert(`Failed to construct file path: ${pathResult.error}`);
        return;
      }

      const result = await window.api.openFileInDefaultApp(pathResult.path);

      if (!result.success) {
        console.error("Failed to open file:", result.error);
        alert(`Failed to open file: ${result.error}`);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open the file. Please make sure the file exists.");
    }
    setActiveDropdown(null);
  };

  const handleDeletePresentation = async (presentation: Presentation) => {
    if (
      window.confirm(`Are you sure you want to delete "${presentation.title}"?`)
    ) {
      try {
        await removePresentation(presentation.id);
        console.log("Presentation deleted:", presentation.title);
      } catch (error) {
        console.error("Failed to delete presentation:", error);
        alert("Failed to delete presentation. Please try again.");
      }
    }
    setActiveDropdown(null);
  };

  const toggleDropdown = (presentationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(
      activeDropdown === presentationId ? null : presentationId
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="h-full bg-[#0f0f0f] text-white flex flex-col overflow-hidden relative font-[garamond]">
      {/* Magical Background Gradients - Dark Theme Only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary radial gradient - top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-radial from-[#2d2d2d]/30 via-[#1e1e1e]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>

        {/* Secondary radial gradient - top right */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-radial from-[#404040]/25 via-[#2d2d2d]/15 to-transparent rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Tertiary gradient - bottom */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[800px] h-40 bg-gradient-to-t from-[#1a1a1a]/40 via-[#1e1e1e]/20 to-transparent blur-xl"></div>

        {/* Ambient glow effect */}
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-conic from-[#2d2d2d]/20 via-[#404040]/10 to-[#1e1e1e]/15 rounded-full blur-2xl animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>

        {/* Subtle mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#1a1a1a]/10 to-[#2d2d2d]/20 mix-blend-overlay"></div>

        {/* Dynamic floating orbs */}
        <div
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-radial from-[#404040]/30 to-transparent rounded-full blur-xl animate-bounce"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-radial from-[#2d2d2d]/25 to-transparent rounded-full blur-lg animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto p-8">
          {/* Recent Presentations Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between ">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Recent Presentations
                </h1>
              </div>
            </div>

            {recentPresentations.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {recentPresentations.map((presentation) => (
                  <div
                    key={presentation.id}
                    className="flex-shrink-0 w-64 h-36 relative rounded-lg border border-[#2d2d2d] hover:border-[#404040] transition-all duration-300 cursor-pointer group overflow-hidden hover:shadow-2xl hover:shadow-[#1a1a1a]/40 hover:scale-105"
                    onClick={() => handlePresentationClick(presentation)}
                    style={{
                      backgroundImage: (presentation as any).backgroundImage
                        ? `url("${(presentation as any).backgroundImage}")`
                        : `url("./evdefault.jpg")`,
                      backgroundColor: "#2d2d2d", // Fallback color
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Enhanced gradient overlay with dark glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent rounded-lg group-hover:from-black/70 group-hover:via-[#1a1a1a]/30 transition-all duration-300" />

                    {/* Dark border glow on hover */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#404040]/30 via-transparent to-[#2d2d2d]/30 blur-sm"></div>

                    {/* Text content overlaid at top */}
                    <div className="absolute top-0 left-0 right-0 p-3 text-white">
                      <h3 className="text-sm font-semibold mb-1 line-clamp-2 drop-shadow-lg">
                        {presentation.title}
                      </h3>
                      <p className="text-xs text-white/90 mb-1 drop-shadow">
                        {new Date(
                          presentation.updatedAt || presentation.createdAt
                        ).toLocaleDateString()}
                      </p>
                      {presentation.preacher && (
                        <p className="text-xs text-white/80 truncate drop-shadow">
                          {presentation.preacher}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-64 bg-[#1a1a1a] rounded-lg border-2 border-dashed border-[#2d2d2d]/50 h-36 flex items-center justify-center hover:border-blue-500/50 transition-all cursor-pointer">
                  <div className="text-center text-gray-500">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs">No presentations yet</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* All Presentations Table Section */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2d2d2d] shadow-xl overflow-hidden relative">
            {/* Subtle dark glow behind table */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1e1e1e]/20 via-transparent to-[#2d2d2d]/15 pointer-events-none"></div>
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-[#404040]/20 via-transparent to-[#2d2d2d]/20 blur-sm pointer-events-none"></div>
            {/* Table Header */}
            <div className="bg-[#1e1e1e] border-t border-dashed border-b border-[#2d2d2d] p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    All Presentations
                  </h2>
                  <p className="text-sm text-gray-400">
                    Manage and organize your presentation library
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search presentations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#0f0f0f] border border-[#2d2d2d] rounded-lg border-none pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9a674a] focus:ring-1 focus:ring-[#9a674a] transition-all w-80"
                    />
                  </div>
                  <div className="p-2.5 bg-[#9a674a] hover:bg-[#2d2d2d] rounded-lg transition-colors border border-[#2d2d2d]">
                    <Filter className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-6 text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-2">Preacher</div>
                <div className="col-span-2">Activity</div>
              </div>
            </div>

            {/* Table Content */}
            <div className="max-h-96 overflow-y-auto no-scrollbar border-b border-[#2d2d2d] relative z-10">
              {filteredPresentations.length > 0 ? (
                <div className="divide-y divide-[#2d2d2d]">
                  {filteredPresentations.map((presentation, index) => (
                    <div
                      key={presentation.id}
                      className="grid grid-cols-12 gap-6 p-4 hover:bg-[#1e1e1e] border-b-2 border-solid border-[#2d2d2d] transition-all duration-200 cursor-pointer group"
                      onClick={() => handlePresentationClick(presentation)}
                    >
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-[#9a674a] flex items-center justify-center flex-shrink-0 border border-[#2d2d2d]">
                          <FileText className="w-4 h-4 text-[#faeed1]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white text-sm truncate group-hover:text-[#faeed1] transition-colors">
                            {presentation.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Presentation
                          </div>
                        </div>
                      </div>

                      {/* Modified Column */}
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-gray-400">
                          {formatDate(
                            presentation.updatedAt || presentation.createdAt
                          )}
                        </span>
                      </div>

                      {/* Preacher Column */}
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-gray-400 truncate">
                          {presentation.preacher || "—"}
                        </span>
                      </div>

                      {/* Activity Column */}
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {new Date(
                            presentation.updatedAt || presentation.createdAt
                          ).toLocaleDateString()}
                        </span>
                        <div className="relative">
                          <div
                            className="p-1.5 hover:bg-[#2d2d2d] rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            onClick={(e) => toggleDropdown(presentation.id, e)}
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </div>

                          {/* Dropdown Menu */}
                          {activeDropdown === presentation.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg shadow-xl z-50 py-2">
                              {/* Print Option */}
                              <div
                                className="flex items-center space-x-3 px-4 py-2.5 hover:bg-[#2d2d2d] cursor-pointer transition-colors text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrintPresentation(presentation);
                                }}
                              >
                                <Printer className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">Print</span>
                              </div>

                              {/* Open in Default App Option */}
                              <div
                                className="flex items-center space-x-3 px-4 py-2.5 hover:bg-[#2d2d2d] cursor-pointer transition-colors text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInDefaultApp(presentation);
                                }}
                              >
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  Open in Default App
                                </span>
                              </div>

                              {/* Separator */}
                              <div className="h-px bg-[#2d2d2d] mx-2 my-1"></div>

                              {/* Delete Option */}
                              <div
                                className="flex items-center space-x-3 px-4 py-2.5 hover:bg-red-600/20 cursor-pointer transition-colors text-red-400 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePresentation(presentation);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Delete</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    {searchQuery
                      ? "No presentations match your search"
                      : "No presentations found"}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first presentation to get started"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Navigate to PList */}
      <div
        className="fixed bottom-6 right-6 z-50 group cursor-pointer"
        onClick={() => dispatch(setCurrentScreen("mpresenter"))}
        title="View All Presentations"
      >
        <div className="relative">
          {/* Main button */}
          <div className="w-14 h-14 bg-gradient-to-br from-[#9a674a] to-[#7a5139] hover:from-[#b8784d] hover:to-[#8b5a3c] shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[#2d2d2d]/50">
            <FileText className="w-6 h-6 text-[#faeed1]" />
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9a674a]/30 to-[#7a5139]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

          {/* Ripple effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9a674a]/20 to-[#7a5139]/20 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-[#1e1e1e] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-[#2d2d2d] shadow-lg">
          View All Presentations
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1e1e1e]"></div>
        </div>
      </div>
    </div>
  );
};

export default EvPresenterWelcome;
