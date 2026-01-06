import { useEffect, useMemo, memo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { RichTextProvider } from "reactjs-tiptap-editor";
import "reactjs-tiptap-editor/style.css";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import { Dropcursor, Gapcursor, TrailingNode } from "@tiptap/extensions";
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
import { RichTextClear, Clear } from "reactjs-tiptap-editor/clear";
import {
  RichTextBubbleLink,
  RichTextBubbleText,
} from "reactjs-tiptap-editor/bubble";
import Youtube from "@tiptap/extension-youtube";

const YOUTUBE_ID_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[&#?].*)?$/i;

const extractYouTubeId = (url: string): string | null => {
  const match = url.trim().match(YOUTUBE_ID_REGEX);
  return match ? match[1] : null;
};

const toYouTubeEmbedUrl = (url: string, nocookie = true) => {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube${nocookie ? "-nocookie" : ""}.com/embed/${id}`;
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
  Youtube.configure({ nocookie: true, controls: true }),
];

const CustomToolbar = memo(() => (
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
    </div>
  </div>
));

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  isPreview?: boolean;
  onBlur?: () => void;
}

export const TiptapEditor = memo(
  ({ value, onChange, isPreview = false, onBlur }: Props) => {
    const isInternalUpdate = useRef(false);

    const extensions = useMemo(() => [...baseExtensions], []);

    const editor = useEditor(
      {
        editable: !isPreview,
        content: value,
        extensions,
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
          attributes: {
            class: [
              "prose prose-sm max-w-none min-h-[250px] p-4 focus:outline-none transition-all selection:bg-blue-600 selection:text-white text-slate-900",
              isPreview ? "bg-gray-50/50 cursor-default" : "bg-white",
            ].join(" "),
          },
        },
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          if (html !== value) {
            isInternalUpdate.current = true;
            onChange?.(html);
            setTimeout(() => {
              isInternalUpdate.current = false;
            }, 0);
          }
        },
        onBlur: () => {
          onBlur?.();
        },
      },
      []
    );

    useEffect(() => {
      if (editor && value !== undefined && !isInternalUpdate.current) {
        const currentContent = editor.getHTML();
        const normalizedValue = value === "" ? "<p></p>" : value;
        if (currentContent !== normalizedValue) {
          editor.commands.setContent(value, { emitUpdate: false });
        }
      }
    }, [value, editor]);

    useEffect(() => {
      if (editor && !editor.isDestroyed) {
        editor.setEditable(!isPreview);
      }
    }, [isPreview, editor]);

    useEffect(() => {
      if (!editor || isPreview) return;
      const dom = editor.view.dom;
      const onPaste = (e: ClipboardEvent) => {
        const text = e.clipboardData?.getData("text/plain");
        if (!text) return;
        const embed = toYouTubeEmbedUrl(text, true);
        if (embed) {
          e.preventDefault();
          editor.chain().focus().setYoutubeVideo({ src: embed }).run();
        }
      };
      dom.addEventListener("paste", onPaste);
      return () => dom.removeEventListener("paste", onPaste);
    }, [editor, isPreview]);

    if (!editor) return null;

    return (
      <div
        className={[
          "tiptap-editor border rounded-lg overflow-hidden transition-all duration-300",
          isPreview
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 bg-white shadow-sm hover:border-blue-400",
        ].join(" ")}
      >
        <RichTextProvider editor={editor}>
          <div className="flex flex-col w-full relative">
            <div
              className={
                isPreview ? "pointer-events-none grayscale opacity-40" : ""
              }
            >
              <CustomToolbar />
            </div>

            <EditorContent editor={editor} />

            {!isPreview && (
              <>
                <RichTextBubbleText />
                <RichTextBubbleLink />
              </>
            )}
          </div>
        </RichTextProvider>
      </div>
    );
  }
);

TiptapEditor.displayName = "TiptapEditor";
