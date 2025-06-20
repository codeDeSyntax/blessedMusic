import {
  Music,
  Settings,
  History,
  Grid,
  List,
  Check,
  ChevronDown,
  Monitor,
  ExternalLink,
  FileMusic,
  CogIcon,
  Group,
  Wallpaper,
  Sun,
  Moon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { FolderOpen } from "lucide-react";
import { useSongOperations } from "@/features/songs/hooks/useSongOperations";
import { motion } from "framer-motion";
import { DeleteColumnOutlined, MoonFilled } from "@ant-design/icons";
import { Song, Collection } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import { Tooltip } from "antd";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
}

interface SideBarProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  savedFavorites: Song[];
  setSavedFavorites: (songs: Song[]) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Access local theme from parent component instead of Redux
  const [localTheme, setLocalTheme] = useState(
    localStorage.getItem("bmusictheme") || "white"
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const displayValue = selectedOption?.label || value;

  return (
    <div className="relative " ref={dropdownRef}>
      {label && (
        <label
          className="text-sm font-thin  mb-1 block "
          style={{ fontFamily: "Georgia" }}
        >
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2 rounded-lg ${
          localTheme === "creamy" ? "bg-vmprim/20 " : "bg-gray-50"
        } text-[12px] border border-stone-200 flex items-center justify-between hover:bg-white/60 transition-colors`}
        style={{ fontFamily: label === "Font Family" ? value : undefined }}
      >
        <span>{displayValue as string}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          className={`absolute z-40 w-full mt-1 flex flex-col items-center gap-1  ${
            localTheme === "creamy" ? "bg-yellow-800" : "bg-white"
          } rounded-lg shadow-lg border border-stone-200 py-1 max-h-48 overflow-y-auto no-scrollbar`}
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-[90%] px-3 py-2 text-left  text-[12px   hover:[#9a674a]/40 hover:text-black  transition-colors ${
                (option.value || option) === value
                  ? "bg-white/20 text-orange-400"
                  : localTheme === "creamy"
                  ? "bg-vmprim/20 text-white"
                  : "bg-gray-50 border text-stone-500"
              }`}
              style={{
                fontFamily: label === "Font Family" ? option.value : undefined,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = React.memo(({ activeTab, setActiveTab }: SideBarProps) => {
  // const [activeTab, setActiveTab] = useState("recent");
  const { selectedSong } = useSongOperations();
  
  // Local functions for missing operations
  const setSongRepo = (path: string) => localStorage.setItem("bmusicsongdir", path);
  const setSelectedHymnBackground = (bg: string) => localStorage.setItem("bmusicpresentationbg", bg);
  const dispatch = useAppDispatch();
  
  // Add local theme state management
  const [localTheme, setLocalTheme] = useState(
    localStorage.getItem("bmusictheme") || "white"
  );

  // Theme toggle function for songs app
  const toggleSongTheme = () => {
    const newTheme = localTheme === "creamy" ? "white" : "creamy";
    setLocalTheme(newTheme);
    localStorage.setItem("bmusictheme", newTheme);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("localStorageChange", {
      detail: { key: "bmusictheme", newValue: newTheme }
    }));
  };

  const [fontSize, setFontSize] = useState(
    localStorage.getItem("bmusicfontSize") || "1.5"
  );
  const [fontFamily, setFontFamily] = useState(
    localStorage.getItem("bmusicfontFamily") || "'Georgia', serif"
  );
  const [displayCount, setDisplayCount] = useState(
    localStorage.getItem("bmusicdisplayCount") || "6"
  );
  const [layout, setLayout] = useState(
    localStorage.getItem("bmusiclayout") || "table"
  );
  const [selectedBg, setSelectedBg] = useState(
    localStorage.getItem("selectedBg") || "bg1"
  );
  const [imagesPath, setImagePath] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);

  // Load saved theme on component mount and listen for changes
  useEffect(() => {
    const savedTheme = localStorage.getItem("bmusictheme");
    if (savedTheme) {
      setLocalTheme(savedTheme);
    }

    // Listen for localStorage changes (when theme is changed from TitleBar)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === "bmusictheme") {
        setLocalTheme(e.detail.newValue);
      }
    };

    window.addEventListener("localStorageChange", handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener("localStorageChange", handleCustomStorageChange as EventListener);
    };
  }, []);

  const backgroundOptions = [
    {
      id: "bg1",
      name: "Classic Theme",
      thumbnail: "./blue.jpg",
      gradient: "bg-gradient-to-r from-amber-50 to-amber-100",
    },
    {
      id: "bg2",
      name: "Midnight Jazz",
      thumbnail: "./pic2.jpg",
      gradient: "bg-gradient-to-r from-blue-900 to-purple-900",
    },
    {
      id: "bg3",
      name: "Sunset Vibes",
      thumbnail: "./wood7.png",
      gradient: "bg-gradient-to-r from-orange-200 to-rose-200",
    },
    {
      id: "bg4",
      name: "Forest Calm",
      thumbnail: "./wood9.png",
      gradient: "bg-gradient-to-r from-green-100 to-emerald-100",
    },
  ];

  const fontSizeOptions = [
    { value: "0.3", label: "xxs" },
    { value: "0.9", label: "xs" },
    { value: "1.4", label: "Small" },
    { value: "1.5", label: "Medium" },
    { value: "1.7", label: "Large" },
  ];

  const fontFamilyOptions = [
    { value: "'Bitter Thin', serif", label: "Bitter Thin" },
    { value: "'Oswald ExtraLight', serif", label: "Oswald ExtraLight" },
    { value: "'Haettenschweiler', sans-serif", label: "Haettenschweiler" },
    { value: "'Impact', sans-serif", label: "Impact" },
    { value: "'Alumini Sans Black', serif", label: "Alumini Sans Black" },
    { value: "'LTFuzz', serif", label: "LTFuzz" },
    { value: "'Milkyway DEMO'", label: "Milkyway" },
  ];

  const selectsongDir = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSongRepo(path);
      localStorage.setItem("bmusicsongdir", path);
    }
  };
  const selectImagesPath = async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      localStorage.setItem("bmusicimages", path);
      dispatch(setCurrentScreen("backgrounds"));
    }
  };

  const selectPresentationBackground = (imagepath: string) => {
    setSelectedBg(imagepath);
    setSelectedHymnBackground(imagepath);
    localStorage.setItem("bmusicpresentationbg", imagepath);
  };

  useEffect(() => {
    const savedCollections = localStorage.getItem("bmusiccollections");
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    } else {
      // Sample collections if none exist
      const sampleCollections: Collection[] = [
        {
          id: "c1",
          name: "Wedding Songs",
          songIds: [],
          dateCreated: new Date().toISOString(),
        },
        {
          id: "c2",
          name: "Favorites",
          songIds: [],
          dateCreated: new Date().toISOString(),
        },
        {
          id: "c3",
          name: "Prayer Songs",
          songIds: [],
          dateCreated: new Date().toISOString(),
        },
      ];
      setCollections(sampleCollections);
      localStorage.setItem(
        "bmusiccollections",
        JSON.stringify(sampleCollections)
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bmusicfontFamily", fontFamily);
    localStorage.setItem("bmusicdisplayCount", displayCount);
    localStorage.setItem("bmusiclayout", layout);
    localStorage.setItem("selectedBg", selectedBg);
    localStorage.setItem("bmusicfontSize", fontSize);
  }, [fontSize, fontFamily, displayCount, layout, selectedBg]);

  const renderContent = () => {
    switch (activeTab) {
      case "Song":
        return (
          <div className="flex items-start flex-col p-3">
            <h3 className="text-lg text-left font-oswald underline text-stone-600 font-semibold">
              {selectedSong?.title}
            </h3>
            {/* clean song content with dangerously html*/}
            {/* dangerously rendered  html to clean code */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 * 0.1 }}
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: selectedSong?.content || "",
                }}
                className={`overflow-y-scroll no-scrollbar h-[50vh]  font-serif  text-left text-[12px] ${
                  !selectedSong && "hidden"
                }`}
              />
            </motion.div>

            {/* <p>{selectedSong?.content}</p> */}
            {!selectedSong?.content && (
              <img src="./nosong.png" alt="" className="h-40" />
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6 ">
            <div className="space-y-4 ">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "Georgia" }}
              >
                Display Settings
              </h3>

              <CustomDropdown
                label="Font Size"
                value={fontSize}
                onChange={setFontSize}
                options={fontSizeOptions}
              />

              <CustomDropdown
                label="Font Family"
                value={fontFamily}
                onChange={setFontFamily}
                options={fontFamilyOptions}
              />

              <div className="flex items-center gap-2 ">
                <Tooltip title="Select songs Directory">
                  <div
                    onClick={selectsongDir}
                    className="w-4 h-4 p-4 cursor-pointer  bg-white/50  text-vmborder-vmprim text-[12px] rounded-full
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                    style={{
                      borderWidth: 1,
                      borderColor: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                      borderStyle: "dashed",
                      color: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                    }}
                  >
                    <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {/* <span>Songs directory </span> */}
                  </div>
                </Tooltip>
                <Tooltip title="selected path for image backgrounds">
                  <div
                    onClick={() => selectImagesPath()}
                    className="w-4 h-4 cursor-pointer rounded-full p-4  bg-white/50 border-2 border-vmprim/20
                               hover:border-vmprim text-vmborder-vmprim text-[12px] 
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                    style={{
                      borderWidth: 1,
                      borderColor: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                      borderStyle: "dashed",
                      color: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                    }}
                  >
                    <Wallpaper className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {/* <span>Presentation background path </span> */}
                  </div>
                </Tooltip>

                <div
                  onClick={() => setLayout("table")}
                  className={`w-4 h-4 cursor-pointer rounded-full p-4  bg-white/50 border-2 border-vmprim/20
                               hover:border-vmprim text-vmborder-vmprim text-[12px] 
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group ${
                                 layout === "table"
                                   ? "bg-vmprim text-white"
                                   : "bg-white"
                               }`}
                  style={{
                    borderWidth: 1,
                    borderColor: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                    borderStyle: "dashed",
                    color: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                  }}
                >
                  <Grid className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>

                <div
                  onClick={() => setLayout("list")}
                  className={`w-4 h-4 cursor-pointer rounded-full p-4  bg-white/50 border-2 border-vmprim/20
                               hover:border-vmprim text-[#6d4a35] text-[12px] 
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group ${
                                 layout === "list"
                                   ? "bg-vmprim text-["
                                   : "bg-white"
                               }`}
                  style={{
                    borderWidth: 1,
                    borderColor: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                    borderStyle: "dashed",
                    color: localTheme === "creamy" ? "#9a674a" : "#3e3e3e",
                  }}
                >
                  <List className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Background Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => selectPresentationBackground(bg.thumbnail)}
                      className={`relative group p-1 rounded-lg ${
                        localTheme === "creamy" ? "bg-vmprim/30" : "bg-white"
                      } border-2 transition-all ${
                        selectedBg === bg.id
                          ? "border-vmprim"
                          : "border-transparent hover:border-stone-200"
                      }`}
                    >
                      <div
                        className={` bg-cover h-16 rounded-md overflow-hidden`}
                        style={{ backgroundImage: `url(${bg.thumbnail})` }}
                      >
                        {selectedBg === bg.thumbnail && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-vmprim rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs mt-1 block text-center">
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>
                {/* choose directory to load images from */}
                {/* <button
                  onClick={selectedImageDirectory}
                  className="w-full py-2 px-4  bg-white/50 border-2 border-vmprim/20
                               hover:border-vmprim text-vmborder-vmprim text-[12px] rounded-lg
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                >
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Images Directory</span>
                </button> */}
              </div>
            </div>
          </div>
        );

      case "collections":
        return (
          <div className="space-y-2">
            {collections.length === 0 && (
              <img src="./nosong.png" alt="" className="h-40" />
            )}

            {collections.map((collection, index) => (
              <div
                key={index}
                className={`px-3 ${
                  localTheme === "creamy"
                    ? "bg-[#faeed1] "
                    : "bg-white/90"
                } shadow rounded-lg backdrop-blur-sm transition-all hover:bg-white/40`}
              >
                <div className="flex flex-col justify-between items-start">
                  <div className=" w-full">
                    <h4 className="font-bolder text-[#9a674a] flex items-center gap-3  text-[14px]" style={{fontFamily:"garamond"}}>
                      {collection.name}{" "}
                      <span>
                        <ExternalLink
                          className="h-4 w-4 text-vmborder-vmprim hover:scale-105 hover:cursor-pointer"
                          onClick={() => setCurrentScreen("categorize")}
                        />
                      </span>
                    </h4>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm text-stone-600">
                        {collection.songIds.length} songs
                      </p>
                      {collection.name === "Wedding" && (
                        <img
                          src="./flower.png"
                          className="w-20 h-10"
                          alt="flower"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-72 h-full pt-2 border-r border-stone-300 bg-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col shadow ${localTheme === "creamy" ? "bg-[#f1e3ae]" : "bg-white/20"}`}
      style={{
        backgroundColor: localTheme === "creamy" ? "#fdf4d0" : "white",
      }}
    >
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="font-oswald text-[15px] s font-bold text-vmprim border-vmprim flex items-center gap-2">
          <Music className="w-5 h-5 animate-bounce" />
          Soul healing music
          <Music className="w-5 h-5 animate-bounce" />
        </h2>
        <button
          onClick={toggleSongTheme}
          className={`p-2 rounded-full transition-colors ${
            localTheme === "creamy" 
              ? "bg-[#9a674a] text-white hover:bg-[#8a564a]" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          title={`Switch to ${localTheme === "creamy" ? "white" : "creamy"} theme`}
        >
          <div className="w-4 h-4 rounded-full border-2 border-current bg-[#9a674a]"> {localTheme === "creamy" ? <Sun className="w-4 h-4" /> : <MoonFilled className="w-4 h-4 text-[#faeed1]" />}</div>
        </button>
      </div>

      <div className="px-2 flex-shrink-0">
        <div
          className={`flex space-x-2 ${
            localTheme === "creamy" ? "bg-[#faeed1]" : "bg-[#ececeb]"
          } p-1 rounded-lg`}
        >
          <button
            onClick={() => setActiveTab("Song")}
            className={` py-2 rounded-md text-[12px] px-2 font-medium transition-colors flex items-center justify-center ${
              activeTab === "Song" && localTheme === "creamy"
                ? "bg-vmprim text-white"
                : activeTab === "Song" && localTheme === "white"
                ? "bg-vmprim text-white"
                : "text-stone-600 bg-[#fdf4d0]"
            }`}
          >
            Song <FileMusic className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={` py-2 rounded-md text-[12px] px-2  font-medium transition-colors flex items-center justify-center ${
              activeTab === "settings" && localTheme === "creamy"
                ? "bg-vmprim text-white"
                : activeTab === "settings" && localTheme === "white"
                ? "bg-vmprim text-white"
                : "text-stone-600 bg-[#fdf4d0]"
            }`}
          >
            Settings <CogIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`flex-1 py-2 rounded-md text-[12px] px-2 font-medium transition-colors flex items-center justify-center ${
              activeTab === "collections" && localTheme === "creamy"
                ? "bg-vmprim text-white"
                : activeTab === "collections" && localTheme === "white"
                ? "bg-vmprim text-white"
                : "text-stone-600 bg-[#fdf4d0]"
            }`}
          >
            collections <Group className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
});

export default Sidebar;
