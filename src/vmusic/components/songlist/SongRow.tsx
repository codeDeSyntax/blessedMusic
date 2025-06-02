import React, { useCallback } from "react";
import { Song } from "@/types";

interface SongRowProps {
  song: Song;
  onSingleClick: (song: Song) => void;
  onDoubleClick: (song: Song) => void;
  isTable: boolean;
}

const SongRow = React.memo(
  ({ song, onSingleClick, onDoubleClick, isTable }: SongRowProps) => {
    const handleClick = useCallback(
      () => onSingleClick(song),
      [song, onSingleClick]
    );
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDoubleClick(song);
      },
      [song, onDoubleClick]
    );

    if (isTable) {
      return (
        <tr
          className="border-b z-0 border-stone-200 shadowinner flex items-center justify-between hover:bg-stone-100 transition-colors cursor-pointer"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#9a674a",
            borderBottomStyle: "dashed",
          }}
          title={song.path}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <td
            className="px-4 py-2 flex items-center justify-center gap-2 text-stone-600 text-[11px] font-medium"
            style={{ fontFamily: "Georgia" }}
          >
            <img src="./pdf.png" className="w-4 h-4" alt="PDF icon" />
            {song.title.charAt(0).toUpperCase() +
              song.title.slice(1).toLowerCase()}
          </td>
          <td className="px-4 py-1 text-stone-800 text-[10px] font-serif">
            {song.dateModified.slice(0, 10)}
          </td>
        </tr>
      );
    }

    return (
      <div
        className="flex items-center justify-between space-x-4 px-4 bod
       rounded-lg shadow-md hover:shadow-md duration-200 cursor-pointer 
        hover:bg-stone-100 transition-colors"
        title={song.path}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          borderWidth: 1,
          borderColor: "#9a674a",
          borderStyle: "dotted",
        }}
      >
        <div className="flex items-center gap-5">
          <img src="./pdf.png" className="w-4 h-4 pl-4" alt="PDF icon" />
          <h3 className="text-[12px] text-stone-800 font-serif font-thin">
            {song.title}
          </h3>
        </div>
        <p className="px-4 py-1 text-stone-800 text-[12px] text-right font-serif">
          {song.dateModified.slice(0, 10)}
        </p>
      </div>
    );
  }
);

SongRow.displayName = "SongRow";

export default SongRow;
