import { memo, useMemo, useState, useEffect } from "react";
import { Tree, Form, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { TreeProps } from "antd/es/tree";
import type {
  ICreateCourseForm,
  IChapter,
  ILesson,
} from "../../../common/types/types";
import { handleDropLogic } from "../../utils/tree-utils";
import { useDebounce } from "../../../common/hooks/use-debounce";

const treeNodeStyles = `
  .draggable-tree .ant-tree-node-content-wrapper {
    overflow: visible;
    max-width: 100%;
    word-break: break-word;
    white-space: normal;
}
  .draggable-tree .ant-tree-title {
    overflow: visible;
    word-break: break-word;
    white-space: normal;
  }
`;

interface TreeViewProps {
  chapters: IChapter[];
  onSelect: TreeProps["onSelect"];
  onDrop: TreeProps["onDrop"];
  isPreview?: boolean;
}

const TreeView = memo(
  ({ chapters, onSelect, onDrop, isPreview = false }: TreeViewProps) => {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    useEffect(() => {
      if (chapters) {
        const allChapterKeys = chapters.map((_, index) => String(index));
        setExpandedKeys(allChapterKeys);
      }
    }, [chapters]);

    const treeData = useMemo(() => {
      return (chapters || []).map((chapter: IChapter, cIdx: number) => ({
        key: `${cIdx}`,
        title: (
          <span className="font-semibold text-gray-700 block break-words whitespace-normal max-w-[350px]">
            {chapter.title || (
              <span className="text-gray-400 italic">Chương chưa đặt tên</span>
            )}
          </span>
        ),
        selectable: true,
        children: chapter.lessons?.map((lesson: ILesson, lIdx: number) => ({
          key: `${cIdx}-${lIdx}`,
          title: (
            <span className="block break-words whitespace-normal max-w-[400px]">
              {lesson.title || (
                <span className="text-gray-400 italic">Bài học mới</span>
              )}
            </span>
          ),
          isLeaf: true,
          selectable: true,
        })),
      }));
    }, [chapters]);

    const onExpand = (newExpandedKeys: React.Key[]) => {
      setExpandedKeys(newExpandedKeys);
    };

    if (!chapters || chapters.length === 0) {
      return (
        <div className="p-8 text-center text-gray-400">
          <Typography.Text type="secondary">Chưa có nội dung</Typography.Text>
        </div>
      );
    }

    return (
      <Tree
        className="draggable-tree"
        draggable={!isPreview}
        blockNode
        showLine={{ showLeafIcon: false }}
        showIcon
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        treeData={treeData}
        onSelect={onSelect}
        onDrop={isPreview ? undefined : onDrop}
        switcherIcon={<DownOutlined />}
      />
    );
  }
);

interface Props {
  isPreview?: boolean;
  anchorPrefix?: string;
  anchorRootId?: string;
}

export const CourseCurriculumTree = ({
  isPreview = false,
  anchorPrefix = "anchor",
  anchorRootId,
}: Props) => {
  const form = Form.useFormInstance<ICreateCourseForm>();
  const rawChapters = (Form.useWatch("chapters", form) as IChapter[]) || [];
  const debouncedChapters = useDebounce(rawChapters, 500);

  const onSelect: TreeProps["onSelect"] = useMemo(
    () => (selectedKeys) => {
      if (!selectedKeys.length) return;
      const key = selectedKeys[0].toString();
      const elementId = `${anchorPrefix}-${key}`;
      let element: HTMLElement | null = null;

      if (anchorRootId) {
        const root = document.getElementById(anchorRootId);
        element =
          root?.querySelector<HTMLElement>(`#${CSS.escape(elementId)}`) ?? null;
      }

      if (!element) {
        element = document.getElementById(elementId);
      }
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [anchorPrefix, anchorRootId]
  );

  const onDrop: TreeProps["onDrop"] = useMemo(
    () => (info) => {
      const data = form.getFieldValue("chapters") || [];
      const newChapters = handleDropLogic(
        data,
        info.dragNode.key.toString(),
        info.node.key.toString(),
        info.dropPosition,
        info.node.pos
      );
      if (newChapters) {
        form.setFieldValue("chapters", newChapters);
      }
    },
    [form]
  );

  return (
    <>
      <style>{treeNodeStyles}</style>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
        <TreeView
          chapters={debouncedChapters}
          onSelect={onSelect}
          onDrop={onDrop}
          isPreview={isPreview}
        />
      </div>
    </>
  );
};
