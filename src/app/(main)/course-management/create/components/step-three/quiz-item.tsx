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
}
export const QuizItem = memo(
  ({ quizIndex, remove, chapterIndex, lessonIndex }: Props) => {
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
              rules={[
                { required: true, message: "Tên bài kiểm tra là bắt buộc" },
              ]}
            >
              <Input
                variant="borderless"
                className="font-semibold text-lg min-w-[300px]"
                placeholder="Nhập tên bài kiểm tra..."
              />
            </Form.Item>
          </Space>
        }
        extra={
          <Button danger type="text" onClick={onRemoveQuiz}>
            Xóa Quiz
          </Button>
        }
      >
        
        <Form.List name={[quizIndex, "questions"]}>
          {(qFields, { add, remove: removeQ }) => (
            <div className="flex flex-col">
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
                  />
                </div>
              ))}
              <Button
                size="large"
                onClick={() =>
                  add({ title: "", type: "choice", options: [], score: 1 })
                }
                icon={<PlusOutlined />}
                className="mt-2 text-blue-600 border-blue-300 hover:border-blue-500"
              >
                Thêm câu hỏi mới
              </Button>
            </div>
          )}
        </Form.List>
      </Card>
    );
  }
);
