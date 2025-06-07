import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  X,
  BoldIcon,
} from "lucide-react";
import { ChorusPaste } from "./ChorusPaste";
import { VersePaste } from "./VersePaste";
import { useBmusicContext } from "@/Provider/Bmusic";

import { Song } from "@/types";

interface SongEditorProps {
  formData: any;
  setFormData: (data: any) => void;
}
const SongEditor = ({ formData, setFormData }: SongEditorProps) => {
  const { selectedSong, setSelectedSong } = useBmusicContext();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["paragraph", "heading", "placeholder"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({
        placeholder: "Click to start typing...",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-stone-300 dark:before:text-stone-600 before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content: `<p></p>${formData.message}`,
    editorProps: {
      attributes: {
        class:
          "dark:prose-invert prose-sm sm:prose-base text-text dark:text-dtext text-[14px] border  text-black lg:prose-lg max-w-none  px-6 py-4 h-[70vh] w-full focus:outline-none font-[garamond] ",
        "data-placeholder": "Click to start typing...",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      setFormData?.({
        ...formData,
        message: editor.getHTML(),
      });
    },
  });

  if (!editor) {
    return null;
  }

  const MenuButton = ({
    onClick,
    isActive = false,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`py-2 px-2 rounded-lg bg-[#9a674a]/80 transition-all duration-200 ${
        isActive
          ? "bg-[#9a674a] text-stone-500"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </button>
  );

  const toggleCapitalize = () => {
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(
      selection.from,
      selection.to,
      " "
    );
    editor.chain().focus().insertContent(text.toUpperCase()).run();
  };

  const clearContent = () => {
    editor.commands.clearContent();
  };

  return (
    <div className=" h-[95%] w-full overflow-x-hidden no-scrollbar  ">
      <div className="border border-gray-200 rounded-tr-lg rounded-tl-lg shadow-lg overflow-x-hidden  h-[95%] overflow-y-scroll no-scrollbar mx-2">
        {/* Menu Bar */}
        <div className="border-b bg-[#faeed1]   shadow-lg border-gray-200 p-2 mx-4  flex items-center gap-1 z-20 sticky top-0 rounded-lg">
          <div className="flex items-center gap-1 pr-2 border-r border border-gray-200">
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
            >
              <AlignLeft className="w-3 h-3 text-white" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
            >
              <AlignCenter className="w-3 h-3 text-white" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
            >
              <AlignRight className="w-3 h-3 text-white" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              isActive={editor.isActive({ textAlign: "justify" })}
            >
              <AlignJustify className="w-3 h-3 text-white" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-1 px-2">
            <MenuButton onClick={toggleCapitalize}>
              <Type className="w-3 h-3 text-white" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
            <MenuButton onClick={clearContent}>
              <X className="w-3 h-3" />
            </MenuButton>
          </div>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            // disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            <BoldIcon className="h-4 w-4 text-white" />
          </MenuButton>
          <VersePaste editor={editor} />
          <ChorusPaste editor={editor} />
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className=" max-w-[90%] p-4  focus:outline-none"
        />
      </div>

      {/* Debug: Show stored content */}
      {/* <div className="mt-4 p-4 rounded-lg bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Stored Content:
        </h3>
        <div className="text-sm text-gray-600">{content}</div>
      </div> */}
    </div>
  );
};

export default SongEditor;
