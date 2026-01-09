import { memo, useCallback } from "react";
import { Form, Input, Button, Card, Space } from "antd";
import { AuditOutlined } from "@ant-design/icons";
import { QuestionItem } from "./question-item";
import { PlusOutlined } from "@ant-design/icons";
interface Props {
  fieldKey: number;
  quizIndex: number;
  chapterIndex: number;
  lessonIndex: number;
  remove: (index: number | number[]) => void;
  isPreview?: boolean;
}
export const QuizItem = memo(
  ({
    quizIndex,
    remove,
    chapterIndex,
    lessonIndex,
    isPreview = false,
  }: Props) => {
    const onRemoveQuiz = useCallback(() => {
      remove(quizIndex);
    }, [remove, quizIndex]);
    return (
      <Card
        className="mb-6 shadow-sm border-blue-100"
        type="inner"
        title={
          <Space>
            <AuditOutlined className="text-blue-500" />
            <Form.Item
              name={[quizIndex, "title"]}
              noStyle
              rules={
                isPreview
                  ? []
                  : [
                      {
                        required: true,
                        message: "Tên bài kiểm tra là bắt buộc",
                      },
                    ]
              }
            >
              <Input
                variant="borderless"
                className="font-semibold text-lg min-w-[300px]"
                placeholder="Nhập tên bài kiểm tra..."
                disabled={isPreview}
                onBlur={(e) => {
                  e.target.value = e.target.value.trim();
                }}
              />
            </Form.Item>
          </Space>
        }
        extra={
          !isPreview && (
            <Button danger type="text" onClick={onRemoveQuiz}>
              Xóa Quiz
            </Button>
          )
        }
      >
        <Form.Item
          label="Tỉ lệ đạt (%)"
          name={[quizIndex, "examPassRate"]}
          initialValue={70}
          className="mb-6 w-48"
          rules={
            isPreview
              ? []
              : [
                  { required: true, message: "Nhập tỉ lệ đạt" },
                  {
                    pattern: /^(100|[0-9]{1,2})$/,
                    message: "Tỉ lệ phải từ 0 đến 100",
                  },
                ]
          }
        >
          <Input
            type="number"
            min={0}
            max={100}
            suffix="%"
            disabled={isPreview}
          />
        </Form.Item>

        <Form.List
          name={[quizIndex, "questions"]}
          rules={
            isPreview
              ? []
              : [
                  {
                    validator: async (_, questions) => {
                      if (!Array.isArray(questions) || questions.length === 0) {
                        throw new Error("Bài kiểm tra cần ít nhất 1 câu hỏi");
                      }
                    },
                  },
                ]
          }
        >
          {(qFields, { add, remove: removeQ }, meta) => (
            <div className="flex flex-col">
              {!isPreview && meta.errors.length > 0 && (
                <div className="mb-2">
                  <Form.ErrorList errors={meta.errors} />
                </div>
              )}
              {qFields.length === 0 && (
                <div className="text-center py-8 text-gray-400 border border-dashed rounded mb-4">
                  Chưa có câu hỏi nào
                </div>
              )}
              {qFields.map((qField) => (
                <div
                  key={qField.key}
                  id={`anchor-question-${chapterIndex}-${lessonIndex}-${quizIndex}-${qField.name}`}
                >
                  <QuestionItem
                    fieldKey={qField.key}
                    qIndex={qField.name}
                    remove={removeQ}
                    chapterIndex={chapterIndex}
                    lessonIndex={lessonIndex}
                    quizIndex={quizIndex}
                    totalQuestions={qFields.length}
                    isPreview={isPreview}
                  />
                </div>
              ))}
              {!isPreview && (
                <Button
                  size="large"
                  onClick={() =>
                    add({ title: "", type: "choice", options: [] })
                  }
                  icon={<PlusOutlined />}
                  className="mt-2 text-blue-600 border-blue-300 hover:border-blue-500"
                >
                  Thêm câu hỏi mới
                </Button>
              )}
            </div>
          )}
        </Form.List>
      </Card>
    );
  }
);
