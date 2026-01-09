import { useMemo, memo } from "react";
import { Tree, Form } from "antd";
import {
  DownOutlined,
  AuditOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import type { DataNode, TreeProps } from "antd/es/tree";
import type { IChapter } from "../../../common/types/types";
import { handleDropLogic } from "../../utils/tree-utils";
import { useDebounce } from "../../../common/hooks/use-debounce";

interface TreeViewProps {
  chapters: IChapter[];
  onSelect: TreeProps["onSelect"];
  onDrop: TreeProps["onDrop"];
  isPreview?: boolean;
}

const notNull = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const TreeView = memo(
  ({ chapters, onSelect, onDrop, isPreview = false }: TreeViewProps) => {
    const treeData = useMemo(() => {
      const data: DataNode[] = chapters
        .map((chapter, cIdx): DataNode | null => {
          const lessonNodes: DataNode[] = (chapter.lessons || [])
            .map((lesson, lIdx): DataNode | null => {
              const quizCount = lesson.quizzes?.length || 0;
              if (isPreview && quizCount === 0) return null;
              return {
                key: `${cIdx}-${lIdx}`,
                title: <span>{lesson.title || `Bài ${lIdx + 1}`}</span>,
                children: (lesson.quizzes || []).map(
                  (quiz, qIdx): DataNode => ({
                    key: `${cIdx}-${lIdx}-${qIdx}`,
                    title: (
                      <span className="text-blue-600">
                        {quiz.title || `Quiz ${qIdx + 1}`}
                      </span>
                    ),
                    icon: <AuditOutlined className="text-blue-500" />,
                    children: (quiz.questions || []).map(
                      (question, questionIdx): DataNode => ({
                        key: `${cIdx}-${lIdx}-${qIdx}-${questionIdx}`,
                        title: (
                          <span className="text-gray-600 text-sm">
                            {question.title || `Câu hỏi ${questionIdx + 1}`}
                          </span>
                        ),
                        icon: (
                          <QuestionCircleOutlined className="text-gray-400" />
                        ),
                        isLeaf: true,
                      })
                    ),
                  })
                ),
              };
            })
            .filter(notNull);

          if (isPreview && lessonNodes.length === 0) return null;

          return {
            key: `${cIdx}`,
            title: (
              <span className="font-semibold">
                {chapter.title || `Chương ${cIdx + 1}`}
              </span>
            ),
            selectable: false,
            children: lessonNodes,
          };
        })
        .filter(notNull);

      return data;
    }, [chapters, isPreview]);

    if (chapters.length === 0 || treeData.length === 0) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 sticky top-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="mb-2 px-2 text-xs font-bold text-gray-400 uppercase">
          Cấu trúc bài thi
        </div>
        <Tree
          className="draggable-tree"
          draggable={!isPreview}
          blockNode
          showLine={{ showLeafIcon: false }}
          showIcon
          defaultExpandAll
          treeData={treeData}
          onSelect={onSelect}
          onDrop={isPreview ? undefined : onDrop}
          switcherIcon={<DownOutlined />}
        />
      </div>
    );
  }
);

interface Props {
  onSelectNode: (key: string, options?: { scroll?: boolean }) => void;
  isPreview?: boolean;
}

export const QuizSidebarTree = ({ onSelectNode, isPreview = false }: Props) => {
  const form = Form.useFormInstance();
  const rawChapters = (Form.useWatch("chapters", form) as IChapter[]) || [];
  const debouncedChapters = useDebounce(rawChapters, 300);

  const onSelect: TreeProps["onSelect"] = useMemo(
    () => (selectedKeys) => {
      if (!selectedKeys.length) return;
      const key = selectedKeys[0].toString();
      const parts = key.split("-");
      if (parts.length === 1) return;
      const lessonKey = `${parts[0]}-${parts[1]}`;
      onSelectNode(lessonKey);

      setTimeout(() => {
        let elementId = "";
        if (parts.length === 3) {
          elementId = `anchor-quiz-${parts[0]}-${parts[1]}-${parts[2]}`;
        } else if (parts.length === 4) {
          elementId = `anchor-question-${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
        }
        if (elementId) {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 150);
    },
    [onSelectNode]
  );

  const onDrop: TreeProps["onDrop"] = useMemo(
    () => (info) => {
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
    },
    [form]
  );

  return (
    <TreeView
      chapters={debouncedChapters}
      onSelect={onSelect}
      onDrop={onDrop}
      isPreview={isPreview}
    />
  );
};
