import { memo, useEffect, useMemo } from "react";
import { Form, Select, Typography } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { LessonQuizGroup } from "./lesson-quiz-group";
interface Props {
  selectedKey: string | null;
  onSelectNode: (key: string, options?: { scroll?: boolean }) => void;
  isPreview?: boolean;
}

interface ChaptersProp {
  title?: string;
  lessons?: { title?: string; quizzes?: unknown[] }[];
}

const structureSignature = (chapters?: ChaptersProp[]) => {
  if (!Array.isArray(chapters)) return "";
  const simplified = chapters.map((ch) => ({
    title: ch?.title?.trim() || "",
    lessons: Array.isArray(ch?.lessons)
      ? ch.lessons.map((ls) => ls?.title?.trim() || "")
      : [],
  }));
  return JSON.stringify(simplified);
};

const RightPaneBody = memo(
  ({
    chapters,
    selectedKey,
    onSelectNode,
    isPreview = false,
  }: {
    chapters?: ChaptersProp[];
    selectedKey: string | null;
    onSelectNode: (key: string, options?: { scroll?: boolean }) => void;
    isPreview?: boolean;
  }) => {
    const firstValidKey = useMemo(() => {
      if (!chapters?.length) return null;
      for (let c = 0; c < chapters.length; c += 1) {
        const lessons = chapters[c]?.lessons || [];
        if (!lessons.length) continue;

        if (!isPreview) return `${c}-0`;

        for (let l = 0; l < lessons.length; l += 1) {
          const quizCount = (lessons[l]?.quizzes as unknown[] | undefined)
            ?.length;
          if ((quizCount || 0) > 0) return `${c}-${l}`;
        }
      }
      return null;
    }, [chapters, isPreview]);

    useEffect(() => {
      if (!selectedKey && firstValidKey) {
        onSelectNode(firstValidKey, { scroll: false });
      }
    }, [selectedKey, firstValidKey, onSelectNode]);

    const [selectedChapterIdx, selectedLessonIdx] = useMemo(() => {
      if (!selectedKey) return [undefined, undefined] as const;
      const [c, l] = selectedKey.split("-").map((v) => Number(v));
      if (Number.isNaN(c) || Number.isNaN(l)) return [undefined, undefined];
      return [c, l] as const;
    }, [selectedKey]);

    const chapterOptions = useMemo(
      () =>
        (chapters || [])
          .map((ch, idx) => {
            if (!isPreview) {
              return {
                label: ch?.title?.trim() || `Chương ${idx + 1}`,
                value: idx,
              };
            }

            const lessons = ch?.lessons || [];
            const hasAnyQuizLesson = lessons.some(
              (ls) => (ls?.quizzes?.length || 0) > 0
            );
            if (!hasAnyQuizLesson) return null;

            return {
              label: ch?.title?.trim() || `Chương ${idx + 1}`,
              value: idx,
            };
          })
          .filter(Boolean) as { label: string; value: number }[],
      [chapters, isPreview]
    );

    const lessonOptions = useMemo(() => {
      if (selectedChapterIdx === undefined)
        return [] as { label: string; value: number }[];
      const lessons = chapters?.[selectedChapterIdx]?.lessons || [];
      return lessons
        .map((ls, idx) => {
          if (isPreview && (ls?.quizzes?.length || 0) === 0) return null;
          return {
            label: ls?.title?.trim() || `Bài ${idx + 1}`,
            value: idx,
          };
        })
        .filter(Boolean) as { label: string; value: number }[];
    }, [chapters, selectedChapterIdx, isPreview]);

    const handleChapterChange = (chapterIdx: number) => {
      const lessons = chapters?.[chapterIdx]?.lessons || [];
      const nextLessonIdx = !isPreview
        ? 0
        : lessons.findIndex((ls) => (ls?.quizzes?.length || 0) > 0);
      onSelectNode(`${chapterIdx}-${nextLessonIdx >= 0 ? nextLessonIdx : 0}`);
    };

    const handleLessonChange = (lessonIdx: number) => {
      if (selectedChapterIdx === undefined) return;
      onSelectNode(`${selectedChapterIdx}-${lessonIdx}`);
    };

    if (!chapters?.length) {
      return (
        <div className="flex flex-col justify-center items-center h-[400px] bg-white rounded-lg border border-dashed border-gray-300">
          <BookOutlined className="text-4xl text-gray-300 mb-4" />
          <Typography.Text type="secondary">
            Hiện chưa có chương/bài để tạo bài kiểm tra.
          </Typography.Text>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 pb-20 animate-fade-in">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-wrap gap-4">
          <div className="flex flex-col gap-2 min-w-[220px]">
            <Typography.Text className="font-semibold text-gray-700">
              Chọn chương
            </Typography.Text>
            <Select
              placeholder="Chọn chương"
              options={chapterOptions}
              value={selectedChapterIdx}
              onChange={handleChapterChange}
              className="w-full"
              // disabled={isPreview}
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[260px]">
            <Typography.Text className="font-semibold text-gray-700">
              Bài
            </Typography.Text>
            <Select
              placeholder="Chọn bài học"
              options={lessonOptions}
              value={lessonOptions.length ? selectedLessonIdx : undefined}
              onChange={handleLessonChange}
              // disabled={!lessonOptions.length || isPreview}
              className="w-full"
            />
          </div>
        </div>

        {selectedChapterIdx === undefined ? (
          <div className="flex flex-col justify-center items-center h-[320px] bg-white rounded-lg border border-dashed border-gray-300">
            <BookOutlined className="text-4xl text-gray-300 mb-4" />
            <Typography.Text type="secondary">
              Vui lòng chọn một <strong>Bài học</strong> để thiết lập bài kiểm
              tra.
            </Typography.Text>
          </div>
        ) : !lessonOptions.length ? (
          <div className="flex flex-col justify-center items-center h-[320px] bg-white rounded-lg border border-dashed border-gray-300">
            <BookOutlined className="text-4xl text-gray-300 mb-4" />
            <Typography.Text type="secondary">
              Chương này chưa có bài học để tạo bài kiểm tra.
            </Typography.Text>
          </div>
        ) : selectedLessonIdx === undefined ? (
          <div className="flex flex-col justify-center items-center h-[320px] bg-white rounded-lg border border-dashed border-gray-300">
            <BookOutlined className="text-4xl text-gray-300 mb-4" />
            <Typography.Text type="secondary">
              Vui lòng chọn một <strong>Bài học</strong> để thiết lập bài kiểm
              tra.
            </Typography.Text>
          </div>
        ) : (
          <div
            id={`anchor-quiz-lesson-${selectedChapterIdx}-${selectedLessonIdx}`}
            className="scroll-mt-24"
          >
            <LessonQuizGroup
              chapterIndex={selectedChapterIdx}
              lessonIndex={selectedLessonIdx}
              isPreview={isPreview}
            />
          </div>
        )}
      </div>
    );
  }
);

RightPaneBody.displayName = "RightPaneBody";

export const StepThreeRightPane = memo(
  ({ selectedKey, onSelectNode, isPreview = false }: Props) => {
    return (
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          structureSignature(prev.chapters as ChaptersProp[]) !==
          structureSignature(curr.chapters as ChaptersProp[])
        }
      >
        {({ getFieldValue }) => {
          const chapters = getFieldValue("chapters") as
            | ChaptersProp[]
            | undefined;
          return (
            <RightPaneBody
              chapters={chapters}
              selectedKey={selectedKey}
              onSelectNode={onSelectNode}
              isPreview={isPreview}
            />
          );
        }}
      </Form.Item>
    );
  }
);
