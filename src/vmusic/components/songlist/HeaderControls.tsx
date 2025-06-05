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
import { Tooltip } from "antd";
import { Song } from "@/types";
import { useBmusicContext } from "../../../Provider/Bmusic";

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
    const { theme } = useBmusicContext();
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
              <Tooltip title="Edit song" placement="bottom">
                <span>
                  <EditOutlined
                    className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                    onClick={onEditClick}
                  />
                </span>
              </Tooltip>
              <Tooltip title="Present here" placement="bottom">
                <span>
                  <TvIcon
                    className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                    onClick={onPresentationClick}
                  />
                </span>
              </Tooltip>
              <Tooltip title="Delete song" placement="bottom">
                <span>
                  <DeleteOutlined
                    className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                    onClick={onDeleteClick}
                  />
                </span>
              </Tooltip>
              <Tooltip title="Deselect song" placement="bottom">
                <span>
                  <X
                    className="w-4 h-4 hover:scale-110 hover:cursor-pointer text-[#9a674a]"
                    onClick={onDeselectClick}
                  />
                </span>
              </Tooltip>
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
              style={{
                backgroundColor: theme === "creamy" ? "#fdf4d0" : "#f9fafb",
                borderWidth: 1,
                borderColor: "#3f2817",
                borderStyle: "dashed",
              }}
            />
            <Search className="absolute left-3 top-1.5 w-5 h-5 text-stone-500" />
          </div>

          {/* View Toggle divs */}
          <div className="flex space-x-2">
            <Tooltip title="Table view" placement="bottom">
              <div
                onClick={() => setViewMode("table")}
                className={`h-8 w-8 rounded-full flex items-center cursor-pointer justify-center ${
                  viewMode === "table"
                    ? " text-stone-500"
                    : "  text-stone-500"
                } hover:bg-transparent hover:scale-105 hover:text-stone-500 transition-colors`}
                style={{
                  borderWidth: viewMode === "table" && 2 || undefined,
                  borderColor: "#3f2817",
                  borderStyle: "dashed",
                  backgroundColor: theme === "creamy" ? "tranparent" : "#f9fafb ",
                }}
              >
                <Table className="w-3 h-3" />
              </div>
            </Tooltip>
            
            <Tooltip title="List view" placement="bottom">
              <div
                onClick={() => setViewMode("list")}
                className={`h-8 w-8 rounded-full flex items-center cursor-pointer justify-center ${
                  viewMode === "list"
                    ? "bg-[#9a674a] text-stone-500"
                    : "  text-stone-500"
                } hover:bg-transparent hover:scale-105 hover:text-stone-500 transition-colors`}
                style={{
                  borderWidth: 1,
                  borderColor: "#3f2817",
                  borderStyle: "dashed",
                  backgroundColor: theme === "creamy" ? "tranparent" : "#f9fafb ",
                }}
              >
                <List className="w-3 h-3" />
              </div>
            </Tooltip>
            
            <Tooltip title="Add new song" placement="bottom">
              <div
                onClick={onCreateClick}
                className="h-8 w-8 rounded-full flex items-center cursor-pointer justify-center bg-gry-50 text-stone-500 hover:bg-transparent hover:scale-105 hover:text-stone-500 transition-colors"
                style={{
                  borderWidth: 1,
                  borderColor: "#3f2817",
                  borderStyle: "dashed",
                  backgroundColor: theme === "creamy" ? "tranparent" : "#f9fafb ",
                }}
              >
                <PlusIcon className="w-3 h-3" />
              </div>
            </Tooltip>
            
            <Tooltip title="Present on external screen" placement="bottom">
              <div
                onClick={onPresentSongClick}
                className={`h-8 w-8 rounded-full flex items-center cursor-pointer justify-center bg-gry-50 text-stone-500 hover:bg-transparent hover:scale-105 hover:text-stone-500 transition-colors ${
                  selectedSong ? "block" : "hidden"
                }`}
                style={{
                  borderWidth: 1,
                  borderColor: "#3f2817",
                  borderStyle: "dashed",
                  backgroundColor: theme === "creamy" ? "tranparent" : "#f9fafb ",
                }}
              >
                <Monitor className="w-3 h-3" />
              </div>
            </Tooltip>
            
            <Tooltip title="Reload songs" placement="bottom">
              <div
                onClick={onRefetch}
                className="h-8 w-8 rounded-full flex items-center cursor-pointer justify-center  text-stone-500 hover:bg-transparent hover:scale-105 hover:text-stone-500 transition-colors"
                style={{
                  borderWidth: 1,
                  borderColor: "#3f2817",
                  borderStyle: "dashed",
                  backgroundColor: theme === "creamy" ? "tranparent" : "#f9fafb ",
                }}
              >
                <RefreshCcw className="w-3 h-3" />
              </div>
            </Tooltip>
            
            <Tooltip title="Change directory" placement="bottom">
              <div
                onClick={onChangeDirectory}
                className="h-8 w-8 rounded-full flex items-center cursor-pointer justify-center  text-yellow-500 hover:bg-transparent hover:scale-105 hover:text-stone-500 transition-colors"
                style={{
                  borderWidth: 1,
                  borderColor: "#3f2817",
                  borderStyle: "dashed",
                  backgroundColor: theme === "creamy" ? "tranparent" : "#f9fafb ",
                }}
              >
                <Folder className="w-3 h-3" />
              </div>
            </Tooltip>
            
            <Tooltip title={songRepo} placement="bottom">
              <div
                className="h-8 px-2 rounded-lg flex items-center justify-center font-thin text-[12px] text-gray-50 bg-vmprim hover:bg-vmprim hover:scale-105 hover:text-stone-100 transition-colors gap-2"
              >
                <Folder color={folderColor} size={14} />
                {songRepo.slice(0, 13)}..
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
);

HeaderControls.displayName = "HeaderControls";

export default HeaderControls;