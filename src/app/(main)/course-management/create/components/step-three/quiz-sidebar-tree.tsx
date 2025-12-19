import { useMemo, useState, useEffect } from "react";
import { Tree, Form } from "antd";
import { DownOutlined, AuditOutlined } from "@ant-design/icons";
import type { TreeProps } from "antd/es/tree";
import type { IChapter } from "../../../common/types";
import { handleDropLogic } from "../../utils/tree-utils";
interface Props {
  onSelectNode: (key: string) => void;
}
export const QuizSidebarTree = ({ onSelectNode }: Props) => {
  const form = Form.useFormInstance();
  const rawChapters = (Form.useWatch("chapters", form) as IChapter[]) || [];
  const [debouncedChapters, setDebouncedChapters] =
    useState<IChapter[]>(rawChapters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedChapters(rawChapters), 300);
    return () => clearTimeout(timer);
  }, [rawChapters]);

  const treeData = useMemo(() => {
    return debouncedChapters.map((chapter, cIdx) => ({
      key: `${cIdx}`,
      title: (
        <span className="font-semibold">
          {chapter.title || `Chương ${cIdx + 1}`}
        </span>
      ),
      selectable: false,
      children: chapter.lessons?.map((lesson, lIdx) => ({
        key: `${cIdx}-${lIdx}`,
        title: <span>{lesson.title || `Bài ${lIdx + 1}`}</span>,
        children: lesson.quizzes?.map((quiz, qIdx) => ({
          key: `${cIdx}-${lIdx}-${qIdx}`,
          title: (
            <span className="text-blue-600">
              {quiz.title || `Quiz ${qIdx + 1}`}
            </span>
          ),
          icon: <AuditOutlined className="text-blue-500" />,
          isLeaf: true,
        })),
      })),
    }));
  }, [debouncedChapters]);

  const onSelect: TreeProps["onSelect"] = (selectedKeys) => {
    if (!selectedKeys.length) return;
    const key = selectedKeys[0].toString();
    const parts = key.split("-");
    if (parts.length === 1) return;
    const lessonKey = `${parts[0]}-${parts[1]}`;
    onSelectNode(lessonKey);
  };

  const onDrop: TreeProps["onDrop"] = (info) => {
    const data = form.getFieldValue("chapters") as IChapter[];
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
  };

  if (debouncedChapters.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 sticky top-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="mb-2 px-2 text-xs font-bold text-gray-400 uppercase">
        Cấu trúc bài thi
      </div>
      <Tree
        className="draggable-tree"
        draggable
        blockNode
        showLine={{ showLeafIcon: false }}
        showIcon
        defaultExpandAll
        treeData={treeData}
        onSelect={onSelect}
        onDrop={onDrop}
        switcherIcon={<DownOutlined />}
      />
    </div>
  );
};
