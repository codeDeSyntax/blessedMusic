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
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { FolderOpen } from "lucide-react";
import { useBmusicContext } from "@/Provider/Bmusic";
import { motion } from "framer-motion";
import { DeleteColumnOutlined } from "@ant-design/icons";
import { Song, Collection } from "@/types";
import { useEastVoiceContext } from "@/Provider/EastVoice";

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
  const { theme } = useBmusicContext();

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
        <label className="text-sm font-thin  skew-x-12 italic mb-1 block">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2 rounded-lg ${
          theme === "creamy" ? "bg-[#9a674a]/20 " : "bg-white"
        } text-[12px] border border-stone-200 flex items-center justify-between hover:bg-white/60 transition-colors`}
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
          className={`absolute z-40 w-full mt-1 flex flex-col items-center  ${
            theme === "creamy" ? "bg-[#9a674a]" : "bg-white"
          } rounded-lg shadow-lg border border-stone-200 py-1 max-h-48 overflow-y-auto no-scrollbar`}
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-[90%] px-3 py-2 text-left  text-[12px] shadow-inner  hover:[#9a674a]/40 hover:text-black  transition-colors ${
                (option.value || option) === value
                  ? "bg-white/20 text-orange-400"
                  : theme === "creamy"
                  ? "bg-[#9a674a]/20 text-white"
                  : "bg-transparent border text-stone-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab }: SideBarProps) => {
  // const [activeTab, setActiveTab] = useState("recent");
  const { setSongRepo, selectedSong, setSelectedHymnBackground, theme } =
    useBmusicContext();
  const { setCurrentScreen } = useEastVoiceContext();
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "1.5"
  );
  const [fontFamily, setFontFamily] = useState(
    localStorage.getItem("fontFamily") || "'Georgia', serif"
  );
  const [displayCount, setDisplayCount] = useState(
    localStorage.getItem("displayCount") || "6"
  );
  const [layout, setLayout] = useState(
    localStorage.getItem("layout") || "table"
  );
  const [selectedBg, setSelectedBg] = useState(
    localStorage.getItem("selectedBg") || "bg1"
  );
  const [imagesPath, setImagePath] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);

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
    {
      id: "bg5",
      name: "Forest Calm",
      thumbnail: "./pi8.jpg",
      gradient: "bg-gradient-to-r from-green-100 to-emerald-100",
    },
    {
      id: "bg6",
      name: "Forest Calm",
      thumbnail: "./pic3.jpg",
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
    { value: "'Palatino Linotype', serif", label: "Palatino Linotype" },
    { value: "'Garamond', serif", label: "Garamond" },
    { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
    {
      value: "'Franklin Gothic Medium', sans-serif",
      label: "Franklin Gothic Medium",
    },
  ];

  const displayCountOptions = [
    { value: "4", label: "4 Items" },
    { value: "6", label: "6 Items" },
    { value: "8", label: "8 Items" },
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
      // setSongRepo(path);
      localStorage.setItem("vmusicimages", path);
      setCurrentScreen("backgrounds");
    }
  };

  const selectPresentationBackground = (imagepath: string) => {
    setSelectedBg(imagepath);
    setSelectedHymnBackground(imagepath);
    localStorage.setItem("bmusicpresentationbg", imagepath);
  };

  useEffect(() => {
    const savedCollections = localStorage.getItem("collections");
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
      localStorage.setItem("collections", JSON.stringify(sampleCollections));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("fontFamily", fontFamily);
    localStorage.setItem("displayCount", displayCount);
    localStorage.setItem("layout", layout);
    localStorage.setItem("selectedBg", selectedBg);
  }, [fontSize, fontFamily, displayCount, layout, selectedBg]);

  const renderContent = () => {
    switch (activeTab) {
      case "Song":
        return (
          <div className="flex items-start flex-col p-3">
            <h3 className="text-lg text-left skew-x-12 italic underline text-stone-600 font-semibold">
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
              <h3 className="text-lg font-semibold skew-x-12 italic">
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

              <CustomDropdown
                label="Items to Display"
                value={displayCount}
                onChange={setDisplayCount}
                options={displayCountOptions}
              />

              <div className="space-y-2">
                <label className="text-sm font-thin">Layout Style</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setLayout("table")}
                    className={`flex items-center space-x-2 p-2 text-[12px] rounded-lg ${
                      layout === "table"
                        ? "bg-[#9a674a] text-white"
                        : "bg-white"
                    }`}
                  >
                    <Grid size={12} />
                    <span>Grid</span>
                  </button>
                  <button
                    onClick={() => setLayout("list")}
                    className={`flex items-center space-x-2 text-[12px] p-2 rounded-lg ${
                      layout === "list" ? "bg-[#9a674a] text-white" : "bg-white"
                    }`}
                  >
                    <List size={12} />
                    <span>List</span>
                  </button>
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
                        theme === "creamy" ? "bg-[#9a674a]/30" : "bg-white"
                      } border-2 transition-all ${
                        selectedBg === bg.id
                          ? "border-[#9a674a]"
                          : "border-transparent hover:border-stone-200"
                      }`}
                    >
                      <div
                        className={` bg-cover h-16 rounded-md overflow-hidden`}
                        style={{ backgroundImage: `url(${bg.thumbnail})` }}
                      >
                        {selectedBg === bg.thumbnail && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#9a674a] rounded-full flex items-center justify-center">
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
                  className="w-full py-2 px-4  bg-white/50 border-2 border-[#9a674a]/20
                               hover:border-[#9a674a] text-[#9a674a] text-[12px] rounded-lg
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                >
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Images Directory</span>
                </button> */}
                <button
                  onClick={selectsongDir}
                  className="w-full py-2 px-4  bg-white/50 border-2 border-[#9a674a]/20
                               hover:border-[#9a674a] text-[#9a674a] text-[12px] rounded-lg
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                >
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Songs directory </span>
                </button>
                <button
                  onClick={() => selectImagesPath()}
                  className="w-full py-2 px-4  bg-white/50 border-2 border-[#9a674a]/20
                               hover:border-[#9a674a] text-[#9a674a] text-[12px] rounded-lg
                               transition-all duration-300 flex items-center justify-center gap-2
                               focus:outline-none group"
                >
                  <Wallpaper className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Presentation background path </span>
                </button>
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
                  theme === "creamy"
                    ? "bg-gradient-to-r from-[#f1e0b8] via-[#efccb6] to-[#faeed1]"
                    : "bg-white/90"
                } shadow rounded-lg backdrop-blur-sm transition-all hover:bg-white/40`}
              >
                <div className="flex flex-col justify-between items-start">
                  <div className=" w-full">
                    <h4 className="font-normal flex items-center gap-3 font-serif text-[12px]">
                      {collection.name}{" "}
                      <span>
                        <ExternalLink
                          className="h-4 w-4 text-[#9a674a] hover:scale-105 hover:cursor-pointer"
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
      // style={{
      //   fontFamily: fontFamily,
      //   fontSize: `${fontSize}px`,
      // }}
      className="w-72 pt-2 border-r border-stone-300 bg-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar shadow"
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-serif text-xl s font-bold text-[#9a674a] flex items-center gap-2">
          <Music className="w-5 h-5 animate-bounce" />
          Soul healing music
          <Music className="w-5 h-5 animate-bounce" />
        </h2>
      </div>

      <div className="px-2 ">
        <div
          className={`flex space-x-2 ${
            theme === "creamy" ? "bg-[#faeed1]" : "bg-[#ececeb]"
          } p-1 rounded-lg`}
        >
          <button
            onClick={() => setActiveTab("Song")}
            className={` py-2 rounded-md text-[12px] px-2 font-medium transition-colors flex items-center justify-center ${
              activeTab === "Song"
                ? "bg-[#9a674a] text-white"
                : "text-stone-600 bg-white"
            }`}
          >
            Song <FileMusic className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={` py-2 rounded-md text-[12px] px-2  font-medium transition-colors flex items-center justify-center ${
              activeTab === "settings"
                ? "bg-[#9a674a] text-white"
                : "text-stone-600 bg-white"
            }`}
          >
            Settings <CogIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`flex-1 py-2 rounded-md text-[12px] px-2 font-medium transition-colors flex items-center justify-center ${
              activeTab === "collections"
                ? "bg-[#9a674a] text-white"
                : "text-stone-600 bg-white"
            }`}
          >
            collections <Group className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-scroll no-scrollbar h-[70vh]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;
