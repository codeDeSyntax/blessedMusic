import React, { useEffect, useState, useMemo, useCallback } from "react";
import TitleBar from "../shared/TitleBar";
import Sidebar from "./Sidebar";
import DeletePopup from "./DeletePopup";
import HeaderControls from "./components/songlist/HeaderControls";
import VirtualSongList from "./components/songlist/VirtualSongList";
import LoadingError from "./components/songlist/LoadingError";
import { useBmusicContext } from "@/Provider/Bmusic";
import { Song } from "@/types";
import { useEastVoiceContext } from "@/Provider/EastVoice";
import { useTheme } from "@/Provider/Theme";

const BlessedMusic = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("collections");
  const [deleting, setDeleting] = useState(false);
  const [showDeleting, setShowDeleting] = useState(false);

  // Get viewMode from localStorage only once on mount
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("layout") || "table"
  );

  const {
    songRepo,
    setSongRepo,
    theme,
    setTheme,
    selectedSong,
    setSelectedSong,
    fetching,
    favorites,
    fetchError,
    songs,
    refetch,
  } = useBmusicContext();

  const { setCurrentScreen } = useEastVoiceContext();
  const { isDarkMode } = useTheme();

  const [savedFavorites, setSavedFavorites] = useState<Song[]>(favorites);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Handle window resize for responsive columns
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine number of columns based on screen size
  const numberOfColumns = useMemo(() => {
    return windowWidth >= 1024 ? 3 : 2; // 3 columns for lg and above, 2 for smaller screens
  }, [windowWidth]);

  // Memoized filtered songs calculation
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.content.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  // Memoized split songs calculation for multiple columns
  const columnSongs = useMemo(() => {
    const songsPerColumn = Math.ceil(filteredSongs.length / numberOfColumns);
    const columns: Song[][] = [];

    for (let i = 0; i < numberOfColumns; i++) {
      const startIndex = i * songsPerColumn;
      const endIndex = Math.min(
        startIndex + songsPerColumn,
        filteredSongs.length
      );
      columns.push(filteredSongs.slice(startIndex, endIndex));
    }

    return columns;
  }, [filteredSongs, numberOfColumns]);

  // Update localStorage when viewMode changes
  useEffect(() => {
    localStorage.setItem("bmusiclayout", viewMode);
  }, [viewMode]);

  // Memoized callbacks to prevent unnecessary re-renders
  const onSingleClick = useCallback(
    (song: Song) => {
      setSelectedSong(song);
      setActiveTab("Song");
      localStorage.setItem("selectedSong", JSON.stringify(song));
    },
    [setSelectedSong, setActiveTab]
  );

  const onDoubleClick = useCallback(
    (song: Song) => {
      if (selectedSong) {
        setCurrentScreen("Presentation");
        localStorage.setItem("selectedSong", JSON.stringify(song));
      }
    },
    [selectedSong, setCurrentScreen]
  );

  const presentSong = useCallback((selectedSong: any) => {
    if (selectedSong) {
      localStorage.setItem("selectedSong", JSON.stringify(selectedSong));
      window.api.projectSong(selectedSong);
      window.api.onDisplaySong((selectedSong) => {
        console.log(`songData: ${selectedSong.title}`);
      });
    }
  }, []);

  const changeDirectory = useCallback(async () => {
    const path = await window.api.selectDirectory();
    if (typeof path === "string") {
      setSongRepo(path);
      localStorage.setItem("bmusicsongdir", path);
    }
    const savedDirectory = localStorage.getItem("bmusicsongdir");
    if (savedDirectory) {
      setSongRepo(savedDirectory);
    }
  }, [setSongRepo]);

  const deleteSong = useCallback(
    async (filePath: string) => {
      try {
        setDeleting(true);
        const response = await window.api.deleteSong(filePath);
        console.log("Delete song response:", response);
        setDeleting(false);
        setShowDeleting(false);
        refetch();
      } catch (error) {
        console.error("Failed to delete song:", error);
      }
    },
    [refetch]
  );

  // Optimized keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedSong) {
        presentSong(selectedSong);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedSong, presentSong]);

  // Optimized localStorage initialization
  useEffect(() => {
    const savedDirectory = localStorage.getItem("bmusic");
    const savedTheme = localStorage.getItem("bmusic");

    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedDirectory) {
      setSongRepo(savedDirectory);
      console.log("Saved directory:", savedDirectory);
    }
  }, [setTheme, setSongRepo]);

  // Memoized button handlers
  const handleEditClick = useCallback(() => {
    setCurrentScreen("edit");
  }, [setCurrentScreen]);

  const handlePresentationClick = useCallback(() => {
    setCurrentScreen("Presentation");
  }, [setCurrentScreen]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleting(true);
  }, []);

  const handleDeselectClick = useCallback(() => {
    setSelectedSong(null);
  }, [setSelectedSong]);

  const handleCreateClick = useCallback(() => {
    setCurrentScreen("create");
  }, [setCurrentScreen]);

  const handlePresentSongClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      presentSong(selectedSong);
    },
    [presentSong, selectedSong]
  );

  // Memoized random color for folder icon
  const folderColor = useMemo(
    () =>
      `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},1)`,
    []
  );

  return (
    <div className="w-screen h-screen overflow-y-scroll no-scrollbar dark:bg-ltgray bg-cover">
      <TitleBar />
      {showDeleting && (
        <DeletePopup
          deleting={deleting}
          setDeleting={setDeleting}
          refetch={refetch}
          showDeleting={showDeleting}
          setShowDeleting={setShowDeleting}
          songPath={selectedSong?.path || ""}
          deleteSong={deleteSong}
        />
      )}
      <div
        className={`flex h-screen no-scrollbar ${
          theme === "creamy" ? "gridb1" : "gridb"
        }`}
      >
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedFavorites={savedFavorites}
          setSavedFavorites={setSavedFavorites}
        />
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto h-full no-scrollbar">
          <div className="backdrop-blur-lg p-6">
            {/* Header with Search Bar and View Toggle */}
            <HeaderControls
              selectedSong={selectedSong}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              songRepo={songRepo}
              folderColor={folderColor}
              onEditClick={handleEditClick}
              onPresentationClick={handlePresentationClick}
              onDeleteClick={handleDeleteClick}
              onDeselectClick={handleDeselectClick}
              onCreateClick={handleCreateClick}
              onPresentSongClick={handlePresentSongClick}
              onRefetch={refetch}
              onChangeDirectory={changeDirectory}
            />

            {/* Multi-Column Content with Virtual Scrolling */}
            <div
              className={`flex gap-6 w-full h-[80vh] ${
                numberOfColumns === 3 ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              <LoadingError
                fetching={fetching}
                fetchError={fetchError}
                songsLength={songs.length}
              />

              {!fetching && songs.length > 0 && (
                <>
                  {columnSongs.map((columnSongList, columnIndex) => (
                    <div key={columnIndex} className="flex-1">
                      <VirtualSongList
                        songs={columnSongList}
                        viewMode={viewMode}
                        onSingleClick={onSingleClick}
                        onDoubleClick={onDoubleClick}
                        containerHeight={window.innerHeight * 0.8}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlessedMusic;
