import {
  Form,
  Typography,
  Divider,
  Collapse,
  Tag,
  Empty,
  List,
  Space,
} from "antd";
import {
  ClockCircleOutlined,
  CheckSquareOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";

import {
  getLessonIcon,
  getLessonTypeTag,
} from "../../../common/utils/ui-utils";

import { CourseInfoSection } from "../step-one/course-info-section";
import type { IChapter, ILesson, IQuiz } from "../../../common/types/types";
import { formatDuration } from "../../../common/utils/utils";

const CurriculumPreview = () => {
  const form = Form.useFormInstance();
  const chapters: IChapter[] = Form.useWatch("chapters", form) || [];
  if (chapters.length === 0) {
    return <Empty description="Chưa có nội dung nào được biên soạn" />;
  }

  const items = chapters.map((chapter, index) => ({
    key: index,
    label: (
      <div className="flex justify-between items-center font-semibold text-base py-1">
        <span>{chapter.title || `Chương ${index + 1} (Chưa đặt tên)`}</span>
        <span className="text-gray-400 text-sm font-normal">
          {chapter.lessons?.length || 0} bài học
        </span>
      </div>
    ),
    children: (
      <List
        itemLayout="vertical"
        dataSource={chapter.lessons || []}
        renderItem={(lesson: ILesson, lIdx) => (
          <List.Item className=" !py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2">
            <div className="flex items-start gap-3 px-2">
              {}
              <div className="mt-1 text-lg">{getLessonIcon(lesson.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 m-0">
                    {lesson.title || `Bài học ${lIdx + 1}`}
                  </h4>
                  <Space size={4}>
                    {getLessonTypeTag(lesson.type)}
                    <Tag icon={<ClockCircleOutlined />} className="mr-0">
                      {formatDuration(lesson.duration)}
                    </Tag>
                  </Space>
                </div>
                {}
                <div className="text-xs text-gray-400 mt-1">
                  {lesson.type === "video" &&
                    (lesson.videoUrl
                      ? `Link: ${lesson.videoUrl}`
                      : "Chưa nhập link video")}
                  {(lesson.type === "document" || lesson.type === "slide") &&
                    "Đã đính kèm file tài liệu"}
                </div>
                {}
                {lesson.quizzes && lesson.quizzes.length > 0 && (
                  <div className="mt-3 bg-indigo-50 rounded-md p-2">
                    <div className="text-xs font-bold text-indigo-600 mb-2 uppercase flex items-center gap-1">
                      <CheckSquareOutlined /> Bài kiểm tra (
                      {lesson.quizzes.length})
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-600 pl-1 space-y-1">
                      {lesson.quizzes.map((quiz: IQuiz, qIdx) => (
                        <li key={qIdx}>
                          {quiz.title}{" "}
                          <span className="text-gray-400 text-xs">
                            ({quiz.questions?.length || 0} câu hỏi)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
    ),
  }));

  return (
    <Collapse
      defaultActiveKey={[0]}
      ghost
      items={items}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      className="bg-white border border-gray-200 rounded-lg shadow-sm"
    />
  );
};

export const StepFourContent = () => {
  return (
    <div className="animate-fade-in pb-10">
      <CourseInfoSection readOnly={true} />
      <Divider className="my-8" />
      <div className="max-w-4xl mx-auto">
        <Typography.Title level={3} className="text-center mb-6 text-gray-700">
          Đề cương khóa học
        </Typography.Title>
        <CurriculumPreview />
      </div>
    </div>
  );
};
