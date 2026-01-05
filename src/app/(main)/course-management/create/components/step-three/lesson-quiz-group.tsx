import { memo } from "react";
import { Form, Button, Typography } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { QuizItem } from "./quiz-item";
interface Props {
  lessonIndex: number;
  chapterIndex: number;
  isPreview?: boolean;
}
const LessonTitle = memo(
  ({
    chapterIndex,
    lessonIndex,
  }: {
    chapterIndex: number;
    lessonIndex: number;
  }) => {
    const title = Form.useWatch([
      "chapters",
      chapterIndex,
      "lessons",
      lessonIndex,
      "title",
    ]);
    return (
      <div className="mb-6 pb-4 border-b border-gray-100">
        <Typography.Title level={4} className="text-gray-700 mb-1">
          Thiết lập bài kiểm tra
        </Typography.Title>
        <Typography.Text type="secondary">
          Đang chọn bài:{" "}
          <strong className="text-blue-600">
            {title || `Bài học ${lessonIndex + 1}`}
          </strong>
        </Typography.Text>
      </div>
    );
  }
);
export const LessonQuizGroup = memo(
  ({ lessonIndex, chapterIndex, isPreview = false }: Props) => {
    const quizzesPath = [
      "chapters",
      chapterIndex,
      "lessons",
      lessonIndex,
      "quizzes",
    ];
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <LessonTitle chapterIndex={chapterIndex} lessonIndex={lessonIndex} />

        <Form.List name={quizzesPath}>
          {(quizFields, { add, remove }) => (
            <>
              {quizFields.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                  <p className="text-gray-400 mb-4">
                    Bài học này chưa có bài kiểm tra nào.
                  </p>
                  {!isPreview && (
                    <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() =>
                        add({ title: "Bài kiểm tra số 1", questions: [] })
                      }
                    >
                      Tạo bài kiểm tra ngay
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {quizFields.map((field) => (
                    <div
                      key={field.key}
                      id={`anchor-quiz-${chapterIndex}-${lessonIndex}-${field.name}`}
                    >
                      <QuizItem
                        fieldKey={field.key}
                        quizIndex={field.name}
                        remove={remove}
                        chapterIndex={chapterIndex}
                        lessonIndex={lessonIndex}
                        isPreview={isPreview}
                      />
                    </div>
                  ))}
                  {!isPreview && (
                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        type="dashed"
                        block
                        icon={<PlusCircleOutlined />}
                        onClick={() =>
                          add({ title: "Bài kiểm tra bổ sung", questions: [] })
                        }
                        className="h-10 text-gray-500 hover:text-blue-500 hover:border-blue-500"
                      >
                        Thêm bài kiểm tra khác cho bài học này
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Form.List>
      </div>
    );
  }
);
