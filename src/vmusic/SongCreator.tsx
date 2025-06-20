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
} from "lucide-react";
import { BoldOutlined } from "@ant-design/icons";
import { VersePaste } from "./VersePaste";
import { ChorusPaste } from "./ChorusPaste";

interface CustomEditorProps {
  formData: any;
  setFormData: (data: any) => void;
}

const CustomEditor = ({ formData, setFormData }: CustomEditorProps) => {
  const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["paragraph", "heading", "placeholder"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({
        placeholder:
          "Click to start typing...(paste verse/chorus indicator from the menubar)",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-stone-500 dark:before:text-stone-600 placeholder:stone-stone-500 before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content: formData.message || "",
    editorProps: {
      attributes: {
        class:
          "   text-[15px] border placehoder:text-stone-500 text-black  max-w-none px-6 py-4 w-full focus:outline-none font-[garamond] min-h-full",
        "data-placeholder": "Click to start typing...",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      setFormData({
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
    tooltip,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        relative group p-2.5 rounded-xl transition-all duration-300 ease-out
        ${
          isActive
            ? "bg-[#8b5a3c] text-white shadow-lg transform scale-105 shadow-[#8b5a3c]/25"
            : "bg-[#9a674a]/70 text-white/90 hover:bg-[#8b5a3c] hover:text-white hover:shadow-lg hover:transform hover:scale-105 hover:shadow-[#8b5a3c]/25"
        }
        backdrop-blr-sm border border-white/10
      `}
    >
      <div className="relative z-10">{children}</div>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1" />
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
    <div className="h-full w-full overflow-hidden no-scrollbar font-[garamond] flex flex-col">
      {/* Container with relative positioning for the toolbar */}
      <div className="border border-gray-200/50 rounded-2xl shadow-2xl my-2  overflow-hidden h-full w-full backdrop-blur-sm flex flex-col">
        {/* Fixed Toolbar within the component */}
        <div className="fixed w-full  z-10 bg-[#faeed1] backdrop-blur-md border-b border-gray-200/30 p-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Alignment Controls */}
            <div className="flex items-center gap-1.5 bg-[#faeed1] rounded-2xl p-1.5 backdrop-blur-sm border border-gray-200/30">
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                isActive={editor.isActive({ textAlign: "left" })}
                tooltip="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                isActive={editor.isActive({ textAlign: "center" })}
                tooltip="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                isActive={editor.isActive({ textAlign: "right" })}
                tooltip="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                isActive={editor.isActive({ textAlign: "justify" })}
                tooltip="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </MenuButton>
            </div>

            <ToolbarDivider />

            {/* Text Formatting */}
            <div className="flex items-center gap-1.5 bg-gray-50/80 rounded-2xl p-1.5 backdrop-blur-sm border border-gray-200/30">
              <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                tooltip="Bold"
              >
                <BoldOutlined className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                onClick={toggleCapitalize}
                tooltip="Capitalize Selection"
              >
                <Type className="w-4 h-4" />
              </MenuButton>
            </div>

            <ToolbarDivider />

            {/* Content Actions */}
            <div className="flex items-center gap-1.5 bg-gray-50/80 rounded-2xl p-1.5 backdrop-blur-sm border border-gray-200/30">
              <VersePaste editor={editor} />
              <ChorusPaste editor={editor} />
            </div>

            <ToolbarDivider />

            {/* Clear Content */}
            <MenuButton onClick={clearContent} tooltip="Clear All Content">
              <X className="w-4 h-4" />
            </MenuButton>
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar shadow-inner mt-20">
          <style>
            {`
              .ProseMirror p {
                color: black !important;
              }
              @media (prefers-color-scheme: dark) {
                .ProseMirror p {
                  color: black !important;
                }
              }
            `}
          </style>
          <EditorContent
            editor={editor}
            className="h-full p-6 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomEditor;
