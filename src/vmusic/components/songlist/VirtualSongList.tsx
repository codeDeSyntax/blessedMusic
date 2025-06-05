import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Song } from "@/types";
import SongRow from "./SongRow";
import { useBmusicContext } from "@/Provider/Bmusic";

interface VirtualSongListProps {
  songs: Song[];
  viewMode: string;
  onSingleClick: (song: Song) => void;
  onDoubleClick: (song: Song) => void;
  containerHeight?: number;
}

const ITEM_HEIGHT = 60; // Approximate height of each song item
const BUFFER_SIZE = 5; // Number of items to render outside visible area

const VirtualSongList = React.memo(
  ({
    songs,
    viewMode,
    onSingleClick,
    onDoubleClick,
    containerHeight = 600,
  }: VirtualSongListProps) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(
      null
    );
    const { theme } = useBmusicContext();

    const visibleItems = useMemo(() => {
      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE
      );
      const endIndex = Math.min(
        songs.length - 1,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
      );
      return { startIndex, endIndex };
    }, [scrollTop, containerHeight, songs.length]);

    const visibleSongs = useMemo(() => {
      return songs.slice(visibleItems.startIndex, visibleItems.endIndex + 1);
    }, [songs, visibleItems]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const totalHeight = songs.length * ITEM_HEIGHT;
    const offsetY = visibleItems.startIndex * ITEM_HEIGHT;

    if (viewMode === "table") {
      return (
        <div
          ref={setContainerRef}
          className="overflow-y-auto w-full no-scrollbar h-full"
          onScroll={handleScroll}
          style={{
            height: containerHeight,
          }}
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <table className="w-full table-auto rounded-md">
                <thead
                  className="rounded-md sticky top-0  z-10"
                  style={{
                    backgroundColor: theme === "creamy" ? "#fdf4d0" : "#f9f9f9",
                  }}
                >
                  <tr className="text-[#9a674a] rounded-md">
                    <th
                      className="px-4 text-left flex justify-between items-center"
                      style={{
                        borderWidth: 2,
                        borderColor: "#9a674a",
                        borderStyle: "dashed",
                        borderRadius: 10,
                      }}
                    >
                      <p>Title</p>
                      <p className="font-bold lg:hidden">
                        ||||||||||||||||||||||||||||||||||||||||
                      </p>
                      <p className="font-bold hidden lg:block">
                        |||||||||||||||||||||||||||||||||
                      </p>
                      Modified
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSongs.map((song, index) => (
                    <SongRow
                      key={`${song.path}-${visibleItems.startIndex + index}`}
                      song={song}
                      onSingleClick={onSingleClick}
                      onDoubleClick={onDoubleClick}
                      isTable={true}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={setContainerRef}
        className="w-full overflow-y-auto no-scrollbar h-full"
        onScroll={handleScroll}
        style={{ height: containerHeight }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <div className="space-y-4 w-full">
              <div
                className="flex items-center justify-between space-x-4 px-8 bod rounded-lg shadow-md
               hover:shadow-md transition-all duration-200 cursor-pointer sticky top-0 bg-white z-10"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#9a674a",
                  borderBottomStyle: "solid",
                }}
              >
                <p className="text-[13px] font-bold font-mono text-[#9a674a]">
                  Title
                </p>
                |||||||||||||||||||||||
                <p className="text-[13px] font-bold font-mono text-[#9a674a]">
                  Modified
                </p>
              </div>
              {visibleSongs.map((song, index) => (
                <SongRow
                  key={`${song.path}-${visibleItems.startIndex + index}`}
                  song={song}
                  onSingleClick={onSingleClick}
                  onDoubleClick={onDoubleClick}
                  isTable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VirtualSongList.displayName = "VirtualSongList";

export default VirtualSongList;
