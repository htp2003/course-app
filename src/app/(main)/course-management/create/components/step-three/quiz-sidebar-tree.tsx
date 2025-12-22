import { useMemo, useState, useEffect, useRef } from "react";
import { Tree, Form, Empty } from "antd";
import {
  DownOutlined,
  AuditOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
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

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedChapters(rawChapters), 300);
    return () => clearTimeout(timer);
  }, [rawChapters]);

  useEffect(() => {
    if (debouncedChapters.length > 0) {
      const keysToExpand: string[] = [];
      debouncedChapters.forEach((chapter, cIdx) => {
        keysToExpand.push(`${cIdx}`);
        if (chapter.lessons) {
          chapter.lessons.forEach((lesson, lIdx) => {
            keysToExpand.push(`${cIdx}-${lIdx}`);
            if (lesson.quizzes) {
              lesson.quizzes.forEach((_, qIdx) => {
                keysToExpand.push(`${cIdx}-${lIdx}-${qIdx}`);
              });
            }
          });
        }
      });
      setExpandedKeys(keysToExpand);
    }
  }, [debouncedChapters]);

  useEffect(() => {
    if (debouncedChapters.length > 0 && !hasAutoSelectedRef.current) {
      let targetKey = "";

      for (let cIdx = 0; cIdx < debouncedChapters.length; cIdx++) {
        const chapter = debouncedChapters[cIdx];
        if (chapter.lessons && chapter.lessons.length > 0) {
          const firstLesson = chapter.lessons[0];

          if (firstLesson.quizzes && firstLesson.quizzes.length > 0) {
            targetKey = `${cIdx}-0-0`;
          } else {
            targetKey = `${cIdx}-0`;
          }
          break;
        }
      }

      if (targetKey) {
        setSelectedKeys([targetKey]);

        const parts = targetKey.split("-");
        const lessonKey = `${parts[0]}-${parts[1]}`;
        onSelectNode(lessonKey);

        hasAutoSelectedRef.current = true;
      }
    }
  }, [debouncedChapters, onSelectNode]);

  const treeData = useMemo(() => {
    return debouncedChapters.map((chapter, cIdx) => ({
      key: `${cIdx}`,
      title: (
        <span className="font-semibold text-lg">
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
            <span className="text-blue-600 font-medium">
              {quiz.title || `Quiz ${qIdx + 1}`}
            </span>
          ),
          icon: <AuditOutlined className="text-blue-500" />,
          children: quiz.questions?.map((q, questionIdx) => ({
            key: `${cIdx}-${lIdx}-${qIdx}-${questionIdx}`,
            title: (
              <span className="text-sm text-orange-500 truncate max-w-[150px] inline-block align-middle">
                {q.title || `Câu hỏi ${questionIdx + 1}`}
              </span>
            ),
            icon: <QuestionCircleOutlined className="text-xs text-gray-400" />,
            isLeaf: true,
          })),
        })),
      })),
    }));
  }, [debouncedChapters]);

  const onSelect: TreeProps["onSelect"] = (keys) => {
    if (!keys.length) return;

    setSelectedKeys(keys);

    const key = keys[0].toString();
    const parts = key.split("-");

    if (parts.length === 1) return;

    const lessonKey = `${parts[0]}-${parts[1]}`;
    onSelectNode(lessonKey);

    let anchorId = "";
    if (parts.length === 3) {
      anchorId = `anchor-quiz-${parts[0]}-${parts[1]}-${parts[2]}`;
    } else if (parts.length === 4) {
      anchorId = `anchor-question-${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
    }

    if (anchorId) {
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-blue-400", "transition-all");
          setTimeout(
            () => element.classList.remove("ring-2", "ring-blue-400"),
            2000
          );
        }
      }, 100);
    }
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
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

  if (debouncedChapters.length === 0)
    return <Empty description="Chưa có dữ liệu" className="mt-10" />;

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
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        treeData={treeData}
        onDrop={onDrop}
        switcherIcon={<DownOutlined />}
      />
    </div>
  );
};
