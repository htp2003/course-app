import { useEffect, useMemo, memo, useTransition } from "react"; // 1. Import useTransition
import { EditorContent, useEditor } from "@tiptap/react";
import { RichTextProvider } from "reactjs-tiptap-editor";
import "reactjs-tiptap-editor/style.css";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Dropcursor,
  Gapcursor,
  Placeholder,
  TrailingNode,
} from "@tiptap/extensions";
import { HardBreak } from "@tiptap/extension-hard-break";
import { ListItem } from "@tiptap/extension-list";
import {
  History,
  RichTextRedo,
  RichTextUndo,
} from "reactjs-tiptap-editor/history";
import {
  FontFamily,
  RichTextFontFamily,
} from "reactjs-tiptap-editor/fontfamily";
import { FontSize, RichTextFontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading, RichTextHeading } from "reactjs-tiptap-editor/heading";
import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import {
  RichTextUnderline,
  TextUnderline,
} from "reactjs-tiptap-editor/textunderline";
import { RichTextStrike, Strike } from "reactjs-tiptap-editor/strike";
import { Color, RichTextColor } from "reactjs-tiptap-editor/color";
import { Highlight, RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import { Emoji, RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import {
  BulletList,
  RichTextBulletList,
} from "reactjs-tiptap-editor/bulletlist";
import {
  OrderedList,
  RichTextOrderedList,
} from "reactjs-tiptap-editor/orderedlist";
import { RichTextAlign, TextAlign } from "reactjs-tiptap-editor/textalign";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import { Image, RichTextImage } from "reactjs-tiptap-editor/image";
import { RichTextVideo, Video } from "reactjs-tiptap-editor/video";
import { RichTextClear, Clear } from "reactjs-tiptap-editor/clear";
import {
  RichTextBubbleImage,
  RichTextBubbleLink,
  RichTextBubbleText,
  RichTextBubbleVideo,
} from "reactjs-tiptap-editor/bubble";
import { uploadImageAPI, uploadDocumentAPI } from "../../services/api";

const uploadToServer = async (files: File): Promise<string> => {
  try {
    // Determine if it's an image or document based on file type
    const isImage = files.type.startsWith("image/");

    const response = isImage
      ? await uploadImageAPI(files)
      : await uploadDocumentAPI(files);

    const data = response.data;

    // Extract URL from response - adjust based on your API response structure
    const url =
      (data as any)?.result?.rawUrl ||
      (data as any)?.result?.url ||
      (data as any)?.url ||
      (data as any)?.uri ||
      "";

    if (!url) {
      throw new Error("No URL in upload response");
    }

    return url;
  } catch (error) {
    console.error("Upload error:", error);
    // Fallback to blob URL if upload fails
    return URL.createObjectURL(files);
  }
};

const baseExtensions = [
  Document,
  Text,
  Paragraph,
  TextStyle,
  Dropcursor,
  Gapcursor,
  HardBreak,
  TrailingNode,
  ListItem,
  History,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  Clear,
  FontFamily,
  FontSize,
  Heading,
  Color,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  BulletList,
  OrderedList,
  Emoji,
  Link.configure({ openOnClick: false }),
  Image.configure({ upload: uploadToServer }),
  Video.configure({ upload: uploadToServer }),
];

const CustomToolbar = memo(() => {
  return (
    <div className="flex items-center gap-1 flex-wrap p-2 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <RichTextUndo />
        <RichTextRedo />
        <RichTextClear />
      </div>
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <RichTextFontFamily />
        <RichTextFontSize />
        <RichTextHeading />
      </div>
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <RichTextBold />
        <RichTextItalic />
        <RichTextUnderline />
        <RichTextStrike />
      </div>
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <RichTextColor />
        <RichTextHighlight />
        <RichTextEmoji />
      </div>
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <RichTextAlign />
        <RichTextBulletList />
        <RichTextOrderedList />
      </div>
      <div className="flex gap-1">
        <RichTextLink />
        <RichTextImage />
        <RichTextVideo />
      </div>
    </div>
  );
});

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const TiptapEditor = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: Props) => {
  const [, startTransition] = useTransition();

  const extensions = useMemo(() => {
    return [
      ...baseExtensions,
      Placeholder.configure({
        placeholder: placeholder || "Nhập nội dung mô tả chi tiết...",
      }),
    ];
  }, [placeholder]);

  const editor = useEditor(
    {
      editable: !readOnly,
      content: value,
      extensions: extensions,

      immediatelyRender: false,
      shouldRerenderOnTransaction: false,


      editorProps: {
        attributes: {
          class: [
            "prose prose-sm max-w-none min-h-[250px] p-4 focus:outline-none transition-all",
            readOnly ? "bg-transparent px-0" : "bg-white",
          ].join(" "),
        },
      },
      onUpdate: ({ editor }) => {
        if (onChange) {

          startTransition(() => {
            onChange(editor.getHTML());
          });
        }
      },
    },
    [extensions, readOnly]
  );

  useEffect(() => {

    if (editor && value !== undefined && !editor.isDestroyed) {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) return null;

  if (readOnly) {
    return (
      <div
        className="prose prose-sm max-w-none tiptap-renderer"
        dangerouslySetInnerHTML={{
          __html:
            value || '<p class="text-gray-400 italic">Chưa có nội dung</p>',
        }}
      />
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:border-blue-400 transition-colors">
      <RichTextProvider editor={editor}>
        <div className="flex flex-col w-full">
          <CustomToolbar />
          <EditorContent editor={editor} />
          <RichTextBubbleText />
          <RichTextBubbleImage />
          <RichTextBubbleVideo />
          <RichTextBubbleLink />
        </div>
      </RichTextProvider>
    </div>
  );
};