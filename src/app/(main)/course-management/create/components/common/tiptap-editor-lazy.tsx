import { lazy, Suspense } from "react";
import { Spin } from "antd";

const TiptapEditorLazy = lazy(() =>
  import("./tiptap-editor").then((module) => ({
    default: module.TiptapEditor,
  }))
);

interface TiptapEditorWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isPreview?: boolean;
  onBlur?: () => void;
}

export const TiptapEditorWrapper = (props: TiptapEditorWrapperProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center p-8 border rounded-lg bg-gray-50">
          <Spin tip="Đang tải trình soạn thảo..." />
        </div>
      }
    >
      <TiptapEditorLazy {...props} />
    </Suspense>
  );
};
