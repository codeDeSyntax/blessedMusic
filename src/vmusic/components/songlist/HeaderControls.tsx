import React from "react";
import {
  Monitor,
  Search,
  List,
  Table,
  PlusIcon,
  TvIcon,
  X,
  RefreshCcw,
  Folder,
} from "lucide-react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Song } from "@/types";

interface HeaderControlsProps {
  selectedSong: Song | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  songRepo: string;
  folderColor: string;
  onEditClick: () => void;
  onPresentationClick: () => void;
  onDeleteClick: () => void;
  onDeselectClick: () => void;
  onCreateClick: () => void;
  onPresentSongClick: (e: React.MouseEvent) => void;
  onRefetch: () => void;
  onChangeDirectory: () => void;
}

const HeaderControls = React.memo(
  ({
    selectedSong,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    songRepo,
    folderColor,
    onEditClick,
    onPresentationClick,
    onDeleteClick,
    onDeselectClick,
    onCreateClick,
    onPresentSongClick,
    onRefetch,
    onChangeDirectory,
  }: HeaderControlsProps) => {
    return (
      <div className="flex flex-col justify-center mb-8">
        <div className="flex justify-between items-center space-x-4">
          <h1 className="font-serif text-2xl md:text-xl text-left font-bold text-[#9a674a]">
            Blessed Songs of Zion
            <span
              className={`ml-4 text-[.7rem] italic animate-pulse ${
                selectedSong ? "" : "hidden"
              }`}
            >
              {"--" + selectedSong?.title.slice(0, 32) + "--"}
            </span>
          </h1>

          <div
            className={`flex flex-col justify-center items-center ${
              selectedSong ? "flex" : "hidden"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <span title="edit song">
                <EditOutlined
                  className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                  onClick={onEditClick}
                />
              </span>
              <span title="Present here">
                <TvIcon
                  className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                  onClick={onPresentationClick}
                />
              </span>
              <span title="Delete song">
                <DeleteOutlined
                  className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                  onClick={onDeleteClick}
                />
              </span>
              <span title="deselect song">
                <X
                  className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                  onClick={onDeselectClick}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative ">
            <input
              type="text"
              placeholder="Search hymns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 rounded-full border-none border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#9a674a] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1.5 w-5 h-5 text-stone-500" />
          </div>

          {/* View Toggle divs */}
          <div className="flex space-x-2">
            <div
              onClick={() => setViewMode("table")}
              className={`h-8 w-8 rounded-full flex items-center cursor-pointer justify-center ${
                viewMode === "table"
                  ? "bg-[#9a674a] text-white"
                  : "bg-gray-50 text-stone-500"
              } hover:bg-gray-100 hover:scale-105 hover:text-stone-500 transition-colors`}
              style={{
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            >
              <Table className="w-3 h-3" />
            </div>
            <div
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 rounded-full flex items-center cursor-pointer justify-center ${
                viewMode === "list"
                  ? "bg-[#9a674a] text-white"
                  : "bg-gray-50 text-stone-500"
              } hover:bg-gray-100 hover:scale-105 hover:text-stone-500 transition-colors`}
              style={{
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            >
              <List className="w-3 h-3" />
            </div>
            <div
              onClick={onCreateClick}
              className="h-8 w-8 rounded-full flex items-center cursor-pointer justify-center bg-gray-50 text-stone-500 hover:bg-gray-100 hover:scale-105 hover:text-stone-500 transition-colors"
              title="add song"
              style={{
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            >
              <PlusIcon className="w-3 h-3" />
            </div>
            <div
              onClick={onPresentSongClick}
              className={`h-8 w-8 rounded-full flex items-center cursor-pointer justify-center bg-gray-50 text-stone-500 hover:bg-gray-100 hover:scale-105 hover:text-stone-500 transition-colors ${
                selectedSong ? "block" : "hidden"
              }`}
              title="External screen"
              style={{
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            >
              <Monitor className="w-3 h-3" />
            </div>
            <div
              onClick={onRefetch}
              className="h-8 w-8 rounded-full flex items-center cursor-pointer justify-center bg-gray-50 text-stone-500 hover:bg-gray-100 hover:scale-105 hover:text-stone-500 transition-colors"
              title="Reload"
              style={{
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            >
              <RefreshCcw className="w-3 h-3" />
            </div>
            <div
              onClick={onChangeDirectory}
              className="h-8 w-8 rounded-full flex items-center cursor-pointer justify-center bg-gray-50 text-yellow-500 hover:bg-gray-100 hover:scale-105 hover:text-stone-500 transition-colors"
              title="change directory"
              style={{
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            >
              <Folder className="w-3 h-3" />
            </div>
            <div
              className="h-8 px-2 rounded-lg flex items-center justify-center font-thin text-[12px] bg-gray-50 text-stone-500 hover:bg-vmprim hover:scale-105 hover:text-stone-100 transition-colors gap-2"
              title={songRepo}
            >
              <Folder color={folderColor} size={14} />
              {songRepo.slice(0, 13)}..
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HeaderControls.displayName = "HeaderControls";

export default HeaderControls;
